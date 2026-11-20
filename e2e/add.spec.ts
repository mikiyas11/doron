import Database from "better-sqlite3";
import { expect, test, type Page } from "@playwright/test";

const ADD = "ac_01a1fa1e-0257-7f59-91be-7dccdf1a64ed";
const PHONES = "ac_01a1fa1e-0257-75f6-ae89-04c15b75c756";
const INVALID = "ac_01a1fa1e-0257-795f-82dd-71ef4f55259b";
const DETAILS = "ac_01a1fa1e-0257-7e29-9b3c-6ed74c80ccb1";
const NOT_FOUND = "ac_01a1fa1e-0257-7f8e-85c0-709dcbdd3b8d";
const SAVE_FAILS = "ac_01a1fa1e-0257-756c-be53-379e62022095";
const A11Y = "ac_01a1fa1e-0257-7892-b915-2ff7192ece90";

// This server started with no database file (playwright.config.ts, project "add").
const DB_FILE = "data/e2e/add.db";
const DETAILS_URL = /\/contacts\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

type NewContact = {
  firstName: string;
  lastName?: string;
  phones: { label?: string; number: string }[];
  email?: string;
  address?: string;
  notes?: string;
};

const contactForm = (page: Page) => page.getByRole("form", { name: "Contact" });
const field = (page: Page, label: string) => page.getByLabel(label, { exact: true });

async function fillContactForm(page: Page, contact: NewContact): Promise<void> {
  await field(page, "First name").fill(contact.firstName);
  if (contact.lastName !== undefined) await field(page, "Last name").fill(contact.lastName);
  for (const [index, phone] of contact.phones.entries()) {
    if (index > 0) await page.getByRole("button", { name: "Add Phone number" }).click();
    if (phone.label) await field(page, `Label for Phone number ${index + 1}`).selectOption(phone.label);
    await field(page, `Phone number ${index + 1}`).fill(phone.number);
  }
  if (contact.email !== undefined) await field(page, "Email").fill(contact.email);
  if (contact.address !== undefined) await field(page, "Address").fill(contact.address);
  if (contact.notes !== undefined) await field(page, "Notes").fill(contact.notes);
}

/** Adds a Contact through the form and returns its details URL. */
async function addContact(page: Page, contact: NewContact): Promise<string> {
  await page.goto("/contacts/new");
  await fillContactForm(page, contact);
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page).toHaveURL(DETAILS_URL);
  return page.url();
}

function contactNamesInDatabase(): string[] {
  const db = new Database(DB_FILE, { readonly: true, fileMustExist: true });
  try {
    return db.prepare("SELECT first_name FROM contacts").pluck().all() as string[];
  } finally {
    db.close();
  }
}

test(`UJ-2: Add Contact from the list, save, land on its details, and find it in its sorted place after a reload [${ADD}]`, async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Add Contact" }).first().click();
  await expect(page).toHaveURL(/\/contacts\/new$/);
  await expect(page.getByRole("heading", { level: 1, name: "Add Contact" })).toBeVisible();

  await fillContactForm(page, { firstName: "Grace", lastName: "Hopper", phones: [{ number: "+1 555 0100" }] });
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page).toHaveURL(DETAILS_URL);
  await expect(page.getByRole("heading", { level: 1, name: "Grace Hopper" })).toBeVisible();
  const hopperId = new URL(page.url()).pathname.split("/").pop();

  await addContact(page, { firstName: "Ada", lastName: "Lovelace", phones: [{ number: "07700 900123" }] });
  await addContact(page, { firstName: "Alan", lastName: "Turing", phones: [{ number: "555 0199" }] });

  for (const load of ["goto", "reload"] as const) {
    if (load === "goto") await page.goto("/");
    else await page.reload();
    const list = page.getByRole("navigation", { name: "Contacts" });
    const names = await list.getByTestId("contact-name").allTextContents();
    const order = ["Grace Hopper", "Ada Lovelace", "Alan Turing"].map((name) => names.indexOf(name));
    expect(order.every((index) => index >= 0)).toBe(true);
    expect([...order].sort((a, b) => a - b)).toEqual(order);
    await expect(list.getByRole("region", { name: "H", exact: true }).getByTestId("contact-name")).toContainText([
      "Grace Hopper",
    ]);
    await expect(list.getByRole("region", { name: "L", exact: true }).getByTestId("contact-name")).toContainText([
      "Ada Lovelace",
    ]);
    await expect(list.getByRole("link", { name: /Grace Hopper/ })).toHaveAttribute("href", `/contacts/${hopperId}`);
  }

  // Stored in the database file the server reads on every start.
  expect(contactNamesInDatabase()).toEqual(expect.arrayContaining(["Grace", "Ada", "Alan"]));
});

