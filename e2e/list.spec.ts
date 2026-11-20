import { expect, test } from "@playwright/test";
import { expectNoHorizontalScroll } from "./helpers";

const SCAFFOLD = "ac_01a1fa1e-014d-7897-9e82-6b7deac7c92f";
const SORTED = "ac_01a1fa1e-014d-713f-9a81-043f099238d8";
const NARROW = "ac_01a1fa1e-014d-7ab6-ad82-41cc52705222";

const LONG_NAME = "Maximiliana-Bartholomea Vandersteenhovenwijkerslootsmaeckeringhamsterdamsevaart";

// The fixture Contacts (e2e/fixtures/contacts.ts), in the order the list must show them.
const EXPECTED_GROUPS: [string, string[]][] = [
  ["A", ["Zoë Adams", "ana alvarez", "José Álvarez"]],
  ["B", ["Bob", "barbara Brown"]],
  ["C", ["Cher"]],
  ["V", [LONG_NAME]],
  ["Z", ["Émile Zola"]],
];

test(`the Next.js app serves / with Tailwind CSS applied [${SCAFFOLD}]`, async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle("Phone book");
  await expect(page.getByRole("heading", { level: 1, name: "Phone book" })).toBeVisible();
  // `flex` on the header comes from Tailwind: unstyled, a <header> is display: block.
  await expect(page.locator("header")).toHaveCSS("display", "flex");
});

test(`Contacts are sorted by last name then first name, accent- and case-insensitively, under letter headings [${SORTED}]`, async ({
  page,
}) => {
  await page.goto("/");
  const list = page.getByRole("navigation", { name: "Contacts" });

  await expect(list.getByRole("heading", { level: 2 })).toHaveText(EXPECTED_GROUPS.map(([letter]) => letter));
  await expect(list.getByTestId("contact-name")).toHaveText(EXPECTED_GROUPS.flatMap(([, names]) => names));

  for (const [letter, names] of EXPECTED_GROUPS) {
    await expect(list.getByRole("region", { name: letter, exact: true }).getByTestId("contact-name")).toHaveText(names);
  }
});

test(`each row shows the full Name and the first Phone number with its Label, linking to /contacts/[id] [${SORTED}]`, async ({
  page,
}) => {
  await page.goto("/");
  const rows = page.getByRole("navigation", { name: "Contacts" }).getByRole("link");
  await expect(rows).toHaveCount(8);

  const zoe = rows.filter({ hasText: "Zoë Adams" });
  await expect(zoe.getByTestId("contact-name")).toHaveText("Zoë Adams");
  await expect(zoe.getByTestId("contact-phone")).toHaveText("Work +1 555 0100");
  await expect(rows.filter({ hasText: "José Álvarez" }).getByTestId("contact-phone")).toHaveText(
    "Mobile (555) 012-3456",
  );
  await expect(rows.filter({ hasText: "Émile Zola" }).getByTestId("contact-phone")).toHaveText(
    "Home +33 1 23 45 67 89",
  );
  await expect(rows.filter({ hasText: "Bob" }).getByTestId("contact-phone")).toHaveText("Other 555 0103");

  const uuidHref = /^\/contacts\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
  const hrefs = await rows.evaluateAll((links) => links.map((link) => link.getAttribute("href") ?? ""));
  for (const href of hrefs) expect(href).toMatch(uuidHref);
  expect(new Set(hrefs).size).toBe(hrefs.length);

  await zoe.click();
  await expect(page).toHaveURL(uuidHref);
});

test(`the Contact list has no horizontal scrolling at 360 px, even with a very long Name [${NARROW}]`, async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto("/");
  const longRow = page.getByTestId("contact-name").filter({ hasText: "Maximiliana" });
  await longRow.scrollIntoViewIfNeeded();
  await expect(longRow).toBeVisible();
  await expectNoHorizontalScroll(page);
  const box = await longRow.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.x + box!.width).toBeLessThanOrEqual(360);
});
