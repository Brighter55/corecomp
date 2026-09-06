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
- `server/.env` is gitignored; `MOCK=True` locally (mock data fixtures). `WISESHEETS_API_KEY` is set in `.env` (dev) and the Render dashboard (prod); `MOCK=False` for live data.

## Auth & anonymous quota (core of the free model)

- Google OAuth only — manual accounts, password reset, email verification all removed.
- `server/corecomp/accounts/permissions.py` → `AllowAnonymousWithQuota`:
  - authenticated → allowed; anonymous → counts **unique symbols** per `X-Anonymous-Session` header in a Redis set `anon_quota:{session_id}`, `QUOTA = 5`, TTL 30 days; over → 403 `detail="quota_exceeded"`.
- Frontend sends `X-Anonymous-Session` on every API call — a UUID stored in localStorage under `corecomp_anonymous_session_id`; on 403 `quota_exceeded` it redirects to `/login` with a message.
- Data endpoints in `pages/views/overview.py` use `AllowAnonymousWithQuota`; `symbol_search` is `AllowAny`. In `accounts/`: `me` & `sign-out` are `IsAuthenticated`; `google-authentication` & `refresh` are `AllowAny`.
- JWT in httpOnly cookies via `accounts/authenticate.py` (CustomJWTAuthentication) + AutoRefreshJWTMiddleware.

## Testing

- Backend: `pipenv run pytest` from `server/` (≈145 tests). Requires Postgres + Redis running.
- Frontend: `npm test` (≈167 Vitest tests) and `npm run build` from `client/`.

## Deployment (Render)

- Blueprint `render.yaml` at repo root; API service gets `DATABASE_URL` (fromDatabase) and `REDIS_CACHE_LOCATION` (fromService) injected automatically — do NOT set those in the dashboard.
- `settings.py` parses `DATABASE_URL` via dj-database-url when present; otherwise falls back to individual `DATABASE_*` vars (local dev).
- Secrets live in the Render dashboard (keys with `sync: false` in render.yaml).

## Gotchas

- Sample statement files (`pages/statement_samples/*.json`) resolve relative to `pages/services.py` — CWD-independent, safe to run from anywhere.
- `ALLOWED_HOSTS` supports comma-separated values (split in settings.py); `CSRF_TRUSTED_ORIGINS` is still a single value.
- Retired env keys linger but are dead: local `server/.env`/`render.yaml` still list `ALPHAVANTAGE_API_KEY`, `MAILGUN_API_KEY`, `STRIPE_API_KEY`, `STRIPE_ENDPOINT_SECRET`, and `client/.env` has `VITE_STRIPE_PUBLISHABLE_KEY`. Nothing in code reads them since the WiseSheets + free-model migration — safe to delete, harmless to keep.
- `symbol_search` queries the `Symbol` table, which is seeded by `python corecomp/manage.py import_symbol_model` — not by migrations. A fresh local DB has no search results until that command runs (WiseSheets enumeration, SEC EDGAR fallback).
