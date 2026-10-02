/**
 * Mints a JWT once per run and stores it as a browser cookie, so the `auth`
 * project starts signed in without a real Google OAuth flow.
 *
 * A `setup` project rather than `globalSetup`: globalSetup runs BEFORE
 * Playwright starts webServer, so it would have no database to mint against.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

import { test as setup, expect } from '@playwright/test';

import { E2E_ENV, ROOT, pythonExe } from './env';

const STATE_PATH = path.join(ROOT, 'client', 'e2e', '.auth', 'user.json');

const E2E_EMAIL = 'e2e@corecomp.test';

/**
 * An authenticated POST must carry a `csrftoken` cookie AND a matching
 * X-CSRFToken header (accounts/authenticate.py does the double-submit by hand).
 *
 * The cookie must NOT be httpOnly: client/src/helpers/api.js reads it with
 * document.cookie before sending the header. 32 "A"s is the value the backend
 * tests use, and it satisfies CSRF_ALLOWED_CHARS.
 */
const CSRF_SECRET = 'A'.repeat(32);

setup('mint a JWT and store it as browser cookies', async ({ browser }) => {
  const stdout = execFileSync(
    pythonExe(),
    [path.join(ROOT, 'scripts', 'e2e_mint_token.py'), '--email', E2E_EMAIL],
    { cwd: ROOT, env: E2E_ENV, encoding: 'utf-8' },
  ).trim();

  const { access_token: accessToken } = JSON.parse(stdout) as { access_token: string };
  expect(accessToken.length).toBeGreaterThan(0);

  fs.mkdirSync(path.dirname(STATE_PATH), { recursive: true });

  const context = await browser.newContext();
  await context.addCookies([
    {
      // httpOnly: only the server ever reads this one. Domain `localhost` and
      // not `127.0.0.1` so it reaches both the app (:4173) and the API (:8000)
      // -- cookies ignore ports, so one entry covers both.
      name: 'access_token',
      value: accessToken,
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      secure: false,
      sameSite: 'Lax',
    },
    {
      // Readable by page JS on purpose -- see CSRF_SECRET above.
      name: 'csrftoken',
      value: CSRF_SECRET,
      domain: 'localhost',
      path: '/',
      httpOnly: false,
      secure: false,
      sameSite: 'Lax',
    },
    // No refresh_token cookie on purpose: AutoRefreshJWTMiddleware only acts
    // when one is present, and its `except Exception: pass` path would silently
    // anonymize the context rather than failing loudly.
  ]);

  await context.storageState({ path: STATE_PATH });
  await context.close();

  expect(fs.existsSync(STATE_PATH)).toBe(true);
});
