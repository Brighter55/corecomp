/**
 * One source of truth for the browser suite's environment.
 *
 * Both webServer entries and every subprocess read from here, so the SPA and
 * the API can never disagree about which origin, which database, or which data
 * mode they are running in.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));

export const ROOT = path.resolve(HERE, '..', '..');
export const CLIENT_DIR = path.join(ROOT, 'client');
export const DJANGO_DIR = path.join(ROOT, 'server', 'corecomp');

/** The origin the SPA is served from. Also the only trusted CSRF origin. */
export const APP_ORIGIN = 'http://localhost:4173';
/** The API origin. Must be `localhost`, not `127.0.0.1` -- see E2E_ENV. */
export const API_ORIGIN = 'http://localhost:8000';

/**
 * The project interpreter, resolved the same way scripts/check.py resolves it.
 *
 * Deliberately NOT `pipenv run python`: pipenv loads server/.env and overrides
 * the process environment with it, so every variable set below would be
 * silently discarded -- MOCK would revert to False and this suite would call
 * the live WiseSheets API and spend real quota.
 */
export function pythonExe(): string {
  if (process.env.CORECOMP_PYTHON) return process.env.CORECOMP_PYTHON;

  const inVenv = ['Scripts/python.exe', 'bin/python'];
  for (const rel of ['.venv', 'venv']) {
    for (const exe of inVenv) {
      const candidate = path.join(ROOT, 'server', rel, exe);
      if (fs.existsSync(candidate)) return candidate;
    }
  }

  try {
    const out = execFileSync('pipenv', ['--venv'], {
      cwd: path.join(ROOT, 'server'),
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'ignore'],
      shell: process.platform === 'win32',
    });
    // pipenv prints "Loading .env environment variables..." before the path.
    for (const line of out.trim().split('\n').reverse()) {
      const dir = line.trim();
      if (!dir || !fs.existsSync(dir)) continue;
      for (const exe of inVenv) {
        const candidate = path.join(dir, exe);
        if (fs.existsSync(candidate)) return candidate;
      }
    }
  } catch {
    // fall through to the bare interpreter
  }

  return process.platform === 'win32' ? 'python' : 'python3';
}

/** Quote a path for the shell Playwright uses to run webServer commands. */
export function q(value: string): string {
  return value.includes(' ') ? `"${value}"` : value;
}

export const PYTHON = pythonExe();

/**
 * Environment for both servers. Every value here is one that settings.py reads
 * without a usable default, or one that decides whether a cookie survives.
 *
 * The spread comes FIRST so an inherited value from check.py or a developer's
 * shell cannot win over the pinned values below.
 */
export const E2E_ENV: NodeJS.ProcessEnv = {
  ...process.env,

  // 32+ bytes: PyJWT warns (InsecureKeyLengthWarning) for shorter HS256 keys.
  DJANGO_SECRET_KEY: 'e2e-only-not-a-real-secret-padded-to-32-bytes',
  DEBUG: 'False',
  ALLOWED_HOSTS: 'localhost,127.0.0.1',

  DATABASE_URL:
    process.env.CORECOMP_TEST_DATABASE_URL ??
    'postgresql://corecomp:corecomp@localhost:5432/corecomp',

  // Its own Redis DB, so e2e_prepare's flushdb() cannot wipe a developer's
  // cache or their anonymous-quota sets (and vice versa).
  REDIS_CACHE_LOCATION:
    process.env.CORECOMP_E2E_REDIS_URL ?? 'redis://localhost:6379/2',

  // The whole point: fixtures, no network, no WiseSheets quota.
  MOCK: 'True',

  FRONTEND_BASE_URL: APP_ORIGIN,
  CORS_ALLOWED_ORIGINS: APP_ORIGIN,
  // settings.py is `CSRF_TRUSTED_ORIGINS = [os.getenv(...)]` -- exactly one
  // origin, no comma splitting and no empty filtering.
  CSRF_TRUSTED_ORIGINS: APP_ORIGIN,
  CSRF_COOKIE_DOMAIN: 'localhost',

  // AUTH_COOKIE_SECURE is True unless the value is the literal string "False".
  // Anything else -- including unset -- makes the browser drop the cookie over
  // plain http, and every request silently looks anonymous.
  AUTH_COOKIE_SECURE: 'False',
  CSRF_COOKIE_SECURE: 'False',
  AUTH_COOKIE_SAMESITE: 'Lax',
  CSRF_COOKIE_SAMESITE: 'Lax',
  // The literal string "None" is how settings.py signals a host-only cookie.
  AUTH_COOKIE_DOMAIN: 'None',

  // No real Google flow is exercised; the GSI script is aborted by the hermetic
  // guard. Pinned so a local build and a CI build produce the same bundle --
  // client/.env (which supplies these locally) is gitignored.
  GOOGLE_CLIENT_ID: 'e2e-placeholder.apps.googleusercontent.com',
  VITE_GOOGLE_CLIENT_ID: 'e2e-placeholder.apps.googleusercontent.com',
  VITE_LOGO_DEV_PUBLISHABLE_KEY: 'pk_e2e_placeholder',

  // localhost on BOTH sides. `localhost` and `127.0.0.1` are different origins
  // AND cross-site for cookies, so mixing them makes the browser withhold
  // access_token/csrftoken and CORS reject the request -- auth would silently
  // degrade to anonymous and the quota specs would test the wrong thing.
  VITE_BACKEND_BASE_URL: API_ORIGIN,

  PYTHONIOENCODING: 'utf-8',
  FORCE_COLOR: '0',
};

// The setup project runs in a Playwright worker that imported this module; this
// guarantees a plain execFileSync(..., { env: process.env }) sees the same
// configuration the Django server got.
Object.assign(process.env, E2E_ENV);
