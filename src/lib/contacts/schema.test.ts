import { describe, expect, it } from "vitest";
import {
  contactFormValues,
  isValidPhoneNumber,
  MESSAGES,
  validateContactInput,
  type ContactInput,
} from "./schema";

const ADD = "ac_01a1fa1e-0257-7f59-91be-7dccdf1a64ed";
const PHONES = "ac_01a1fa1e-0257-75f6-ae89-04c15b75c756";
const INVALID = "ac_01a1fa1e-0257-795f-82dd-71ef4f55259b";

function input(overrides: Partial<ContactInput> = {}): ContactInput {
  return {
    firstName: "Ada",
    lastName: "",
    email: "",
    address: "",
    notes: "",
    phoneNumbers: [{ label: "mobile", number: "555 0100" }],
    ...overrides,
  };
}

function errorsOf(value: ContactInput): Record<string, string> {
  const result = validateContactInput(value);
  return result.success ? {} : result.fieldErrors;
}

describe("contactInputSchema", () => {
  it(`accepts a first name and one valid Phone number, trimming text [${ADD}]`, () => {
    const result = validateContactInput(input({ firstName: "  Ada ", lastName: " Lovelace " }));
    expect(result).toEqual({
      success: true,
      data: {
        firstName: "Ada",
        lastName: "Lovelace",
        email: "",
        address: "",
        notes: "",
        phoneNumbers: [{ label: "mobile", number: "555 0100" }],
      },
    });
  });

  it(`accepts 1 to 5 Phone numbers labelled Mobile, Home, Work or Other [${PHONES}]`, () => {
    const labels = ["mobile", "home", "work", "other", "mobile"];
    for (let count = 1; count <= 5; count++) {
      const phoneNumbers = labels.slice(0, count).map((label, i) => ({ label, number: `555 010${i}` }));
      expect(validateContactInput(input({ phoneNumbers })).success).toBe(true);
    }
  });

  it(`refuses no Phone number, more than 5, and an unknown Label [${PHONES}]`, () => {
    expect(errorsOf(input({ phoneNumbers: [] }))).toEqual({ phoneNumbers: MESSAGES.tooFewPhoneNumbers });
    const six = Array.from({ length: 6 }, (_, i) => ({ label: "mobile", number: `555 010${i}` }));
    expect(errorsOf(input({ phoneNumbers: six }))).toEqual({ phoneNumbers: MESSAGES.tooManyPhoneNumbers });
    expect(errorsOf(input({ phoneNumbers: [{ label: "fax", number: "555 0100" }] }))).toEqual({
      "phoneNumbers.0.label": MESSAGES.phoneLabel,
    });
  });

  it(`refuses an empty or blank first name [${INVALID}]`, () => {
    expect(errorsOf(input({ firstName: "" }))).toEqual({ firstName: MESSAGES.firstNameRequired });
    expect(errorsOf(input({ firstName: "   " }))).toEqual({ firstName: MESSAGES.firstNameRequired });
  });

  it(`accepts Phone numbers of an optional + and 3 to 15 digits, ignoring spaces, dashes, dots and brackets [${INVALID}]`, () => {
    for (const ok of ["123", "+1 (555) 012-3456", "555.0100", "+123456789012345", "020 7946 0958"]) {
      expect(isValidPhoneNumber(ok), ok).toBe(true);
    }
    for (const bad of ["", "12", "+12", "1234567890123456", "555-CALL", "++123", "12+34", "555/0100"]) {
      expect(isValidPhoneNumber(bad), bad).toBe(false);
    }
  });

  it(`reports each bad Phone number at its own position [${INVALID}]`, () => {
    const errors = errorsOf(
      input({
        phoneNumbers: [
          { label: "mobile", number: "555 0100" },
          { label: "home", number: "12" },
          { label: "work", number: "abc" },
        ],
      }),
    );
    expect(errors).toEqual({
      "phoneNumbers.1.number": MESSAGES.phoneNumber,
      "phoneNumbers.2.number": MESSAGES.phoneNumber,
    });
  });

  it(`accepts an empty Email or one of the form name@domain, and refuses others [${INVALID}]`, () => {
    expect(validateContactInput(input({ email: "" })).success).toBe(true);
    expect(validateContactInput(input({ email: "ada@example.com" })).success).toBe(true);
    for (const bad of ["ada", "ada@", "@example.com", "ada@@example.com", "ada lovelace@example.com"]) {
      expect(errorsOf(input({ email: bad })), bad).toEqual({ email: MESSAGES.email });
    }
  });

  it(`enforces the length limits: names 100, Address 300, Notes 2,000 [${INVALID}]`, () => {
    expect(
      validateContactInput(
        input({ firstName: "a".repeat(100), lastName: "b".repeat(100), address: "c".repeat(300), notes: "d".repeat(2000) }),
      ).success,
    ).toBe(true);
    expect(
      errorsOf(input({ firstName: "a".repeat(101), lastName: "b".repeat(101), address: "c".repeat(301), notes: "d".repeat(2001) })),
    ).toEqual({
      firstName: MESSAGES.firstNameTooLong,
      lastName: MESSAGES.lastNameTooLong,
      address: MESSAGES.addressTooLong,
      notes: MESSAGES.notesTooLong,
    });
  });
});

describe("contactFormValues", () => {
  it(`reads every field as typed, with Phone numbers in form order [${ADD}]`, () => {
    const formData = new FormData();
    formData.set("firstName", " Ada ");
    formData.set("lastName", "Lovelace");
    formData.set("email", "ada@example.com");
    formData.set("address", "12 St James's Square");
    formData.set("notes", "Mathematician");
    formData.append("phoneLabel", "work");
    formData.append("phoneNumber", "+44 20 7946 0958");
    formData.append("phoneLabel", "home");
    formData.append("phoneNumber", "020 7946 0000");
    expect(contactFormValues(formData)).toEqual({
      firstName: " Ada ",
      lastName: "Lovelace",
      email: "ada@example.com",
      address: "12 St James's Square",
      notes: "Mathematician",
      phoneNumbers: [
        { label: "work", number: "+44 20 7946 0958" },
        { label: "home", number: "020 7946 0000" },
      ],
    });
  });

  it("reads missing fields as empty", () => {
    expect(contactFormValues(new FormData())).toEqual({
      firstName: "",
      lastName: "",
      email: "",
      address: "",
      notes: "",
      phoneNumbers: [],
    });
  });
});
