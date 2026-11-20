import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { beforeEach, describe, expect, it } from "vitest";
import { getDb, openDatabase, type Db } from "../db";
import { createContact, getContact, insertContact, insertContacts, listContacts } from "./repository";
import type { PhoneLabel } from "./types";

const EMPTY = "ac_01a1fa1e-014d-744c-8c14-8e0a0158050c";
const SORTED = "ac_01a1fa1e-014d-713f-9a81-043f099238d8";
const ADD = "ac_01a1fa1e-0257-7f59-91be-7dccdf1a64ed";
const DETAILS = "ac_01a1fa1e-0257-7e29-9b3c-6ed74c80ccb1";
const NOT_FOUND = "ac_01a1fa1e-0257-7f8e-85c0-709dcbdd3b8d";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

// DATABASE_PATH is ":memory:" under Vitest (vitest.config.mts).
beforeEach(() => {
  getDb().exec("DELETE FROM contacts");
});

describe("listContacts", () => {
  it(`returns no Contacts for an empty database [${EMPTY}]`, () => {
    expect(listContacts()).toEqual([]);
  });

  it(`sorts by last name then first name, case- and accent-insensitively, first name when no last name [${SORTED}]`, () => {
    insertContacts([
      { firstName: "Émile", lastName: "Zola", phoneNumbers: [{ label: "mobile", number: "1" }] },
      { firstName: "José", lastName: "Álvarez", phoneNumbers: [{ label: "mobile", number: "2" }] },
      { firstName: "Bob", phoneNumbers: [{ label: "mobile", number: "3" }] },
      { firstName: "ana", lastName: "alvarez", phoneNumbers: [{ label: "mobile", number: "4" }] },
      { firstName: "barbara", lastName: "Brown", phoneNumbers: [{ label: "mobile", number: "5" }] },
      { firstName: "Zoë", lastName: "adams", phoneNumbers: [{ label: "mobile", number: "6" }] },
      { firstName: "Cher", lastName: "", phoneNumbers: [{ label: "mobile", number: "7" }] },
      { firstName: "jose", lastName: "ALVAREZ", phoneNumbers: [{ label: "mobile", number: "8" }] },
    ]);

    const names = listContacts().map((c) => [c.firstName, c.lastName]);
    expect(names.slice(0, 2)).toEqual([
      ["Zoë", "adams"],
      ["ana", "alvarez"],
    ]);
    // "José Álvarez" and "jose ALVAREZ" share a sort key, so they sit together (ordered by id).
    expect(names.slice(2, 4).map(([first]) => first).sort()).toEqual(["José", "jose"]);
    expect(names.slice(4)).toEqual([
      ["Bob", null],
      ["barbara", "Brown"],
      ["Cher", null],
      ["Émile", "Zola"],
    ]);
  });

  it(`gives each row its first Phone number with its Label [${SORTED}]`, () => {
    const id = insertContact({
      firstName: "Zoë",
      lastName: "Adams",
      phoneNumbers: [
        { label: "work", number: "+1 555 0100" },
        { label: "mobile", number: "555 0199" },
      ],
    });
    expect(listContacts()).toEqual([
      {
        id,
        firstName: "Zoë",
        lastName: "Adams",
        sortKey: "adams zoe",
        firstPhone: { label: "work", number: "+1 555 0100" },
      },
    ]);
  });

  it(`assigns UUID ids used in /contacts/[id] links [${SORTED}]`, () => {
    const id = insertContact({ firstName: "Ann", phoneNumbers: [{ label: "home", number: "123" }] });
    expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
    expect(listContacts()[0].id).toBe(id);
  });

  it("returns a null first phone for a Contact without Phone numbers", () => {
    insertContact({ firstName: "Nobody", phoneNumbers: [] });
    expect(listContacts()[0].firstPhone).toBeNull();
  });

  it("stores the digits of each Phone number and deletes them with their Contact", () => {
    const id = insertContact({ firstName: "Ann", phoneNumbers: [{ label: "home", number: "(555) 012-3456" }] });
    const db = getDb();
    expect(db.prepare("SELECT digits FROM phone_numbers WHERE contact_id = ?").pluck().get(id)).toBe("5550123456");
    db.prepare("DELETE FROM contacts WHERE id = ?").run(id);
    expect(db.prepare("SELECT COUNT(*) FROM phone_numbers").pluck().get()).toBe(0);
  });
});

