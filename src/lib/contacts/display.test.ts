import { describe, expect, it } from "vitest";
import { fullName, groupByInitial, initialLetter } from "./display";
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
