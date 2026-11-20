/**
 * Prepares the database of an e2e server (see playwright.config.ts).
 *   tsx scripts/e2e-db.ts reset    removes the database file at DATABASE_PATH, so the app starts with none
 *   tsx scripts/e2e-db.ts fixture  resets, then loads e2e/fixtures/contacts.ts
 */
import fs from "node:fs";
import { FIXTURE_CONTACTS } from "../e2e/fixtures/contacts";
import { insertContacts } from "../src/lib/contacts/repository";

const mode = process.argv[2];
const file = process.env.DATABASE_PATH;

if (!file || file === ":memory:" || !file.includes("e2e")) {
  // Refuse to delete anything but an e2e database.
  console.error(`DATABASE_PATH must name an e2e database file, got "${file ?? ""}"`);
  process.exit(1);
}
if (mode !== "reset" && mode !== "fixture") {
  console.error("Usage: tsx scripts/e2e-db.ts reset|fixture");
  process.exit(1);
}

for (const suffix of ["", "-wal", "-shm"]) {
  fs.rmSync(`${file}${suffix}`, { force: true });
}

if (mode === "fixture") {
  // The repository opens its connection lazily, so this creates a fresh file.
  insertContacts(FIXTURE_CONTACTS);
  console.log(`Loaded ${FIXTURE_CONTACTS.length} fixture Contacts into ${file}`);
} else {
  console.log(`Removed ${file}`);
}
