/**
 * Signed in, the same batch that was refused anonymously succeeds.
 *
 * This is the only test that exercises the real cookie path: that a host-only
 * `localhost` cookie set on :4173 is sent to :8000, that SameSite=Lax survives
 * the cross-port hop, and that `buildPostHeaders` picks up the readable
 * csrftoken cookie so the API's CSRF double-submit passes.
 *
 * The backend test for this builds an HTTP_COOKIE header by hand -- it cannot
 * see whether a browser would ever send one.
 */
import { expect, test } from '../fixtures';

// Six symbols: the same set the anonymous spec proves is refused.
const SIX = ['AAPL', 'MSFT', 'COST', 'TROW', 'VICI', 'SBUX'];

// No anonymous session id on purpose: the auth cookie is what must decide.
test('a signed-in visitor is not metered', async ({ page }) => {
  await page.addInitScript((symbols: string[]) => {
    localStorage.setItem('corecomp_dip_watchlist', JSON.stringify(symbols));
  }, SIX);

  await page.goto('/dip');

  await expect(page.getByTestId('dip-loading')).toBeHidden();

  // No quota refusal.
  await expect(page.getByRole('alert')).toHaveCount(0);

  for (const symbol of SIX) {
    await expect(
      page.getByRole('button', { name: `Remove ${symbol} from watchlist` }),
    ).toBeVisible();
  }
});
