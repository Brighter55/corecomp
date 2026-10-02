# CoreComp

Stock fundamentals visualization app (React + Django). Business model: **free, no subscriptions**. **Google-only login**; public users get **5 free symbol views/month**, logged-in users unlimited.

Data provider: **WiseSheets API** (free plan: 5,000 req/month, 5y history, SEC EDGAR-sourced). All Alpha Vantage→WiseSheets shape mapping lives in `server/corecomp/pages/wisesheets.py`; `FinancialDataService` (pages/services.py) returns AV-shaped dicts so views/computators stay provider-agnostic.

## Why I Started this Project
I started hand-picking stocks when I was 18. I noticed that reading raw data alone makes it hard to identify the trends you need to evaluate a stock's fundamentals — so I built this tool to turn that messy data into beautiful charts I can easily look at.

I plan to monetize with ads once it picks up users.

## Repo layout

- `server/` — Django 5.2 + DRF + SimpleJWT (httpOnly-cookie auth), PostgreSQL, Redis, WiseSheets. Python managed with **pipenv** (`Pipfile` + `requirements.txt`).
- `client/` — React 19 + Vite 7 + Tailwind 3 + shadcn/ui + Recharts. Mixed `.jsx`/`.tsx`. npm.
- `render.yaml` — Render blueprint (API, static frontend, managed Postgres, Key-Value/Redis).
- `server/corecomp/services/__init__.py` — runtime switch: `MOCK=True` → `MockFinancialDataService` (JSON fixtures in `pages/statement_samples/`); otherwise the live `FinancialDataService`, which delegates every fetch to `pages/wisesheets.py`.

## Local development

- **Postgres**: native Windows service `postgresql-x64-17` on localhost:5432 (local dev db/user/pass: `corecomp`/`corecomp`/`corecomp` — dev-only credentials, not production).
- **Redis**: the only Docker piece — `docker compose up -d` in `server/` (no native Windows Redis).
- **Backend**: `pipenv run python corecomp/manage.py runserver` (from `server/`) → :8000
- **Frontend**: `npm run dev` (from `client/`) → :5173
- To bring up everything: run the `/run-app` skill.
- `server/.env` is gitignored; **`MOCK=False` locally, so local dev runs on live WiseSheets data.** `WISESHEETS_API_KEY` is set in `.env` (dev) and the Render dashboard (prod) — **the dev key is the same one production uses**, on a shared 5,000 req/month free tier, so local browsing spends real budget (`/dip` ≈ 1 request per cold symbol, `/overview` ≈ 6). Run `/run-app` for the full picture, including how to switch to mock.
- `MOCK` is read at **import time** in `services/__init__.py`, so changing it needs a backend restart, not just a reload.

## Auth & anonymous quota (core of the free model)

- Google OAuth only — manual accounts, password reset, email verification all removed.
- `server/corecomp/accounts/permissions.py` → `AllowAnonymousWithQuota`:
  - authenticated → allowed; anonymous → counts **unique symbols** per `X-Anonymous-Session` header in a Redis set `anon_quota:{session_id}`, `QUOTA = 5`, TTL 30 days; over → 403 `detail="quota_exceeded"`.
- Frontend sends `X-Anonymous-Session` on every API call — a UUID stored in localStorage under `corecomp_anonymous_session_id`; on 403 `quota_exceeded` it redirects to `/login` with a message.
- Data endpoints in `pages/views/overview.py` use `AllowAnonymousWithQuota`; `symbol_search` is `AllowAny`. In `accounts/`: `me` & `sign-out` are `IsAuthenticated`; `google-authentication` & `refresh` are `AllowAny`.
- JWT in httpOnly cookies via `accounts/authenticate.py` (CustomJWTAuthentication) + AutoRefreshJWTMiddleware.

## Verification — start here

**Run `python scripts/check.py` from the repo root.** One command, every gate:
Django `check`, migration drift, backend tests + ruff, frontend lint + tests +
`tsc` + build, and a post-build scan proving the bundle can't reach production.
It prints a PASS/FAIL summary, runs every gate even when one fails, and exits 0
only if everything passed. `--fast` skips the build; `--backend` / `--frontend`
scope it. Use the `/check` skill.

There is also a Playwright browser suite, run separately:
`python scripts/check.py --e2e`. It is **not** in the default run — it starts the
app on fixtures (`MOCK=True`) with its own Redis DB, whereas the default gates
run the live code path. It covers what jsdom cannot: cookies crossing ports,
CORS, the `X-Anonymous-Session` header, `localStorage`, and the anonymous quota
as a browser actually experiences it. First time on a machine:
`cd client && npm run e2e:install`.

Three things worth knowing:

- **`INCOMPLETE` is not a pass.** If Postgres or Redis is down the affected gate
  is skipped and the run exits 1. Fix the environment; don't narrow the gate.
- **It never touches production.** Non-loopback DB/Redis URLs are refused
  outright, and the frontend build is forced to `127.0.0.1` so
  `client/.env.production` can't inject `api.corecomp.cc`.
- **It doesn't set `MOCK`,** so verification runs the same code path as local dev.

CI (`.github/workflows/ci.yml`) runs exactly this script on push to `master` and
on every PR. It does not repeat the individual commands — add a gate to the
script and CI picks it up automatically.

Underlying commands, if you need them directly:

- Backend: `pipenv run pytest` from **`server/corecomp/`** (179 tests). Requires Postgres + Redis running.
  - Not from `server/`: `pytest.ini` lives in `server/corecomp/`, so running one level up does not discover it and every test errors with `ImproperlyConfigured: Requested setting REST_FRAMEWORK`.
  - Never run `pipenv` from the repo root — it resolves to a *different* virtualenv (`~/.virtualenvs/corecomp-*`, not `server-*`).
- Frontend: `npm run test:run` (222 Vitest tests, single run — `npm test` is watch mode and never exits) and `npm run build` from `client/`.

## Debugging & bugs

- **`.claude/feature-map.md`** maps symptoms to files, and — more usefully —
  lists the deliberate decisions that a "cleanup" would silently reverse. Read
  the traps section before changing anything around caching, quota, or CSRF.
- For a reported bug, use the `/reproduce-bug` skill: turn the symptom into a
  failing test *first*, then fix, then keep the test.

## Deployment (Render)

- Blueprint `render.yaml` at repo root; API service gets `DATABASE_URL` (fromDatabase) and `REDIS_CACHE_LOCATION` (fromService) injected automatically — do NOT set those in the dashboard.
- `settings.py` parses `DATABASE_URL` via dj-database-url when present; otherwise falls back to individual `DATABASE_*` vars (local dev).
- Secrets live in the Render dashboard (keys with `sync: false` in render.yaml).

## Gotchas

- Sample statement files (`pages/statement_samples/*.json`) resolve relative to `pages/services.py` — CWD-independent, safe to run from anywhere.
- `ALLOWED_HOSTS` supports comma-separated values (split in settings.py); `CSRF_TRUSTED_ORIGINS` is still a single value.
- Retired env keys linger but are dead: local `server/.env`/`render.yaml` still list `ALPHAVANTAGE_API_KEY`, `MAILGUN_API_KEY`, `STRIPE_API_KEY`, `STRIPE_ENDPOINT_SECRET`, and `client/.env` has `VITE_STRIPE_PUBLISHABLE_KEY`. Nothing in code reads them since the WiseSheets + free-model migration — safe to delete, harmless to keep.
- `symbol_search` queries the `Symbol` table, which is seeded by `python corecomp/manage.py import_symbol_model` — not by migrations. A fresh local DB has no search results until that command runs (WiseSheets enumeration, SEC EDGAR fallback).
