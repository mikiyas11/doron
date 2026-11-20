import { describe, expect, it } from "vitest";
import { generateContacts } from "./seed-data";

// The FR-3 criterion itself is proven by e2e/large.spec.ts against a database loaded by `pnpm seed`.
describe("generateContacts", () => {
  it("generates 2,000 Contacts, each with a first name and 1–3 Phone numbers", () => {
    const contacts = generateContacts(2000);
    expect(contacts).toHaveLength(2000);
    for (const contact of contacts) {
      expect(contact.firstName.length).toBeGreaterThan(0);
      expect(contact.phoneNumbers.length).toBeGreaterThanOrEqual(1);
      expect(contact.phoneNumbers.length).toBeLessThanOrEqual(3);
      expect(contact.phoneNumbers[0].label).toBe("mobile");
    }
    expect(contacts.some((c) => c.lastName === null)).toBe(true);
  });

  it("is deterministic for a given seed", () => {
    expect(generateContacts(5, 1)).toEqual(generateContacts(5, 1));
  });
});