test(`the form allows 1 to 5 labelled Phone numbers, new ones Mobile, add unavailable at 5 and remove at 1 [${PHONES}]`, async ({
  page,
}) => {
  await page.goto("/contacts/new");
  const rows = page.getByTestId("phone-row");
  const addPhone = page.getByRole("button", { name: "Add Phone number" });

  await expect(rows).toHaveCount(1);
  await expect(field(page, "Label for Phone number 1")).toHaveValue("mobile");
  await expect(field(page, "Label for Phone number 1").locator("option")).toHaveText(["Mobile", "Home", "Work", "Other"]);
  await expect(page.getByRole("button", { name: "Remove Phone number 1" })).toBeDisabled();
  await expect(addPhone).toBeEnabled();

  for (let count = 2; count <= 5; count++) {
    await addPhone.click();
    await expect(rows).toHaveCount(count);
    await expect(field(page, `Label for Phone number ${count}`)).toHaveValue("mobile");
  }
  await expect(addPhone).toBeDisabled();
  await expect(page.getByRole("button", { name: "Remove Phone number 1" })).toBeEnabled();

  const labels = ["work", "home", "other", "mobile", "home"];
  for (const [index, label] of labels.entries()) {
    await field(page, `Label for Phone number ${index + 1}`).selectOption(label);
    await field(page, `Phone number ${index + 1}`).fill(`555 010${index}`);
  }

  await page.getByRole("button", { name: "Remove Phone number 4" }).click();
  await expect(rows).toHaveCount(4);
  await expect(addPhone).toBeEnabled();
  await expect(field(page, "Phone number 4")).toHaveValue("555 0104");

  await field(page, "First name").fill("Phoebe");
  await field(page, "Last name").fill("Fivephones");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page).toHaveURL(DETAILS_URL);
  await expect(page.getByTestId("contact-phone")).toHaveText([
    "Work 555 0100",
    "Home 555 0101",
    "Other 555 0102",
    "Home 555 0104",
  ]);

  await page.goto("/contacts/new");
  for (let count = 2; count <= 3; count++) await addPhone.click();
  await page.getByRole("button", { name: "Remove Phone number 3" }).click();
  await page.getByRole("button", { name: "Remove Phone number 2" }).click();
  await expect(rows).toHaveCount(1);
  await expect(page.getByRole("button", { name: "Remove Phone number 1" })).toBeDisabled();
});

test(`edge case: saving with an empty first name is refused with a message beside it, keeping every value [${INVALID}] [${A11Y}]`, async ({
  page,
}) => {
  await page.goto("/contacts/new");
  await fillContactForm(page, {
    firstName: "",
    lastName: "Nameless",
    phones: [{ label: "work", number: "555 0142" }],
    email: "nameless@example.com",
    notes: "No first name",
  });
  await page.getByRole("button", { name: "Save" }).click();

  const summary = contactForm(page).getByRole("alert");
  await expect(summary).toContainText("Enter a first name.");
  const firstName = field(page, "First name");
  await expect(firstName).toHaveAttribute("aria-invalid", "true");
  await expect(firstName).toHaveAccessibleDescription("Enter a first name.");
  await expect(page).toHaveURL(/\/contacts\/new$/);

  await expect(firstName).toHaveValue("");
  await expect(field(page, "Last name")).toHaveValue("Nameless");
  await expect(field(page, "Label for Phone number 1")).toHaveValue("work");
  await expect(field(page, "Phone number 1")).toHaveValue("555 0142");
  await expect(field(page, "Email")).toHaveValue("nameless@example.com");
  await expect(field(page, "Notes")).toHaveValue("No first name");
  expect(contactNamesInDatabase()).not.toContain("");
});

