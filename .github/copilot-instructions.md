# Project Guidelines

## Code Style
- Follow existing style in the touched area instead of reformatting unrelated files.
- Frontend (`client/src/**`): React function components, ES modules, and existing semicolon/no-semicolon usage per file.
- Backend (`server/corecomp/**`): Django + DRF patterns with decorators (`@api_view`, `@permission_classes`) and pytest-style tests.
- Keep changes minimal and colocate tests with existing test structure (`client/src/**/*.test.jsx`, `server/corecomp/**/tests/test_*.py`).

## Architecture
- Monorepo with two primary apps:
- `client/`: Vite + React frontend.
- `server/corecomp/`: Django backend (apps: `accounts`, `pages`, `billings`).
- Frontend boundaries:
- Routing is centralized in `client/src/App.jsx`.
- Auth/session state and protected routing live in `client/src/auth/`.
- API helpers are in `client/src/helpers/api.js`; prefer extending these over ad hoc fetch logic.
- Backend boundaries:
- Auth and user lifecycle belong in `server/corecomp/accounts/`.
- Financial/overview endpoints belong in `server/corecomp/pages/views/overview.py` and related `pages/services.py`.
- Billing and Stripe flows belong in `server/corecomp/billings/`.

## Build and Test
- Client (run from `client/`):
- `npm install`
- `npm run dev`
- `npm run test`
- `npm run lint`
- `npm run build`
- Server (run from `server/corecomp/`):
- `pip install -r ../requirements.txt` (or use Pipenv from `server/`)
- `python manage.py migrate`
- `python manage.py runserver`
- `pytest`
- Optional local infra (run from `server/`):
- `docker-compose up`

## Conventions
- Frontend API usage:
- Use `authenticatedClient` / `authenticatedClientWithRetry` from `client/src/helpers/api.js`.
- Include credentials and CSRF behavior consistent with existing helpers; do not introduce alternate auth transport.
- `authenticatedClient` returns a `Response`; callers should check status and parse JSON.
- Frontend tests:
- Use Vitest (`vi`) patterns used in existing tests (including `vi.hoisted` where needed).
- Use `MemoryRouter` when testing routed components.
- Backend tests:
- Use fixtures from `server/corecomp/conftest.py` (`api_client`, `authenticated_client`, `authorized_client`).
- Expect Redis cache to be cleared between tests via autouse fixture.
- Authorization model:
- Endpoints requiring paid access use `IsSubscribed`; `trialing` and `active` are considered subscribed.
- Prefer existing custom management commands when useful (`clear_cache`, `sync_subscription`, `import_symbol_model`).

## Pitfalls
- `authenticatedClientWithRetry` handles `503` via `Retry-After`; preserve `isActive()` cancellation checks to avoid stale updates.
- Cookie-based JWT auth depends on `credentials: "include"` and CSRF headers for mutating requests.
- Avoid changing cookie/CORS/CSRF behavior without checking `server/corecomp/corecomp/settings.py`.

## Related Guidance
- See `.github/agents/coding.agent.md` for specialized coding-agent behavior and response format expectations.