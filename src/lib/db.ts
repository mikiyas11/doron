import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";

/**
 * The SQLite connection (AD-6). Only `src/lib/contacts/repository.ts` may import this module (AD-1).
 */

export type Db = Database.Database;

export const DEFAULT_DATABASE_PATH = "./data/phonebook.db";

const SCHEMA = `
CREATE TABLE IF NOT EXISTS contacts (
  id TEXT PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT,
  email TEXT,
  address TEXT,
  notes TEXT,
  sort_key TEXT NOT NULL,
  search_name TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS contacts_sort_key_idx ON contacts (sort_key, id);

CREATE TABLE IF NOT EXISTS phone_numbers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  contact_id TEXT NOT NULL REFERENCES contacts (id) ON DELETE CASCADE,
  label TEXT NOT NULL CHECK (label IN ('mobile', 'home', 'work', 'other')),
  number TEXT NOT NULL,
  digits TEXT NOT NULL,
  position INTEGER NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS phone_numbers_contact_position_idx ON phone_numbers (contact_id, position);
CREATE INDEX IF NOT EXISTS phone_numbers_digits_idx ON phone_numbers (digits);
`;

export function resolveDatabasePath(env: NodeJS.ProcessEnv = process.env): string {
  return env.DATABASE_PATH || DEFAULT_DATABASE_PATH;
}

/** Opens a connection and applies the schema idempotently. Creates the file and its folder when missing. */
export function openDatabase(file: string = resolveDatabasePath()): Db {
  if (file !== ":memory:") {
    fs.mkdirSync(path.dirname(path.resolve(file)), { recursive: true });
  }
  const db = new Database(file);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  db.exec(SCHEMA);
  return db;
}

// Kept on globalThis so `next dev` hot reloads reuse one connection.
const globalForDb = globalThis as typeof globalThis & { __phoneBookDb?: Db };

/** The one shared connection, opened on first use. */
export function getDb(): Db {
  if (!globalForDb.__phoneBookDb) {
    globalForDb.__phoneBookDb = openDatabase();
  }
  return globalForDb.__phoneBookDb;
}