test(`every invalid field is refused with its own message and keeps what was typed [${INVALID}]`, async ({ page }) => {
  const typed = {
    firstName: "F".repeat(101),
    lastName: "L".repeat(101),
    phones: [{ number: "12" }, { label: "home", number: "555-CALL-NOW" }, { number: "+44 (20) 7946.0958" }],
    email: "ada@",
    address: "A".repeat(301),
    notes: "N".repeat(2001),
  };
  await page.goto("/contacts/new");
  await fillContactForm(page, typed);
  await page.getByRole("button", { name: "Save" }).click();

  await expect(contactForm(page).getByRole("alert")).toContainText("Fix these 7 problems");
  const expected: [string, string, string][] = [
    ["First name", typed.firstName, "First name must be 100 characters or fewer."],
    ["Last name", typed.lastName, "Last name must be 100 characters or fewer."],
    ["Phone number 1", "12", "Enter a Phone number of 3 to 15 digits, optionally starting with +."],
    ["Phone number 2", "555-CALL-NOW", "Enter a Phone number of 3 to 15 digits, optionally starting with +."],
    ["Email", "ada@", "Enter an Email like name@domain."],
    ["Address", typed.address, "Address must be 300 characters or fewer."],
    ["Notes", typed.notes, "Notes must be 2,000 characters or fewer."],
  ];
  for (const [label, value, message] of expected) {
    await expect(field(page, label)).toHaveValue(value);
    await expect(field(page, label)).toHaveAttribute("aria-invalid", "true");
    await expect(field(page, label)).toHaveAccessibleDescription(message);
  }
  // The valid third Phone number has no error and keeps its value and Label.
  await expect(field(page, "Phone number 3")).toHaveValue("+44 (20) 7946.0958");
  await expect(field(page, "Phone number 3")).not.toHaveAttribute("aria-invalid", "true");
  await expect(field(page, "Label for Phone number 2")).toHaveValue("home");
  await expect(page).toHaveURL(/\/contacts\/new$/);
});

test(`the details page shows every stored field with tel: and mailto: links, and hides empty optional fields [${DETAILS}]`, async ({
  page,
}) => {
  await addContact(page, {
    firstName: "Katherine",
    lastName: "Johnson",
    phones: [
      { label: "work", number: "+1 (757) 864-1000" },
      { label: "home", number: "757.555.0123" },
    ],
    email: "katherine@example.com",
    address: "NASA Langley\nHampton, VA",
    notes: "Orbital mechanics",
  });

  await expect(page.getByRole("heading", { level: 1, name: "Katherine Johnson" })).toBeVisible();
  await expect(page.getByTestId("contact-phone")).toHaveText(["Work +1 (757) 864-1000", "Home 757.555.0123"]);
  await expect(page.getByRole("link", { name: "+1 (757) 864-1000" })).toHaveAttribute("href", "tel:+17578641000");
  await expect(page.getByRole("link", { name: "757.555.0123" })).toHaveAttribute("href", "tel:7575550123");
  await expect(page.getByRole("link", { name: "katherine@example.com" })).toHaveAttribute(
    "href",
    "mailto:katherine@example.com",
  );
  await expect(page.getByRole("definition").filter({ hasText: "NASA Langley" })).toHaveText("NASA Langley\nHampton, VA");
  await expect(page.getByRole("definition").filter({ hasText: "Orbital mechanics" })).toBeVisible();
  await expect(page.getByRole("term")).toHaveText(["Phone numbers", "Email", "Address", "Notes"]);

  await addContact(page, { firstName: "Minimal", phones: [{ number: "555 0177" }] });
  await expect(page.getByRole("heading", { level: 1, name: "Minimal" })).toBeVisible();
  await expect(page.getByRole("link", { name: "555 0177" })).toHaveAttribute("href", "tel:5550177");
  await expect(page.getByRole("term")).toHaveText(["Phone numbers"]);
  await expect(page.locator('a[href^="mailto:"]')).toHaveCount(0);
});

