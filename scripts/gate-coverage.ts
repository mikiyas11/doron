import fs from "node:fs";
import path from "node:path";

/** Acceptance-criterion ids look like `ac_` followed by a UUID. */
const CRITERION_ID = /ac_[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g;

export type TestOutcome = { title: string; status: "passed" | "failed" | "skipped" };

export function criteriaIn(title: string): string[] {
  return title.match(CRITERION_ID) ?? [];
}

/**
 * A criterion is proven when at least one passing test names it and no failing test does.
 * Skipped tests neither prove nor disprove.
 */
export function provenCriteria(outcomes: TestOutcome[]): string[] {
  const passed = new Set<string>();
  const failed = new Set<string>();
  for (const outcome of outcomes) {
    for (const id of criteriaIn(outcome.title)) {
      if (outcome.status === "passed") passed.add(id);
      else if (outcome.status === "failed") failed.add(id);
    }
  }
  return [...passed].filter((id) => !failed.has(id)).sort();
}

/**
 * Writes `{"criteria": [...]}` to the file named by E11_FOUNDRY_GATE_COVERAGE, merged with
 * whatever another reporter already wrote there. Does nothing when the variable is unset.
 */
export function writeGateCoverage(outcomes: TestOutcome[]): void {
  const file = process.env.E11_FOUNDRY_GATE_COVERAGE;
  if (!file) return;
  const criteria = new Set(provenCriteria(outcomes));
  if (fs.existsSync(file)) {
    try {
      const existing = JSON.parse(fs.readFileSync(file, "utf8")) as { criteria?: unknown };
      if (Array.isArray(existing.criteria)) {
        for (const id of existing.criteria) if (typeof id === "string") criteria.add(id);
      }
    } catch {
      // An unreadable file is replaced.
    }
  }
  fs.mkdirSync(path.dirname(path.resolve(file)), { recursive: true });
  fs.writeFileSync(file, JSON.stringify({ criteria: [...criteria].sort() }, null, 2) + "\n");
}
