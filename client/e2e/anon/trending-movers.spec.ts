/**
 * The "Today's movers" section of the `/overview` landing page.
 *
 * This layer exists for one assertion above all: that loading the landing page
 * does NOT spend the anonymous visitor's quota. That cannot be proven in jsdom,
 * which stubs away the permission class, Redis, the `X-Anonymous-Session`
 * header and CORS -- everything the claim actually rests on.
 *
 * It also carries the carousel, because "a page is however many cards fit" is a
 * real-layout question: jsdom has no layout, and the page size comes from
 * matchMedia against the viewport Playwright actually renders at.
 */
import { expect, test } from '../fixtures';

// The seed order of the in-code MOCK payload in server/corecomp/pages/services.py
// -- served pre-ranked so the page never has to re-sort.
const MOCK_MOVERS = [
  'NVDA', 'MSFT', 'AAPL', 'AMZN',
  'META', 'GOOGL', 'AVGO', 'JPM',
  'V', 'UNH', 'XOM', 'TSLA',
];

// Desktop Chrome is 1280px wide, which crosses the lg breakpoint, so four cards
// fit per page and 12 movers make exactly three.
const PER_PAGE = 4;
const LAST_PAGE = 2;

test('renders the first page of movers', async ({ page }) => {
  await page.goto('/overview');

  // Not "Trending Stocks": this ranks a fixed universe, so the label must not
  // claim to speak for the whole market.
  await expect(page.getByRole('heading', { name: "Today's movers" })).toBeVisible();

  for (const symbol of MOCK_MOVERS.slice(0, PER_PAGE)) {
    await expect(page.getByText(symbol, { exact: true })).toBeVisible();
  }
});

test('does not render the whole list at once', async ({ page }) => {
  await page.goto('/overview');
  await expect(page.getByText(MOCK_MOVERS[0], { exact: true })).toBeVisible();

  // The carousel exists precisely so the rest are not all on screen. If this
  // ever passes, the paging has silently stopped slicing.
  await expect(page.getByText(MOCK_MOVERS[PER_PAGE], { exact: true })).toHaveCount(0);
});

test('the next arrow reveals the following page', async ({ page }) => {
  await page.goto('/overview');
  await expect(page.getByText(MOCK_MOVERS[0], { exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Next trending stocks' }).click();

  for (const symbol of MOCK_MOVERS.slice(PER_PAGE, PER_PAGE * 2)) {
    await expect(page.getByText(symbol, { exact: true })).toBeVisible();
  }
  await expect(page.getByText(MOCK_MOVERS[0], { exact: true })).toHaveCount(0);
});

test('the arrows disable at both ends', async ({ page }) => {
  await page.goto('/overview');
  await expect(page.getByText(MOCK_MOVERS[0], { exact: true })).toBeVisible();

  const prev = page.getByRole('button', { name: 'Previous trending stocks' });
  const next = page.getByRole('button', { name: 'Next trending stocks' });

  await expect(prev).toBeDisabled();

  await next.click();
  await expect(prev).toBeEnabled();

  for (let i = 1; i < LAST_PAGE; i += 1) {
    await next.click();
  }
  await expect(next).toBeDisabled();
});

test('the section heading is not a link', async ({ page }) => {
  await page.goto('/overview');

  const heading = page.getByRole('heading', { name: "Today's movers" });
  await expect(heading).toBeVisible();
  // It used to be an <a href="#"> with a chevron, going nowhere.
  await expect(page.getByRole('link', { name: "Today's movers" })).toHaveCount(0);
  await expect(
    page.getByRole('link', { name: 'Market News' }),
  ).toHaveCount(0);
});

test('retires the loading skeleton once the movers land', async ({ page }) => {
  await page.goto('/overview');

  // The skeleton is the pre-fetch state; a page that never resolves would leave
  // this present forever, which the visibility assertion above would not catch.
  await expect(page.getByTestId('trending-loading')).toHaveCount(0);
});

test('requests the movers exactly once, and paging does not refetch', async ({ page }) => {
  const posts: string[] = [];
  page.on('request', (request) => {
    if (request.method() === 'POST' && request.url().includes('/pages/trending')) {
      posts.push(new URL(request.url()).pathname);
    }
  });

  await page.goto('/overview');
  await expect(page.getByText(MOCK_MOVERS[0], { exact: true })).toBeVisible();

  // One request for the whole section, not one per card -- the batched pair of
  // upstream calls happens server-side and is cached for an hour.
  expect(posts, 'the movers section should fetch once').toHaveLength(1);

  await page.getByRole('button', { name: 'Next trending stocks' }).click();
  await expect(page.getByText(MOCK_MOVERS[PER_PAGE], { exact: true })).toBeVisible();

  // Every page is already in memory; paging must not hit the network.
  expect(posts, 'paging should not refetch').toHaveLength(1);
});

test('an exhausted visitor still sees the movers instead of the paywall', async ({
  page,
  request,
}) => {
  const SESSION = '55555555-5555-4555-8555-555555555555';

  // /pages/trending is AllowAny, so the quota has to be spent through a
  // quota-guarded sibling to set up the condition we care about. /pages/info
  // costs one symbol per call, so five fills the allowance exactly.
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

  await page.goto('/overview');

  // The negative case is what gives this teeth: a quota-guarded route would
  // have bounced this visitor to /login (see anon/overview.spec.ts, which
  // asserts exactly that redirect for /overview/:symbol).
  await expect(page).toHaveURL(/\/overview$/);
  await expect(page.getByRole('heading', { name: "Today's movers" })).toBeVisible();
  await expect(page.getByText(MOCK_MOVERS[0], { exact: true })).toBeVisible();
});
