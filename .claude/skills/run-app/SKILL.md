---
name: run-app
description: Start the full CoreComp local dev environment (Django backend + Vite frontend + Redis via Docker). Use when the user asks to run/start the app, or to bring up local servers for development or manual testing.
---

# Run the local app

Start every piece of the local dev environment and confirm each one is up before reporting.

## Layout (use absolute paths — work from any cwd)

- Project root: `C:\Users\meanp\Desktop\VSCODE\corecomp`
- Backend: `server/` — Django 5.2 + DRF, managed with pipenv (`Pipfile`)
- Frontend: `client/` — React 19 + Vite (`npm run dev`)
- Redis: Docker container `redis:7-alpine` (no native Windows build — this is the only service that runs in Docker)
- Postgres: native Windows service `postgresql-x64-17` on localhost:5432

## Steps

1. **Redis** — run `docker compose up -d` in `server/`. Idempotent: starts the container if missing, no-ops if running. If Docker Desktop isn't running, ask the user to start it and retry.

2. **Postgres** — verify the `postgresql-x64-17` service is running (`Get-Service postgresql-x64-17`). If stopped, start it.

3. **Backend** — from `server/`, in background:
   ```
   pipenv run python corecomp/manage.py runserver
   ```
   Wait for `Starting development server at http://127.0.0.1:8000/` in its output. (Runs on :8000; `MOCK=True` in `server/.env`, so no Alpha Vantage API calls.)

4. **Frontend** — from `client/`, in background:
   ```
   npm run dev
   ```
   Wait for `Local: http://localhost:5173` in its output.

5. **Verify** — confirm both ports answer (HTTP 200), then report:
   - Backend: http://localhost:8000 (Django; `http://localhost:8000/admin/login/` as a health check)
   - Frontend: http://localhost:5173 (Vite; talks to the backend via `VITE_BACKEND_BASE_URL` from `client/.env`, CORS already configured)

## Troubleshooting

- **Port 8000 or 5173 already in use** — the app is probably already running. Find the process (`Get-NetTCPConnection -LocalPort 8000`) and report it instead of starting a duplicate.
- **Backend 500s on data endpoints** — Redis is usually the culprit: check `docker compose ps` in `server/`.
- **Postgres auth errors** — credentials in `server/.env` must match the native install (local dev only: user/pass `corecomp`/`corecomp`, db `corecomp`).
- **Sample data missing** — mock statement samples live in `server/corecomp/pages/statement_samples/` and resolve relative to `services.py` (CWD-independent since the 2026-08-06 fix).
