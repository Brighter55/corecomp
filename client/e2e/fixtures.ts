/**
 * The shared test object for every spec: Playwright's `test`, plus an `auto`
 * fixture that fails the test if the browser talks to anything it should not.
 *
 * `auto` means it applies whether or not a spec asks for it, so a leak can
 * never pass just because someone forgot to opt in.
 */
import { test as base, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

/**
 * The only origins the app may contact.
 *
 * BOTH are `localhost` on purpose. `localhost` and `127.0.0.1` are different
 * origins AND cross-site for cookies, so a bundle built against a 127.0.0.1
 * backend loses its cookies here and silently degrades to anonymous. Omitting
 * 127.0.0.1 makes that mistake fail loudly instead of turning into a
 * mysterious quota failure.
 */
const LOCAL_ORIGINS = new Set([
  'http://localhost:4173', // the SPA under test
  'http://localhost:8000', // the Django API under test
]);

/**
 * Non-local requests the app legitimately makes. Each is aborted rather than
 * allowed, so the suite never depends on the public internet -- and each says
 * why it is benign, so the next person understands the entry instead of
 * weakening the guard.
 */
const EXTERNAL_RULES: { matches: (url: URL) => boolean; why: string }[] = [
  {
    matches: (url) => url.hostname === 'accounts.google.com' && url.pathname.startsWith('/gsi/'),
    why:
      'GoogleOAuthProvider injects the GSI script on EVERY route (main.jsx), not just ' +
      '/login. No spec signs in with Google and the provider renders its children ' +
      'whether or not the script loads, so aborting is safe. Aborting also removes any ' +
      "dependence on Google's availability or on a real client id.",
  },
  {
    matches: (url) => url.hostname === 'img.logo.dev',
    why:
      'Company logos (shared/companyLogoUrl.js, and the landing page builds its own). ' +
      'Aborting is deterministic AND exercises WatchlistSidebar\'s <img onError> ' +
      'ticker-chip fallback -- so specs must expect the chip, not an <img>.',
  },
];

/** Schemes the document uses for inlined assets; never network egress. */
const SELF_SCHEMES = new Set(['data:', 'blob:', 'about:', 'chrome-extension:']);

export const test = base.extend<{ hermetic: void }>({
  hermetic: [
    async ({ context }, use, testInfo) => {
      const violations: string[] = [];
      const allowlisted: string[] = [];

      // context.route, not page.route: this must also cover any popup or extra
      // tab a spec opens.
      await context.route('**/*', (route) => {
        const request = route.request();
        let url: URL;
        try {
          url = new URL(request.url());
        } catch {
          return route.continue(); // not a URL this guard can reason about
        }

        if (SELF_SCHEMES.has(url.protocol)) return route.continue();
        if (LOCAL_ORIGINS.has(url.origin)) return route.continue();

        const rule = EXTERNAL_RULES.find((r) => r.matches(url));
        if (rule) {
          allowlisted.push(`${request.method()} ${request.url()}\n    why benign: ${rule.why}`);
          return route.abort('blockedbyclient');
        }

        violations.push(`${request.method()} ${request.url()}  (${request.resourceType()})`);
        return route.abort('blockedbyclient');
      });

      await use();

      if (allowlisted.length) {
        await testInfo.attach('external-requests-aborted.txt', {
          body: allowlisted.join('\n\n'),
          contentType: 'text/plain',
        });
      }

      expect(
        violations,
        'The browser left localhost. Only the hosts in EXTERNAL_RULES may be contacted, ' +
          'and each needs a written reason before it is added:\n  ' +
          violations.join('\n  '),
      ).toEqual([]);
    },
    { auto: true },
  ],
});

/**
 * Backend errors, for specs that care. Kept out of the origin guard on purpose:
 * the guard is about *origins*, this is about *status codes*.
 *
 * Note index.html links /vite.svg but client/public/ does not exist, so expect
 * one benign 404 for that path in any full network log.
 */
export function collectBackendErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('response', (response) => {
    let origin: string;
    try {
      origin = new URL(response.url()).origin;
    } catch {
      return;
    }
    if (origin === 'http://localhost:8000' && response.status() >= 400) {
      errors.push(`${response.status()} ${response.request().method()} ${response.url()}`);
    }
  });
  return errors;
}

export { expect };
