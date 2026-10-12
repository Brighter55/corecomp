# Design brief: market-wide earnings calendar endpoint

Repo root `C:\Users\meanp\Desktop\VSCODE\corecomp`. Server app `server/corecomp`.

## Task

Settle the response contract and module layout for ONE new backend endpoint serving a forward-looking, market-wide earnings calendar. This brief covers the **backend contract only**. Do not write production code. The contract is frozen before either layer is written, because the backend and the frontend are both built against it.

## Established facts, from a subsystem map. Treat as given, do not re-derive.

**Views and URLs**

- Function-based DRF views live in `pages/views/overview.py`. Decorator order is `@api_view` then `@permission_classes`.
- Routes are a flat list in `pages/urls.py`, mounted at `/pages/` by `corecomp/urls.py`.
- Paths carry **no trailing slash**. `APPEND_SLASH` would 301 a POST into a GET and produce a 405.
- `pages/views/overview.py:256` already defines an `earnings` endpoint returning historical reported EPS. The calendar is a different thing and needs its own path.

**Permissions**

- `AllowAnonymousWithQuota` (`accounts/permissions.py:6`) reads `request.data["symbol"]` and raises `quota_exceeded` when that key is absent. A market-wide calendar has no symbol, so it **cannot** use this permission class.
- `trending` and `symbol_search` use `AllowAny` for exactly this reason.
- `AllowAnonymousWithQuotaList` reads a `symbols` list and shares the same Redis quota set (`anon_quota:{session_id}`, QUOTA=5, TTL 30 days).

**Service seam**

- `pages/services.py` defines `FinancialDataService` and `MockFinancialDataService` with one method per endpoint.
- Views call them through a module-level singleton in `services/__init__.py`, which reads `MOCK` once at import time.
- Mock fixtures under `pages/statement_samples/` are **gitignored and generated**. `get_trending` (`pages/services.py:148`) deliberately builds its payload in code instead of loading a fixture, because a clean checkout with `MOCK=True` would otherwise 500.

**Caching**

- View layer is `django.core.cache` over Redis, with ad-hoc keys and per-endpoint TTLs. Existing: `info_` = 604800, `current_price_` = 600, `MODE:trending` = 3600. `MODE` is `mock` or `live` and keeps the two from colliding.
- Provider layer is a separate in-process dict memo, `_upstream()` at `pages/wisesheets.py:103`, not Redis.
- The provider 503 path sets `Retry-After: 60000`.

**Provider client**

- Alpha Vantage was **fully removed** from the repo. No AV client survives. No code reads `ALPHAVANTAGE_API_KEY`. `pages/wisesheets.py` (41KB) is the sole provider module and is WiseSheets-specific.
- `fetch_wisesheets()` at `pages/wisesheets.py:37` shows the established pattern. `requests.get` with a timeout, then map 429 to 503 with `Retry-After`, 401/403 and 5xx to 500, and 404 to an empty dict. It returns DRF `Response` objects for errors, and callers branch with `isinstance(data, Response)`.
- The key is already declared in `server/.env` and in `render.yaml` with `sync: false`, so production already holds it. No infra change is needed.

## The upstream data, measured live on 2026-10-11

- Alpha Vantage `EARNINGS_CALENDAR`, one HTTP GET, param `horizon=3month`. Returns **CSV**, not JSON.
- Columns: `symbol,name,reportDate,fiscalDateEnding,estimate,currency,timeOfTheDay`
- `timeOfTheDay` observed values are `pre-market`, `post-market`, and the empty string.
- 4,582 rows, one row per symbol, being the next scheduled report only.
- Empty `timeOfTheDay` is **78% of rows**. Coverage decays with distance. 66% known within 7 days, 30% for days 8 to 30, about 2% for days 31 to 90.
- The account free tier is **25 requests/day total across all AV endpoints**. No date window can be requested upstream, and there is no way to ask "which symbols report on date X". The entire forward calendar arrives in a single call.

## The frontend that consumes it

One page at `/earnings`. Its toolbar carries prev/next window navigation and a Weekly board / Monthly grid toggle.

- **Weekly board.** Five day columns, Monday to Friday. Each day holds up to three session groups. Before Open, After Close, and a third for a known date whose session is unannounced. Each group is a grid of company tiles, each tile a logo with the ticker beneath.
- **Monthly grid.** Mon to Fri cells over several weeks, each cell holding that day's tiles, with an overflow indicator when a day holds more than fit.
- Real density is far higher than the mockup implies. Oct 15 holds 27 symbols. The busiest day in the next year holds 576.

## Questions to settle

1. The response contract. Does the server group entries by date and session, or return flat rows the client groups? Weigh what the two views actually read, and what stops the same shape assumption being repeated on both sides.
2. Where the boundary sits between fetching the upstream CSV, caching it, and slicing it to a requested window. Does the service take a date window, or return the whole forward calendar? Does the view slice?
3. How `MOCK=True` is satisfied without depending on a gitignored fixture.
4. Is the window client-supplied query params, or server-decided?
5. Cache key and TTL, given 25 upstream requests/day total and a calendar that changes slowly.

## Deliverable

A concrete recommended contract with the exact JSON, the module layout with real file paths, and the alternatives you rejected, each with its reason. No production code.