test(`an unknown id shows "Contact not found" linking back to the Contact list [${NOT_FOUND}]`, async ({ page }) => {
  await page.goto("/contacts/00000000-0000-4000-8000-000000000000");
  await expect(page.getByRole("heading", { level: 1, name: "Contact not found" })).toBeVisible();
  const back = page.getByRole("link", { name: "Back to Contacts" });
  await expect(back).toHaveAttribute("href", "/");
  await back.click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("heading", { level: 1, name: "Phone book" })).toBeVisible();

  await page.goto("/contacts/not-a-real-id");
  await expect(page.getByRole("heading", { level: 1, name: "Contact not found" })).toBeVisible();
});

test(`when the server fails to save, the form says "Could not save. Try again." and keeps every value [${SAVE_FAILS}]`, async ({
  page,
}) => {
  // Opening the list makes the server create its database file.
  await page.goto("/");
  const db = new Database(DB_FILE, { fileMustExist: true });
  // Make every Contact insert fail inside the server's own write.
  db.exec(
    "CREATE TRIGGER IF NOT EXISTS e2e_fail_contact_insert BEFORE INSERT ON contacts BEGIN SELECT RAISE(ABORT, 'e2e: simulated failure'); END;",
  );
  try {
    await page.goto("/contacts/new");
    await fillContactForm(page, {
      firstName: "Failing",
      lastName: "Save",
      phones: [{ label: "home", number: "555 0166" }, { label: "other", number: "555 0167" }],
      email: "fail@example.com",
      address: "Nowhere",
      notes: "Should not be stored",
    });
    await page.getByRole("button", { name: "Save" }).click();

    await expect(contactForm(page).getByRole("alert")).toHaveText("Could not save. Try again.");
    await expect(page).toHaveURL(/\/contacts\/new$/);
    await expect(field(page, "First name")).toHaveValue("Failing");
    await expect(field(page, "Last name")).toHaveValue("Save");
    await expect(field(page, "Label for Phone number 1")).toHaveValue("home");
    await expect(field(page, "Phone number 1")).toHaveValue("555 0166");
    await expect(field(page, "Label for Phone number 2")).toHaveValue("other");
    await expect(field(page, "Phone number 2")).toHaveValue("555 0167");
    await expect(field(page, "Email")).toHaveValue("fail@example.com");
    await expect(field(page, "Address")).toHaveValue("Nowhere");
    await expect(field(page, "Notes")).toHaveValue("Should not be stored");
  } finally {
    db.exec("DROP TRIGGER IF EXISTS e2e_fail_contact_insert");
    db.close();
  }
  expect(contactNamesInDatabase()).not.toContain("Failing");
});

test(`keyboard and screen-reader users: every input is labelled, errors use aria-describedby, the summary is role="alert" [${A11Y}]`, async ({
  page,
}) => {
  await page.goto("/contacts/new");
  const form = contactForm(page);
  await form.getByRole("button", { name: "Add Phone number" }).click();

  const unlabelled = await form.evaluate((element) =>
    Array.from(element.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>("input, select, textarea"))
      .filter((control) => !control.labels || control.labels.length === 0 || !control.labels[0].textContent?.trim())
      .map((control) => control.id || control.name),
  );
  expect(unlabelled).toEqual([]);
  expect(await form.locator("input, select, textarea").count()).toBe(9);
  await form.getByRole("button", { name: "Remove Phone number 2" }).click();

  // Keyboard only: leave the first name empty, type the rest, submit with Enter.
  const firstName = field(page, "First name");
  await firstName.focus();
  await page.keyboard.press("Tab");
  await expect(field(page, "Last name")).toBeFocused();
  await page.keyboard.type("Keys");
  await page.keyboard.press("Tab");
  await expect(field(page, "Label for Phone number 1")).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(field(page, "Phone number 1")).toBeFocused();
  await page.keyboard.type("555 0123");
  await page.keyboard.press("Enter");

  const summary = form.getByRole("alert");
  await expect(summary).toBeVisible();
  await expect(summary).toContainText("Enter a first name.");
  await expect(summary.getByRole("link", { name: "Enter a first name." })).toHaveAttribute("href", "#contact-firstName");
  await expect(firstName).toHaveAttribute("aria-describedby", "contact-firstName-error");
  await expect(page.locator("#contact-firstName-error")).toHaveText("Enter a first name.");

  await firstName.focus();
  await page.keyboard.type("Kay");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(DETAILS_URL);
  await expect(page.getByRole("heading", { level: 1, name: "Kay Keys" })).toBeVisible();
});
