# CoreComp

Stock fundamentals, visualized. Search any US-listed ticker and explore a company's financial statements, valuation ratios, dividends and pricing history through clean, chart-first dashboards.

**Free, no subscriptions.** Anonymous visitors get a limited number of symbol views each month; sign in with Google for unlimited access. Live at **[corecomp.cc](https://corecomp.cc)** — support at support@corecomp.cc.

## Features

- **Symbol search** — find companies by name or ticker (autocomplete).
- **Company overview** — sector/industry, country/exchange, market cap, valuation multiples (PE, PS, PB, EV/EBITDA), margins, EPS, 52-week range, moving averages and dividend data.
- **Core statements** — income statement, balance sheet and cash flow, with derived ratios (profit margin, free cash flow, current/quick ratio, debt-to-equity) annotated onto the raw lines.
- **Composite ratio charts** — ROE, ROA, P/E, P/B, P/S, price-to-FCF and market cap computed across fiscal periods.
- **Per-line charts** — revenue, EPS, free cash flow, cash vs debt, dividends paid, capex, R&D and many more.
- **Historical pricing** — a price history chart for each symbol.
- **Empty-state handling** — graphs and accordion sections with no data are hidden automatically rather than left as dead space.

## How it works

The backend exposes a provider-agnostic, Alpha Vantage-shaped API. Under the hood data is sourced from the **[WiseSheets](https://wisesheets.io) API**, which pulls standardized SEC EDGAR XBRL filings. `pages/wisesheets.py` maps WiseSheets responses onto the internal shape; `FinancialDataService` (`pages/services.py`) hands those dicts to the views, annotators and ratio computators in `pages/utils.py`.

In development with `MOCK=True`, the app runs entirely on local JSON fixtures (see `pages/statement_samples/`) — no network or API key needed.

### Auth & the anonymous quota (the core of the free model)

- **Google-only login.** No passwords, no email verification, no subscriptions.
- Frontend signs in with Google, posts the credential to `/accounts/google-authentication`, and the backend verifies it and issues **httpOnly JWT cookies** (`access_token` 15 min, rotating `refresh_token` 24 h) plus a CSRF cookie.
- Data endpoints are protected by `AllowAnonymousWithQuota`: **anonymous users may view 5 unique symbols per ~30-day window**, tracked per browser session in a Redis set keyed by the `X-Anonymous-Session` header (a UUID the frontend keeps in `localStorage` as `corecomp_anonymous_session_id`). At the limit the API returns `403 {"detail": "quota_exceeded"}` and the UI redirects to `/login`.
- **Signed-in users are unlimited.**

## Tech stack

| Layer | Tech |
|---|---|
| Backend | Django 5.2 · Django REST Framework · SimpleJWT (httpOnly-cookie auth) · django-redis · PostgreSQL (psycopg2) · gunicorn |
| Python env | pipenv (Python 3.11) |
| Frontend | React 19 · Vite 7 · Tailwind CSS 3 · shadcn/ui (Radix) · Recharts · react-router 7 · @react-oauth/google |
| Frontend tests | Vitest + Testing Library (mixed `.jsx`/`.tsx`) |
| Infra | Render blueprint (`render.yaml`) · Redis via Docker **only** for local dev |
| Data | WiseSheets API (SEC EDGAR XBRL; free plan ≈ 5,000 req/month, ~5y history) |

## Repo layout

```
├── server/                 # Django project (Python, pipenv)
│   ├── corecomp/           #   project settings/urls (manage.py sits here)
│   │   ├── accounts/       #   Google auth, JWT cookies, quota permission, CSRF
│   │   ├── pages/          #   views, serializers, models (Symbol)
│   │   │   ├── views/overview.py   # all data endpoints
│   │   │   ├── services.py         # FinancialDataService / Mock service
│   │   │   ├── wisesheets.py       # WiseSheets client → AV-shaped dicts
│   │   │   ├── utils.py            # annotators + ratio computators
│   │   │   └── statement_samples/  # MOCK fixtures (gitignored)
│   │   └── services/__init__.py    # selects Mock vs live by MOCK=True
│   ├── docker-compose.yml  # local Redis only
│   ├── Pipfile · Pipfile.lock · requirements.txt
├── client/                 # React + Vite frontend
├── render.yaml             # Render blueprint (API, static FE, Postgres, Redis)
├── CLAUDE.md               # dev notes for working in this repo (Claude Code)
```

## Getting started (local dev on Windows)

Prerequisites: **PostgreSQL 17** running as a native Windows service (`postgresql-x64-17`, localhost:5432), **Docker Desktop** (for Redis — no native Windows build), **Python 3.11** + **pipenv**, **Node.js**.

1. **Redis** (only Docker piece):
   ```
   cd server
   docker compose up -d
   ```
2. **Backend env** — create `server/.env` (gitignored). A dev template:
   ```dotenv
   DJANGO_SECRET_KEY=<generate one>
   DEBUG=True
   ALLOWED_HOSTS=localhost,127.0.0.1
   MOCK=True                     # True = run on fixtures; False = live WiseSheets

   DATABASE_NAME=corecomp
   DATABASE_USER=corecomp
   DATABASE_PASSWORD=corecomp
   DATABASE_HOST=localhost
   DATABASE_PORT=5432
   SSLMODE=prefer

   REDIS_CACHE_LOCATION=redis://localhost:6379/1

   # cookies/CORS for localhost
   AUTH_COOKIE_DOMAIN=None
   AUTH_COOKIE_SECURE=False
   AUTH_COOKIE_SAMESITE=Lax
   CORS_ALLOWED_ORIGINS=http://localhost:5173
   CSRF_COOKIE_SAMESITE=Lax
   CSRF_COOKIE_SECURE=False
   CSRF_COOKIE_DOMAIN=localhost
   CSRF_TRUSTED_ORIGINS=http://localhost:5173
   FRONTEND_BASE_URL=http://localhost:5173

   # only needed with MOCK=False / for seeding symbols
   WISESHEETS_API_KEY=<your key>
   GOOGLE_CLIENT_ID=<your Google OAuth client id>
   ```
   > `corecomp`/`corecomp`/`corecomp` are dev-only credentials for the local database — never production values.
3. **Install & migrate**:
   ```
   cd server
   pipenv install
   pipenv run python corecomp/manage.py migrate
   ```
   Optionally seed the symbol search table (needs `WISESHEETS_API_KEY` + network; falls back to SEC EDGAR):
   ```
   pipenv run python corecomp/manage.py import_symbol_model
   ```
4. **Frontend env** — create `client/.env`:
   ```dotenv
   VITE_BACKEND_BASE_URL=http://localhost:8000
   VITE_GOOGLE_CLIENT_ID=<your Google OAuth client id>
   VITE_LOGO_DEV_PUBLISHABLE_KEY=<your Logo.dev key>
   ```
   Then `npm install` from `client/`.
5. **Run both servers**:
   ```
   # terminal 1
   cd server && pipenv run python corecomp/manage.py runserver     # → :8000
   # terminal 2
   cd client && npm run dev                                          # → :5173
   ```
   Frontend: http://localhost:5173 · Backend health check: http://localhost:8000/admin/login/

There's also a `/run-app` Claude Code skill that starts Redis + Postgres + both servers and verifies each is up.

## Testing

```bash
# backend — from server/ (needs Postgres + Redis running)
pipenv run pytest          # ≈145 tests

# frontend — from client/
npm test                   # ≈167 Vitest tests
npm run build              # production build
```

## Deployment (Render)

`render.yaml` at the repo root declares four services:

- **corecomp-api** — Django behind gunicorn, built with `requirements.txt`.
- **corecomp-frontend** — static React build from `client/`, with all routes rewritten to `/index.html`.
- **corecomp-redis** — managed Key-Value (Redis), used as cache, distributed lock and quota store.
- **corecomp-postgres** — managed PostgreSQL.

`DATABASE_URL` and `REDIS_CACHE_LOCATION` are injected automatically by Render — **don't set them in the dashboard**. Every other secret (`DJANGO_SECRET_KEY`, `WISESHEETS_API_KEY`, `GOOGLE_CLIENT_ID`, CORS/CSRF/cookie vars, …) lives in the Render dashboard with `sync: false` in `render.yaml`.

## Management commands

From `server/corecomp/`:

| Command | Purpose |
|---|---|
| `import_symbol_model` | Seed/refresh the `Symbol` table (WiseSheets enumeration, SEC fallback) |
| `generate_statement_samples` | Regenerate the `MOCK=True` JSON fixtures from live data |
| `clear_cache` | Flush the Redis cache |

## Project status

Version **0.8.0**. See the in-app roadmap (»Upcoming) and git history for what's next.
