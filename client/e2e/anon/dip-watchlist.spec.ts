/**
 * The watchlist is real browser state: it lives in localStorage, survives a
 * reload, and is what another tab would read.
 *
 * vitest cannot cover this meaningfully -- jsdom's localStorage is an in-memory
 * shim that never round-trips through a document load, and the sidebar's 300ms
 * search debounce runs against a stubbed fetch.
 */
import { expect, test } from '../fixtures';

const SESSION = '22222222-2222-4222-8222-222222222222';
const KEY = 'corecomp_dip_watchlist';

test.beforeEach(async ({ page }) => {
  await page.addInitScript((session: string) => {
    localStorage.setItem('corecomp_anonymous_session_id', session);
  }, SESSION);
});

test('a ticker added through the search survives a reload, and removal sticks', async ({
  page,
}) => {
  await page.goto('/dip');

  await expect(page.getByTestId('dip-empty')).toContainText(
    'Add a ticker to your watchlist',
  );

  // A real POST to /pages/symbol-search after the 300ms debounce, against the
  // seeded Symbol table.
  await page.getByLabel('Search ticker').fill('AAPL');
  await page.getByRole('option', { name: /AAPL/ }).click();
  await expect(page.getByRole('button', { name: 'Remove AAPL from watchlist' })).toBeVisible();

  // The real reload is the point: the state has to come back from storage.
  await page.reload();
  await expect(page.getByRole('button', { name: 'Remove AAPL from watchlist' })).toBeVisible();

  const stored = await page.evaluate((key) => localStorage.getItem(key), KEY);
  expect(JSON.parse(stored ?? '[]')).toEqual(['AAPL']);

  await page.getByRole('button', { name: 'Remove AAPL from watchlist' }).click();
  await expect(page.getByTestId('dip-empty')).toBeVisible();

  await page.reload();
  await expect(page.getByTestId('dip-empty')).toBeVisible();
  expect(JSON.parse((await page.evaluate((key) => localStorage.getItem(key), KEY)) ?? '[]')).toEqual(
    [],
  );
});

test('a ticker that is not in the symbol table is rejected without a request', async ({ page }) => {
  await page.goto('/dip');

  await page.getByLabel('Search ticker').fill('ZZZZ');
  // No suggestion appears, so committing the typed value reports a miss.
  await page.getByLabel('Search ticker').press('Enter');

  await expect(page.getByRole('status')).toContainText(/No match for "ZZZZ"/);
  await expect(page.getByTestId('dip-empty')).toBeVisible();
});
