import fs from "node:fs";
import Database from "better-sqlite3";
import { expect, test } from "@playwright/test";
import { expectNoHorizontalScroll } from "./helpers";

const EMPTY = "ac_01a1fa1e-014d-744c-8c14-8e0a0158050c";
const SCHEMA = "ac_01a1fa1e-014d-706d-8ab9-fe25b3adf977";
const NARROW = "ac_01a1fa1e-014d-7ab6-ad82-41cc52705222";

// This server started after scripts/e2e-db.ts removed its database file (playwright.config.ts).
const DB_FILE = "data/e2e/empty.db";

test(`an empty Phone book says there are no Contacts yet and links to Add Contact [${EMPTY}]`, async ({ page }) => {
  await page.goto("/");
  const empty = page.getByRole("region", { name: "No Contacts yet" });
  await expect(empty).toBeVisible();
  await expect(empty.getByRole("heading", { name: "No Contacts yet" })).toBeVisible();
  const add = empty.getByRole("link", { name: "Add Contact" });
  await expect(add).toBeVisible();
  await expect(add).toHaveAttribute("href", "/contacts/new");
  await expect(page.getByRole("navigation", { name: "Contacts" })).toHaveCount(0);
});

test(`the app creates the contacts and phone_numbers tables in the database at DATABASE_PATH [${SCHEMA}]`, async ({
  page,
}) => {
  await page.goto("/");
  expect(fs.existsSync(DB_FILE)).toBe(true);
  const db = new Database(DB_FILE, { readonly: true, fileMustExist: true });
  try {
    const tables = db
      .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name")
      .pluck()
      .all();
    expect(tables).toEqual(["contacts", "phone_numbers"]);
    expect(db.prepare("SELECT COUNT(*) FROM contacts").pluck().get()).toBe(0);
  } finally {
    db.close();
  }
});

test(`the empty state has no horizontal scrolling at 360 px [${NARROW}]`, async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "No Contacts yet" })).toBeVisible();
  await expectNoHorizontalScroll(page);
});
