import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { DEFAULT_DATABASE_PATH, openDatabase, resolveDatabasePath, type Db } from "./db";

const SCHEMA = "ac_01a1fa1e-014d-706d-8ab9-fe25b3adf977";

const opened: Db[] = [];
const tempDirs: string[] = [];

afterEach(() => {
  for (const db of opened.splice(0)) db.close();
  for (const dir of tempDirs.splice(0)) fs.rmSync(dir, { recursive: true, force: true });
});

function tempPath(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "phonebook-"));
  tempDirs.push(dir);
  return path.join(dir, "nested", "phonebook.db");
}

function tables(db: Db): string[] {
  return db
    .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name")
    .pluck()
    .all() as string[];
}

describe("openDatabase", () => {
  it(`creates the file, its folder, and the contacts and phone_numbers tables when no file exists [${SCHEMA}]`, () => {
    const file = tempPath();
    expect(fs.existsSync(file)).toBe(false);

    const db = openDatabase(file);
    opened.push(db);

    expect(fs.existsSync(file)).toBe(true);
    expect(tables(db)).toEqual(["contacts", "phone_numbers"]);
    expect(db.pragma("journal_mode", { simple: true })).toBe("wal");
    expect(db.pragma("foreign_keys", { simple: true })).toBe(1);
  });

  it(`applies the schema idempotently and keeps existing rows [${SCHEMA}]`, () => {
    const file = tempPath();
    const first = openDatabase(file);
    first
      .prepare(
        "INSERT INTO contacts (id, first_name, sort_key, search_name, created_at, updated_at) VALUES ('x', 'A', 'a a', 'a', 't', 't')",
      )
      .run();
    first.close();

    const second = openDatabase(file);
    opened.push(second);
    expect(tables(second)).toEqual(["contacts", "phone_numbers"]);
    expect(second.prepare("SELECT COUNT(*) FROM contacts").pluck().get()).toBe(1);
  });

  it(`defaults DATABASE_PATH to ./data/phonebook.db [${SCHEMA}]`, () => {
    expect(DEFAULT_DATABASE_PATH).toBe("./data/phonebook.db");
    expect(resolveDatabasePath({} as NodeJS.ProcessEnv)).toBe("./data/phonebook.db");
    expect(resolveDatabasePath({ NODE_ENV: "test", DATABASE_PATH: "/tmp/x.db" } as NodeJS.ProcessEnv)).toBe("/tmp/x.db");
  });

  it(`git-ignores the data/ folder [${SCHEMA}]`, () => {
    const lines = fs
      .readFileSync(path.join(process.cwd(), ".gitignore"), "utf8")
      .split("\n")
      .map((line) => line.trim());
    expect(lines).toContain("/data/");
  });
});
