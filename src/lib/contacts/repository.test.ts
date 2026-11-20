import { beforeEach, describe, expect, it } from "vitest";
import { getDb } from "../db";
import { insertContact, insertContacts, listContacts } from "./repository";

const EMPTY = "ac_01a1fa1e-014d-744c-8c14-8e0a0158050c";
const SORTED = "ac_01a1fa1e-014d-713f-9a81-043f099238d8";

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
