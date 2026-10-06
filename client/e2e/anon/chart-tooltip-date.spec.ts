/**
 * The date a graph tooltip shows, in light mode.
 *
 * Recharts paints its default tooltip as a hard-coded white box, and the label
 * (the period/date) names no colour of its own -- it inherits GraphCard's
 * `text-[var(--main-pine-teal)]`. Light mode flips that token to #F6FBF4, so the
 * date was white-on-white: in the DOM, invisible on screen. Dark mode never had
 * the problem, because there the same token is already dark (#344e41).
 *
 * jsdom cannot see any of this: Vitest does not process index.css, and jsdom does
 * not resolve var() anyway. Only a real browser with the real stylesheet can say
 * what colour the date actually paints, which is why this lives in the browser
 * suite rather than next to the graph components.
 *
 * The landing page renders these same graph components from inlined sample data,
 * so the first spec costs no API calls and no anonymous quota. The second needs
 * /overview, because NetIncomeVsOcfGraph paints its own tooltip box instead of
 * using Recharts' default one.
 */
import { expect, test } from '../fixtures';

/** #46544B -- the colour the date is pinned to, per index.css. */
const LIGHT_MODE_TOOLTIP_DATE = 'rgb(70, 84, 75)';

test('the default tooltip date is readable in light mode', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('corecomp-theme', 'light'));
  await page.goto('/');

  // Without this the colour assertion below could pass while reading the wrong
  // theme's stylesheet, which is exactly the bug being guarded against.
  await expect(page.locator('html')).toHaveClass(/theme-light/);

  // "Income" is the tab that mounts first and it draws no tooltip, so switch to
  // one that does.
  await page.getByRole('tab', { name: 'Price Data' }).click();

  const chart = page.locator('.recharts-wrapper').first();
  await expect(chart).toBeVisible();
  await chart.hover();

  const label = page.locator('.recharts-tooltip-label');
  await expect(label).toBeVisible();
  await expect(label).toHaveCSS('color', LIGHT_MODE_TOOLTIP_DATE);
});

test('the custom Net Income Vs OCF tooltip date is readable in light mode', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('corecomp-theme', 'light'));
  await page.goto('/overview/IBM');

  // Same settle signal overview.spec.ts uses: the placeholder is replaced once
  // /pages/current-price lands.
  await expect(page.getByText('Loading company name...')).toHaveCount(0);
  await expect(page.getByText('INTERNATIONAL BUSINESS MACHINES CORP')).toBeVisible();

  // Only the Income Statement accordion is open by default.
  await page.getByRole('button', { name: 'Cash Flow Statement' }).click();

  // `:has()` narrows to cards that actually draw a chart, and `.last()` picks the
  // innermost match -- the GraphCard itself, not the page that contains it.
  const card = page.locator('div:has(.recharts-wrapper):has-text("Net Income Vs OCF")').last();
  await expect(card).toBeVisible();
  await card.locator('.recharts-wrapper').hover();

  // Scoped to the card: the accordion holds ten charts, each with its own
  // tooltip wrapper, so a page-level locator trips strict mode.
  const tooltip = card.locator('.recharts-tooltip-wrapper');
  await expect(tooltip).toBeVisible();

  // This tooltip is a themed card rather than Recharts' white box, so the date
  // has to be readable in BOTH themes -- it takes --text-main, not the pinned
  // #46544B above. The date is the first text painted, and it sits directly in
  // the element that carries the colour.
  const dateColour = await tooltip.evaluate((el) => {
    const first = document.createTreeWalker(el, NodeFilter.SHOW_TEXT).nextNode();
    return first?.parentElement ? getComputedStyle(first.parentElement).color : null;
  });

  expect(dateColour).toBe('rgb(54, 69, 59)'); // --text-main in light mode
});