describe("createContact", () => {
  it(`stores the Contact with a UUID, and it appears in its sorted place [${ADD}]`, () => {
    insertContacts([
      { firstName: "Alan", lastName: "Turing", phoneNumbers: [{ label: "mobile", number: "555 0001" }] },
      { firstName: "Grace", lastName: "Hopper", phoneNumbers: [{ label: "mobile", number: "555 0002" }] },
    ]);
    const id = createContact({ firstName: "Ada", lastName: "Lovelace", phoneNumbers: [{ label: "mobile", number: "555 0100" }] });
    expect(id).toMatch(UUID);
    expect(listContacts().map((c) => c.firstName)).toEqual(["Grace", "Ada", "Alan"]);
  });

  it(`stores each Phone number's digits and entered position [${ADD}]`, () => {
    const id = createContact({
      firstName: "Ada",
      phoneNumbers: [
        { label: "work", number: "+44 (20) 7946-0958" },
        { label: "home", number: "020.7946.0000" },
        { label: "other", number: "123" },
      ],
    });
    const rows = getDb()
      .prepare("SELECT label, number, digits, position FROM phone_numbers WHERE contact_id = ? ORDER BY position")
      .all(id);
    expect(rows).toEqual([
      { label: "work", number: "+44 (20) 7946-0958", digits: "442079460958", position: 0 },
      { label: "home", number: "020.7946.0000", digits: "02079460000", position: 1 },
      { label: "other", number: "123", digits: "123", position: 2 },
    ]);
  });

  it(`stores nothing when a Phone number cannot be written [${ADD}]`, () => {
    expect(() =>
      createContact({
        firstName: "Ada",
        // A Label the database refuses: the whole Contact must roll back.
        phoneNumbers: [{ label: "fax" as unknown as PhoneLabel, number: "555 0100" }],
      }),
    ).toThrow();
    expect(listContacts()).toEqual([]);
  });

  it(`keeps a created Contact after the app restarts [${ADD}]`, () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "phone-book-"));
    const file = path.join(dir, "restart.db");
    const holder = globalThis as typeof globalThis & { __phoneBookDb?: Db };
    const memory = holder.__phoneBookDb;
    try {
      holder.__phoneBookDb = openDatabase(file);
      const id = createContact({ firstName: "Ada", lastName: "Lovelace", phoneNumbers: [{ label: "home", number: "555 0100" }] });
      holder.__phoneBookDb.close();

      // A new process opens the same file.
      holder.__phoneBookDb = openDatabase(file);
      expect(listContacts().map((c) => c.id)).toEqual([id]);
      expect(getContact(id)?.phoneNumbers).toEqual([{ label: "home", number: "555 0100" }]);
      holder.__phoneBookDb.close();
    } finally {
      holder.__phoneBookDb = memory;
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });
});

describe("getContact", () => {
  it(`returns every stored field and the Phone numbers in entered order [${DETAILS}]`, () => {
    const id = createContact({
      firstName: "Ada",
      lastName: "Lovelace",
      email: "ada@example.com",
      address: "12 St James's Square\nLondon",
      notes: "Mathematician",
      phoneNumbers: [
        { label: "work", number: "+44 20 7946 0958" },
        { label: "mobile", number: "07700 900123" },
      ],
    });
    const contact = getContact(id);
    expect(contact).toMatchObject({
      id,
      firstName: "Ada",
      lastName: "Lovelace",
      email: "ada@example.com",
      address: "12 St James's Square\nLondon",
      notes: "Mathematician",
      phoneNumbers: [
        { label: "work", number: "+44 20 7946 0958" },
        { label: "mobile", number: "07700 900123" },
      ],
    });
    expect(contact?.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    expect(contact?.updatedAt).toBe(contact?.createdAt);
  });

  it(`stores empty optional fields as null [${DETAILS}]`, () => {
    const id = createContact({
      firstName: "Bob",
      lastName: "",
      email: "",
      address: "",
      notes: "",
      phoneNumbers: [{ label: "mobile", number: "555 0100" }],
    });
    expect(getContact(id)).toMatchObject({ lastName: null, email: null, address: null, notes: null });
  });

  it(`returns null for an id that does not exist [${NOT_FOUND}]`, () => {
    expect(getContact("00000000-0000-4000-8000-000000000000")).toBeNull();
    expect(getContact("not-a-uuid")).toBeNull();
  });
});
