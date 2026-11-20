import { describe, expect, it } from "vitest";
import { phoneDigits, searchName, sortKey, textKey } from "./normalize";

const SORTED = "ac_01a1fa1e-014d-713f-9a81-043f099238d8";

describe("textKey", () => {
  it(`strips accents, lower-cases and trims so "José" sorts with "jose" [${SORTED}]`, () => {
    expect(textKey("José")).toBe("jose");
    expect(textKey("  JOSÉ ")).toBe("jose");
    expect(textKey("Émile Zoë")).toBe("emile zoe");
    expect(textKey("Ñúñez")).toBe("nunez");
  });

  it("keeps letters that have no accent to strip", () => {
    expect(textKey("Абебе")).toBe("абебе");
    expect(textKey("ደጀኔ")).toBe("ደጀኔ");
  });
});

describe("sortKey", () => {
  it(`is last name then first name, case- and accent-insensitive [${SORTED}]`, () => {
    expect(sortKey("José", "Álvarez")).toBe("alvarez jose");
    expect(sortKey("jose", "alvarez")).toBe(sortKey("José", "Álvarez"));
  });

  it(`uses the first name when there is no last name [${SORTED}]`, () => {
    expect(sortKey("Bob")).toBe("bob bob");
    expect(sortKey("Bob", null)).toBe("bob bob");
    expect(sortKey("Bob", "  ")).toBe("bob bob");
  });

  it(`orders a shorter last name before a longer one that extends it [${SORTED}]`, () => {
    expect(sortKey("Zed", "Smith") < sortKey("Al", "Smithson")).toBe(true);
  });
});

describe("phoneDigits", () => {
  it("keeps digits only", () => {
    expect(phoneDigits("+1 (555) 012-3456")).toBe("15550123456");
    expect(phoneDigits("555.01")).toBe("55501");
    expect(phoneDigits("abc")).toBe("");
  });
});

describe("searchName", () => {
  it("joins first and last name as a text key", () => {
    expect(searchName("José", "Álvarez")).toBe("jose alvarez");
    expect(searchName("Cher")).toBe("cher");
  });
});
