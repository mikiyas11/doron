import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getDb } from "@/lib/db";
import { getContact, listContacts } from "@/lib/contacts/repository";
import { MESSAGES, SAVE_FAILED_MESSAGE } from "@/lib/contacts/schema";
import { createContact } from "./actions";

const ADD = "ac_01a1fa1e-0257-7f59-91be-7dccdf1a64ed";
const INVALID = "ac_01a1fa1e-0257-795f-82dd-71ef4f55259b";
const SAVE_FAILS = "ac_01a1fa1e-0257-756c-be53-379e62022095";

const mocks = vi.hoisted(() => ({
  // Like Next's redirect(), ends the action by throwing.
  redirect: vi.fn((url: string): never => {
    throw new Error(`NEXT_REDIRECT ${url}`);
  }),
  revalidatePath: vi.fn(),
  failSaves: false,
}));

vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("@/lib/contacts/repository", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/contacts/repository")>();
  return {
    ...actual,
    createContact: (...args: Parameters<typeof actual.createContact>) => {
      if (mocks.failSaves) throw new Error("SQLITE_IOERR: disk I/O error");
      return actual.createContact(...args);
    },
  };
});

function form(fields: Record<string, string | string[]>): FormData {
  const formData = new FormData();
  for (const [name, value] of Object.entries(fields)) {
    for (const item of Array.isArray(value) ? value : [value]) formData.append(name, item);
  }
  return formData;
}

beforeEach(() => {
  getDb().exec("DELETE FROM contacts");
  mocks.redirect.mockClear();
  mocks.revalidatePath.mockClear();
  mocks.failSaves = false;
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("createContact action", () => {
  it(`stores a valid Contact, revalidates the list and redirects to /contacts/[id] [${ADD}]`, async () => {
    await expect(
      createContact(
        null,
        form({
          firstName: " Ada ",
          lastName: "Lovelace",
          email: "",
          address: "",
          notes: "",
          phoneLabel: ["work", "mobile"],
          phoneNumber: ["+44 20 7946 0958", "07700 900123"],
        }),
      ),
    ).rejects.toThrow("NEXT_REDIRECT");

    const [contact] = listContacts();
    expect(contact).toMatchObject({ firstName: "Ada", lastName: "Lovelace" });
    expect(mocks.redirect).toHaveBeenCalledWith(`/contacts/${contact.id}`);
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/");
    expect(getContact(contact.id)?.phoneNumbers).toEqual([
      { label: "work", number: "+44 20 7946 0958" },
      { label: "mobile", number: "07700 900123" },
    ]);
  });

  it(`refuses invalid input with a message per bad field and echoes every value [${INVALID}]`, async () => {
    const typed = {
      firstName: "",
      lastName: "x".repeat(101),
      email: "not-an-email",
      address: "a".repeat(301),
      notes: "n".repeat(2001),
      phoneLabel: ["home", "work"],
      phoneNumber: ["555 0100", "12"],
    };
    const result = await createContact(null, form(typed));

    expect(result).toEqual({
      ok: false,
      fieldErrors: {
        firstName: MESSAGES.firstNameRequired,
        lastName: MESSAGES.lastNameTooLong,
        email: MESSAGES.email,
        address: MESSAGES.addressTooLong,
        notes: MESSAGES.notesTooLong,
        "phoneNumbers.1.number": MESSAGES.phoneNumber,
      },
      values: {
        firstName: "",
        lastName: typed.lastName,
        email: "not-an-email",
        address: typed.address,
        notes: typed.notes,
        phoneNumbers: [
          { label: "home", number: "555 0100" },
          { label: "work", number: "12" },
        ],
      },
    });
    expect(listContacts()).toEqual([]);
    expect(mocks.redirect).not.toHaveBeenCalled();
  });

  it(`returns "Could not save. Try again." with every value when the save fails [${SAVE_FAILS}]`, async () => {
    mocks.failSaves = true;
    const logged = vi.spyOn(console, "error").mockImplementation(() => {});
    const result = await createContact(
      null,
      form({
        firstName: "Ada",
        lastName: "Lovelace",
        email: "ada@example.com",
        address: "London",
        notes: "Mathematician",
        phoneLabel: "home",
        phoneNumber: "555 0100",
      }),
    );

    expect(result).toEqual({
      ok: false,
      formError: SAVE_FAILED_MESSAGE,
      values: {
        firstName: "Ada",
        lastName: "Lovelace",
        email: "ada@example.com",
        address: "London",
        notes: "Mathematician",
        phoneNumbers: [{ label: "home", number: "555 0100" }],
      },
    });
    expect(SAVE_FAILED_MESSAGE).toBe("Could not save. Try again.");
    expect(logged).toHaveBeenCalled();
    expect(mocks.redirect).not.toHaveBeenCalled();
    expect(listContacts()).toEqual([]);
  });
});
