import type { Reporter, TestCase } from "@playwright/test/reporter";
import { writeGateCoverage, type TestOutcome } from "../scripts/gate-coverage";

/** Reports the acceptance criteria named by passing Playwright tests (see scripts/gate-coverage.ts). */
export default class GateCoverageReporter implements Reporter {
  private readonly tests = new Map<string, TestCase>();

  onTestEnd(test: TestCase): void {
    this.tests.set(test.id, test);
  }

  onEnd(): void {
    const outcomes: TestOutcome[] = [...this.tests.values()].map((test) => {
      const outcome = test.outcome();
      return {
        title: test.titlePath().join(" > "),
        status: outcome === "expected" ? "passed" : outcome === "skipped" ? "skipped" : "failed",
      };
    });
    writeGateCoverage(outcomes);
  }

  printsToStdio(): boolean {
    return false;
  }
}
