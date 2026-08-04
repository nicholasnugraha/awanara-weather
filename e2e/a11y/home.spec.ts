import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("home page tidak punya violation serious/critical (WCAG 2.2 AA)", async ({
  page,
}) => {
  await page.goto("/");

  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();

  const serious = results.violations.filter((v) =>
    ["serious", "critical"].includes(v.impact ?? ""),
  );

  expect(
    serious.map((v) => `${v.id}: ${v.help}`),
  ).toEqual([]);
});
