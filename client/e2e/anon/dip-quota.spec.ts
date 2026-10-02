/**
 * The free allowance, end to end.
 *
 * This is the one chain no existing test covers: the browser has to persist a
 * session id in localStorage, attach it as X-Anonymous-Session, get that header
 * past CORS, and have the API meter the batch against it. pytest drives the
 * permission with a synthetic header it sets itself, and vitest mocks the
 * client and never sends one -- so neither can prove the browser does.
 */
import { expect, test } from '../fixtures';

// Pinned so the quota set is deterministic and e2e_prepare's flush is a
// reliable reset, rather than relying on a fresh random UUID each run.
const SESSION = '11111111-1111-4111-8111-111111111111';

// All five have finite 50- and 200-day averages in dip_rows.json, so each
// produces a real bar rather than being dropped as missing data.
const FIVE = ['AAPL', 'MSFT', 'COST', 'TROW', 'VICI'];

const QUOTA_MESSAGE =
  "You've used all 5 free symbols for this month. Sign in for unlimited access.";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(
    ([session, symbols]) => {
      localStorage.setItem('corecomp_anonymous_session_id', session as string);
      localStorage.setItem('corecomp_dip_watchlist', JSON.stringify(symbols));
    },
    [SESSION, FIVE] as const,
  );
});

test('five symbols render, and the sixth is refused', async ({ page }) => {
  await page.goto('/dip');

  await expect(page.getByRole('heading', { name: 'Dip Finder' })).toBeVisible();
  await expect(page.getByTestId('dip-loading')).toBeHidden();

  // Five rows came back, so the batch was metered and returned 200.
  for (const symbol of FIVE) {
    await expect(
      page.getByRole('button', { name: `Remove ${symbol} from watchlist` }),
    ).toBeVisible();
  }

  // The sixth goes through the real search (AllowAny, costs no quota) and then
  // a real /pages/dip, which must be refused.
  await page.getByLabel('Search ticker').fill('SBUX');
  await page.getByRole('option', { name: /SBUX/ }).click();

  await expect(page.getByRole('alert')).toHaveText(QUOTA_MESSAGE);
});
