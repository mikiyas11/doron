import { describe, expect, it } from "vitest";
import { fullName, groupByInitial, initialLetter, mailtoHref, telHref } from "./display";
import { sortKey } from "./normalize";
import type { ContactListItem } from "./types";

const SORTED = "ac_01a1fa1e-014d-713f-9a81-043f099238d8";

function item(firstName: string, lastName: string | null = null): ContactListItem {
  return { id: firstName, firstName, lastName, sortKey: sortKey(firstName, lastName), firstPhone: null };
}

describe("fullName", () => {
  it(`shows first name then last name [${SORTED}]`, () => {
    expect(fullName({ firstName: "José", lastName: "Álvarez" })).toBe("José Álvarez");
    expect(fullName({ firstName: "Cher", lastName: null })).toBe("Cher");
  });
});

describe("telHref and mailtoHref", () => {
  const DETAILS = "ac_01a1fa1e-0257-7e29-9b3c-6ed74c80ccb1";

  it(`builds tel: links from the digits, keeping a leading + [${DETAILS}]`, () => {
    expect(telHref("+1 (555) 012-3456")).toBe("tel:+15550123456");
    expect(telHref("020.7946.0958")).toBe("tel:02079460958");
    expect(telHref(" +44 20 7946 0958 ")).toBe("tel:+442079460958");
  });

  it(`builds mailto: links [${DETAILS}]`, () => {
    expect(mailtoHref("ada@example.com")).toBe("mailto:ada@example.com");
  });
});

describe("initialLetter", () => {
  it(`uses the accent-free upper-case initial, or # [${SORTED}]`, () => {
    expect(initialLetter(sortKey("Émile", "Zola"))).toBe("Z");
    expect(initialLetter(sortKey("Émile"))).toBe("E");
    expect(initialLetter(sortKey("2Pac"))).toBe("#");
    expect(initialLetter(sortKey("ደጀኔ"))).toBe("#");
  });
});

describe("groupByInitial", () => {
  it(`groups a sorted list under initial-letter headings in order, # last [${SORTED}]`, () => {
    const groups = groupByInitial([
      item("Zoë", "Adams"),
      item("ana", "alvarez"),
      item("Bob"),
      item("Émile"),
      item("Émile", "Zola"),
      item("ደጀኔ"),
    ]);
    expect(groups.map((g) => [g.letter, g.contacts.map((c) => c.firstName)])).toEqual([
      ["A", ["Zoë", "ana"]],
      ["B", ["Bob"]],
      ["E", ["Émile"]],
      ["Z", ["Émile"]],
      ["#", ["ደጀኔ"]],
    ]);
  });

  it("returns no groups for no Contacts", () => {
    expect(groupByInitial([])).toEqual([]);
  });
});
