import { expect, test, type Page } from "@playwright/test";
import { expectNoHorizontalScroll } from "./helpers";

const LARGE = "ac_01a1fa1e-014d-7e60-8cc8-6b54a81bc184";
const NARROW = "ac_01a1fa1e-014d-7ab6-ad82-41cc52705222";

// This server's database holds the 2,000 Contacts loaded by `pnpm seed 2000` (playwright.config.ts).
const SEEDED = 2000;

/** A mid-range phone: 360 px wide, and a CPU 4× slower than the test machine (Lighthouse's mobile setting). */
async function emulateMidRangePhone(page: Page): Promise<void> {
  await page.setViewportSize({ width: 360, height: 740 });
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
}

test.beforeEach(async ({ page }) => {
  // Warm the server (first database open and module load) so the timing measures a normal visit.
  const warm = await page.request.get("/");
  expect(warm.ok()).toBe(true);
  // Record long main-thread tasks from the start of every navigation.
  await page.addInitScript(() => {
    const w = window as unknown as { __longTasks: { start: number; duration: number }[] };
    w.__longTasks = [];
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) w.__longTasks.push({ start: entry.startTime, duration: entry.duration });
    }).observe({ type: "longtask", buffered: true });
  });
});

test(`with 2,000 seeded Contacts the first screen of Contacts appears within 1 second on a mid-range phone [${LARGE}]`, async ({
  page,
}) => {
  await emulateMidRangePhone(page);
  await page.goto("/");

  await expect(page.getByTestId("contact-name")).toHaveCount(SEEDED);

  const firstContentfulPaint = await page.evaluate(
    () => performance.getEntriesByName("first-contentful-paint")[0]?.startTime ?? Number.POSITIVE_INFINITY,
  );
  expect(firstContentfulPaint).toBeLessThan(1000);

  // The Contacts are in the server-rendered HTML, so the first paint already holds a screen of them.
  const rowsOnFirstScreen = await page.evaluate(
    () =>
      [...document.querySelectorAll('[data-testid="contact-name"]')].filter((el) => {
        const rect = el.getBoundingClientRect();
        return rect.height > 0 && rect.top >= 0 && rect.bottom <= window.innerHeight;
      }).length,
  );
  expect(rowsOnFirstScreen).toBeGreaterThanOrEqual(5);
});

test(`scrolling the 2,000 Contacts shows no visible stalls on a mid-range phone [${LARGE}]`, async ({ page }) => {
  await emulateMidRangePhone(page);
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  const result = await page.evaluate(async () => {
    const start = performance.now();
    let longestFrame = 0;
    let last = start;
    while (window.scrollY + window.innerHeight < document.documentElement.scrollHeight - 1) {
      window.scrollBy(0, window.innerHeight);
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      const now = performance.now();
      longestFrame = Math.max(longestFrame, now - last);
      last = now;
    }
    // Let the last frames' tasks be reported.
    await new Promise((resolve) => setTimeout(resolve, 300));
    const w = window as unknown as { __longTasks: { start: number; duration: number }[] };
    const tasks = w.__longTasks.filter((t) => t.start >= start).map((t) => t.duration);
    return {
      reachedBottom: window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 1,
      longestTask: Math.max(0, ...tasks),
      longestFrame,
    };
  });

  expect(result.reachedBottom).toBe(true);
  // A stall the owner can see: the main thread blocked for 200 ms or more while scrolling.
  expect(result.longestTask).toBeLessThan(200);
  expect(result.longestFrame).toBeLessThan(200);
});

test(`2,000 Contacts at 360 px have no horizontal scrolling [${NARROW}]`, async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto("/");
  await expect(page.getByTestId("contact-name").first()).toBeVisible();
  await expectNoHorizontalScroll(page);
});
