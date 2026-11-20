/**
 * `pnpm seed [count]`: inserts `count` realistic Contacts (default 2,000) through the repository
 * into the database at DATABASE_PATH (default ./data/phonebook.db). Used for FR-3 checks.
 */
import { insertContacts } from "../src/lib/contacts/repository";
import { generateContacts } from "./seed-data";

const arg = process.argv.slice(2).find((a) => a !== "--");
const count = arg === undefined ? 2000 : Number(arg);

if (!Number.isInteger(count) || count < 0) {
  console.error(`Usage: pnpm seed [count]  (count must be a whole number, got "${arg}")`);
  process.exit(1);
}

// A different seed per run, so running it twice adds different Contacts.
const ids = insertContacts(generateContacts(count, Date.now()));
console.log(`Seeded ${ids.length} Contacts into ${process.env.DATABASE_PATH || "./data/phonebook.db"}`);
