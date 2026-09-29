/**
 * Every public route renders, and the app survives the backend being
 * unreachable.
 *
 * The second test is the interesting one. AuthProvider wraps every route and
 * awaits /accounts/me with no try/catch, so a *rejected* request (rather than a
 * non-2xx response) leaves `loading` true forever -- and AuthenticatedRoute then
 * renders "Loading..." permanently. No jsdom test mocks a rejection of that
 * call, so a single backend blip bricking the whole UI is entirely unverified.
 */
import { expect, test } from '../fixtures';

const PUBLIC_ROUTES = ['/', '/login', '/overview', '/upcoming', '/dip', '/privacy-policy', '/tos'];

test('every public route renders without a page error', async ({ page }) => {
  const pageErrors: string[] = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));

  for (const route of PUBLIC_ROUTES) {
    await page.goto(route);

    // Deliberately `locator('header')` and not `getByRole('banner')`.
    // The implicit banner role is dropped when a <header> is nested inside a
    // <section>, and the landing page renders LandingHeader inside one
    // (Landing.tsx:14-15). ProductHeader sits in a plain <div> and does keep
    // the role, so a role query would pass on every route but "/" -- which is
    // a fact about the markup, not about whether the app rendered.
    await expect(page.locator('header').first(), `route ${route} did not render`).toBeVisible();
  }

  expect(pageErrors).toEqual([]);
});

test('an unreachable /accounts/me must not leave the app stuck on Loading', async ({ page }) => {
  // Abort just that one call. Fulfilling/aborting locally keeps the hermetic
  // guard satisfied -- nothing leaves the machine.
  await page.route('**/accounts/me', (route) => route.abort('connectionrefused'));

  await page.goto('/account');

  // Desired behaviour: the provider settles, the user is anonymous, and
  // AuthenticatedRoute redirects to the login page.
  await expect(page.getByText('Loading...')).toHaveCount(0);
});
