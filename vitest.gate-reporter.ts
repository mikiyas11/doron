import type { Reporter, TestModule } from "vitest/node";
import { writeGateCoverage, type TestOutcome } from "./scripts/gate-coverage";

/** Reports the acceptance criteria named by passing Vitest tests (see scripts/gate-coverage.ts). */
export default class GateCoverageReporter implements Reporter {
  onTestRunEnd(testModules: ReadonlyArray<TestModule>): void {
    const outcomes: TestOutcome[] = [];
    for (const testModule of testModules) {
      for (const test of testModule.children.allTests()) {
        const state = test.result().state;
        outcomes.push({
          title: test.fullName,
          status: state === "passed" ? "passed" : state === "failed" ? "failed" : "skipped",
        });
      }
    }
    writeGateCoverage(outcomes);
  }
}
