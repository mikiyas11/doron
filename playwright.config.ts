import { defineConfig, devices } from "@playwright/test";

/**
 * Each project runs against its own `next start` server with its own SQLite file
 * (`pnpm e2e` builds the app first):
 *   empty  — no database file at start (FR-2, AC schema creation)
 *   list   — the fixture Contacts in e2e/fixtures/contacts.ts (FR-1)
 *   large  — 2,000 Contacts loaded by `pnpm seed` (FR-3)
 *   add    — no database file at start; its tests add Contacts and view them (FR-7, FR-12)
 */
const servers = {
  empty: { port: 3100, db: "data/e2e/empty.db", prepare: "pnpm exec tsx scripts/e2e-db.ts reset" },
  list: { port: 3101, db: "data/e2e/list.db", prepare: "pnpm exec tsx scripts/e2e-db.ts fixture" },
  large: { port: 3102, db: "data/e2e/large.db", prepare: "pnpm exec tsx scripts/e2e-db.ts reset && pnpm seed 2000" },
  add: { port: 3103, db: "data/e2e/add.db", prepare: "pnpm exec tsx scripts/e2e-db.ts reset" },
} as const;

type ServerName = keyof typeof servers;

const baseURL = (name: ServerName) => `http://localhost:${servers[name].port}`;

export default defineConfig({
  testDir: "./e2e",
  testMatch: "*.spec.ts",
  fullyParallel: false,
  // One worker: the FR-3 timing test must not share the CPU with other browsers.
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: [["list"], ["./e2e/gate-reporter.ts"]],
  use: {
    trace: "retain-on-failure",
  },
  projects: (Object.keys(servers) as ServerName[]).map((name) => ({
    name,
    testMatch: `${name}.spec.ts`,
    use: { ...devices["Desktop Chrome"], baseURL: baseURL(name) },
  })),
  webServer: (Object.keys(servers) as ServerName[]).map((name) => ({
    command: `${servers[name].prepare} && pnpm exec next start -p ${servers[name].port}`,
    url: baseURL(name),
    env: { DATABASE_PATH: servers[name].db },
    reuseExistingServer: false,
    timeout: 120_000,
    stdout: "pipe" as const,
  })),
});
