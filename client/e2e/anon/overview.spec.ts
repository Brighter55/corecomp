/**
 * `/overview/:symbol` in a real browser.
 *
 * The heaviest page in the app (15 requests on mount) and the only consumer of
 * `authenticatedClientWithRetry`, so it is the only place that helper's
 * behaviour is observable. jsdom covers the 32 individual graph components and
 * two section-visibility rules; it does not cover the settle transition against
 * a real backend, the real ResizeObserver chart paint, or the redirect paths.
 *
 * There are no data-testids anywhere under src/overview, so these use the same
 * role-and-text vocabulary as the existing jsdom tests -- accordion triggers by
 * accessible name are the most stable handles on the page.
 */
import { expect, test } from '../fixtures';

// `e2e_prepare` seeds this row, and the hero name comes from the Symbol table
// rather than the fixture, so the seeded value is what the page must show.
const SEEDED_NAME = 'INTERNATIONAL BUSINESS MACHINES CORP';

test('the overview loads and settles with fixture data', async ({ page }) => {
  const posts: string[] = [];
  page.on('request', (request) => {
    if (request.method() === 'POST' && request.url().includes('/pages/')) {
      posts.push(new URL(request.url()).pathname);
    }
  });

  await page.goto('/overview/IBM');

  // The name swap is the strongest single settle signal: the placeholder is
  // replaced once /pages/current-price lands. (Note the placeholder is NOT a
  // loading indicator -- it also renders when the name is missing or the
  // request 204s -- so it is only meaningful as "not settled yet".)
  await expect(page.getByText('Loading company name...')).toHaveCount(0);
  await expect(page.getByText(SEEDED_NAME)).toBeVisible();

  // Real values from the MOCK fixtures, not placeholders.
  await expect(page.getByRole('heading', { name: 'About', exact: true })).toBeVisible();
  await expect(page.getByText('NYSE')).toBeVisible();
  await expect(page.getByText('TECHNOLOGY')).toBeVisible();

  // Only the Income Statement accordion is open by default, so only its graphs
  // are mounted. Closed sections are unmounted by Radix, not merely hidden.
  //
  // `exact: true` is required: Playwright matches accessible names by SUBSTRING,
  // so 'Revenue' alone also matches the sibling heading "Cost Of Revenue" and
  // trips strict mode.
  await expect(page.getByRole('heading', { name: 'Revenue', exact: true })).toBeVisible();

  // 6 statements + 7 composites + current-price + info. This count is only
  // valid against the production build: under `vite dev`, React.StrictMode
  // double-invokes effects and it would read 30.
  await expect.poll(() => posts.length, { message: 'unexpected request count' }).toBe(15);
});

test('an exhausted visitor is sent to /login with the quota message', async ({
  page,
  request,
}) => {
  const SESSION = '44444444-4444-4444-8444-444444444444';

  // /overview costs ONE symbol per visit -- the quota counts unique symbols and
  // all 15 requests carry the same one -- so the allowance has to be spent
  // deliberately first. These go straight to the API with the same session
  // header the browser will send.
  for (const symbol of ['AAPL', 'MSFT', 'COST', 'TROW', 'VICI']) {
    const response = await request.post('http://localhost:8000/pages/info', {
      headers: { 'X-Anonymous-Session': SESSION, 'Content-Type': 'application/json' },
      data: { symbol },
    });
    expect(response.status(), `priming quota with ${symbol}`).toBe(200);
  }

  await page.addInitScript(
    (session: string) => localStorage.setItem('corecomp_anonymous_session_id', session),
    SESSION,
  );

  // IBM is the sixth distinct symbol, so every one of the 15 requests 403s.
  await page.goto('/overview/IBM');

  await expect(page).toHaveURL(/\/login$/);
  // Note "searches" here; DipPage says "symbols" for the same limit.
  await expect(
    page.getByText("You've used all 5 free searches for this month. Sign in to continue."),
  ).toBeVisible();
});

test('a persistent 503 is retried a bounded number of times', async ({ page }) => {
  // MOCK never returns 503, so fulfilling the route is the only way to observe
  // the retry from a browser. Only /pages/info is intercepted; the other 14
  // endpoints are left alone.
  let infoCalls = 0;
  await page.route('**/pages/info', async (route) => {
    infoCalls += 1;
    // The CORS headers are load-bearing, not decoration. This response is
    // cross-origin (4173 -> 8000), and route.fulfill does not add them: without
    // them the browser BLOCKS the response and fetch() rejects instead of
    // resolving with a 503. The retry logic lives after a successful await
    // fetch, so it would never run and this spec would assert nothing --
    // Access-Control-Expose-Headers matters too, since the client reads
    // Retry-After off the response and a hidden header reads as null.
    await route.fulfill({
      status: 503,
      headers: {
        'Retry-After': '10',
        'Access-Control-Allow-Origin': 'http://localhost:4173',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Expose-Headers': 'Retry-After',
      },
      body: '',
    });
  });

  await page.goto('/overview/IBM');

  // Wait for the rest of the page to settle, so the retries have had time to
  // run. Before the retry was bounded this spec never got here -- the request
  // count below is what makes the loop visible.
  await expect(page.getByText(SEEDED_NAME)).toBeVisible();
  await page.waitForTimeout(1000);

  // 1 initial attempt + 2 retries.
  expect(infoCalls, 'the 503 retry is unbounded').toBeLessThanOrEqual(3);
  expect(infoCalls).toBeGreaterThan(0);
});
