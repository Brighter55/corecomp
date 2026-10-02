/**
 * Switching the moving-average window must not cost the visitor anything.
 *
 * Both windows arrive in the single /pages/dip response, and the page recomputes
 * from what it already has. A regression that refetched would burn one of a
 * visitor's five free symbols per toggle -- invisible to vitest, which stubs the
 * client, and to pytest, which never sees the second request.
 */
import { expect, test } from '../fixtures';

const SESSION = '33333333-3333-4333-8333-333333333333';
const FIVE = ['AAPL', 'MSFT', 'COST', 'TROW', 'VICI'];

test('toggling 50/200 reuses the response already in hand', async ({ page }) => {
  const dipPosts: string[] = [];
  page.on('request', (request) => {
    if (request.method() === 'POST' && request.url().includes('/pages/dip')) {
      dipPosts.push(request.url());
    }
  });

  await page.addInitScript(
    ([session, symbols]) => {
      localStorage.setItem('corecomp_anonymous_session_id', session as string);
      localStorage.setItem('corecomp_dip_watchlist', JSON.stringify(symbols));
    },
    [SESSION, FIVE] as const,
  );

  await page.goto('/dip');
  await expect(page.getByTestId('dip-loading')).toBeHidden();

  // Exactly one request for the initial load. This also pins the production
  // build: under `vite dev`, React.StrictMode double-invokes effects and this
  // would read 2.
  await expect.poll(() => dipPosts.length).toBe(1);

  await page.getByRole('radio', { name: '50 DAY SMA' }).click();
  await expect(page.getByRole('heading', { name: 'Price vs 50d SMA' })).toBeVisible();
  await expect(page.getByRole('radio', { name: '50 DAY SMA' })).toHaveAttribute(
    'aria-checked',
    'true',
  );

  // Give any stray refetch time to fire before asserting it did not.
  await page.waitForTimeout(750);
  expect(dipPosts.length, 'toggling the window refetched /pages/dip').toBe(1);

  // And back, for symmetry.
  await page.getByRole('radio', { name: '200 DAY SMA' }).click();
  await expect(page.getByRole('heading', { name: 'Price vs 200d SMA' })).toBeVisible();
  await page.waitForTimeout(750);
  expect(dipPosts.length).toBe(1);
});
