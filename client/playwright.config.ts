import { defineConfig, devices } from '@playwright/test';

import { API_ORIGIN, APP_ORIGIN, CLIENT_DIR, DJANGO_DIR, E2E_ENV, PYTHON, q } from './e2e/env';

export default defineConfig({
  testDir: './e2e',

  // One shared Django process and one shared anonymous-quota set in Redis.
  // Parallel workers would race on both, so specs run strictly in order.
  fullyParallel: false,
  workers: 1,

  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI
    ? [['github'], ['html', { open: 'never' }]]
    : [['list'], ['html', { open: 'never' }]],

  timeout: 30_000,
  expect: { timeout: 10_000 },

  use: {
    baseURL: APP_ORIGIN,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    // Minting the auth cookie is a *test*, not a globalSetup: globalSetup runs
    // before webServer, so it would have no database to mint a token against.
    // A project with `dependencies` is guaranteed to run after the servers.
    { name: 'setup', testMatch: /auth\.setup\.ts/ },

    {
      // A clean cookie jar is the anonymous path -- nothing to configure.
      name: 'anon',
      testDir: './e2e/anon',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
    },

    {
      name: 'auth',
      testDir: './e2e/auth',
      use: {
        ...devices['Desktop Chrome'],
        storageState: './e2e/.auth/user.json',
      },
      dependencies: ['setup'],
    },
  ],

  webServer: [
    {
      // e2e_prepare must finish before runserver serves anything, so it is
      // chained into the one command rather than being a separate step.
      //
      // --noreload is deliberate: the autoreloader forks a child and re-imports
      // services/__init__.py, which is where MOCK is read.
      command: `${q(PYTHON)} manage.py e2e_prepare && ${q(PYTHON)} manage.py runserver --noreload 8000`,
      cwd: DJANGO_DIR,
      url: `${API_ORIGIN}/admin/login/`,
      env: E2E_ENV,
      // Never reuse: a server already on 8000 is running some other data mode
      // (almost certainly the developer's MOCK=False one), and the suite would
      // silently test against live data.
      reuseExistingServer: false,
      timeout: 180_000,
      stdout: 'pipe',
      stderr: 'pipe',
    },
    {
      // Builds its OWN bundle into dist-e2e rather than reusing check.py's
      // `dist`, which is built against http://127.0.0.1:8000. Serving that from
      // localhost:4173 would be a different origin AND cross-site for cookies,
      // so the browser would withhold access_token/csrftoken.
      //
      // --strictPort is deliberate: without it vite preview silently drifts to
      // 4174, and localStorage is origin-scoped, so every seeded watchlist
      // would vanish.
      command: 'npm run e2e:build && npm run e2e:serve',
      cwd: CLIENT_DIR,
      url: `${APP_ORIGIN}/`,
      env: E2E_ENV,
      reuseExistingServer: false,
      timeout: 240_000,
      stdout: 'pipe',
      stderr: 'pipe',
    },
  ],
});
