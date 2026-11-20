import { describe, expect, it } from "vitest";
import { provenCriteria } from "./gate-coverage";

const A = "ac_00000000-0000-0000-0000-00000000000a";
const B = "ac_00000000-0000-0000-0000-00000000000b";

describe("gate coverage", () => {
  it("counts criteria named only by passing tests", () => {
    expect(
      provenCriteria([
        { title: `x [${A}]`, status: "passed" },
        { title: `y [${B}]`, status: "passed" },
        { title: `z [${B}]`, status: "failed" },
        { title: "no id", status: "passed" },
      ]),
    ).toEqual([A]);
  });

  it("ignores skipped tests", () => {
    expect(provenCriteria([{ title: `x [${A}]`, status: "skipped" }])).toEqual([]);
  });
});
