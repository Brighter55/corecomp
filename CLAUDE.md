# CoreComp

Stock fundamentals visualization app (React + Django). Business model: **free, no subscriptions** (Stripe removed). **Google-only login**; public users get **5 free symbol views/month**, logged-in users unlimited. Deployment is **Render only — no Docker in production**.

## Repo layout

- `server/` — Django 5.2 + DRF + SimpleJWT (httpOnly-cookie auth), PostgreSQL, Redis, Alpha Vantage. Python managed with **pipenv** (`Pipfile` + `requirements.txt`).
- `client/` — React 19 + Vite 7 + Tailwind 3 + shadcn/ui + Recharts. Mixed `.jsx`/`.tsx`. npm.
- `render.yaml` — Render blueprint (API, static frontend, managed Postgres, Key-Value/Redis).

## Local development

- **Postgres**: native Windows service `postgresql-x64-17` on localhost:5432 (local dev db/user/pass: `corecomp`/`corecomp`/`corecomp` — dev-only credentials, not production).
- **Redis**: the only Docker piece — `docker compose up -d` in `server/` (no native Windows Redis).
- **Backend**: `pipenv run python corecomp/manage.py runserver` (from `server/`) → :8000
- **Frontend**: `npm run dev` (from `client/`) → :5173
- To bring up everything: run the `/run-app` skill.
- `server/.env` is gitignored; `MOCK=True` locally (mock Alpha Vantage data).

## Auth & anonymous quota (core of the free model)

- Google OAuth only — manual accounts, password reset, email verification all removed.
- `server/corecomp/accounts/permissions.py` → `AllowAnonymousWithQuota`:
  - authenticated → allowed; anonymous → counts **unique symbols** per `X-Anonymous-Session` header in a Redis set `anon_quota:{session_id}`, `QUOTA = 5`, TTL 30 days; over → 403 `detail="quota_exceeded"`.
- Frontend sends `X-Anonymous-Session` (UUID in localStorage) on every API call; on 403 `quota_exceeded` it redirects to `/login` with a message.
- `pages/views/overview.py` endpoints use `AllowAnonymousWithQuota`; `accounts/` (me, sign-out, google-authentication) use `IsAuthenticated`.
- JWT in httpOnly cookies via `accounts/authenticate.py` (CustomJWTAuthentication) + AutoRefreshJWTMiddleware.

## Testing

- Backend: `pipenv run pytest` from `server/` (104 tests). Requires Postgres + Redis running.
- Frontend: `npm test` (158 tests) and `npm run build` from `client/`.

## Deployment (Render)

- Blueprint `render.yaml` at repo root; API service gets `DATABASE_URL` (fromDatabase) and `REDIS_CACHE_LOCATION` (fromService) injected automatically — do NOT set those in the dashboard.
- `settings.py` parses `DATABASE_URL` via dj-database-url when present; otherwise falls back to individual `DATABASE_*` vars (local dev).
- Secrets live in the Render dashboard (keys with `sync: false` in render.yaml).

## Gotchas

- Sample statement files (`pages/statement_samples/*.json`) resolve relative to `pages/services.py` — CWD-independent, safe to run from anywhere.
- `ALLOWED_HOSTS` supports comma-separated values (split in settings.py); `CSRF_TRUSTED_ORIGINS` is still a single value.
