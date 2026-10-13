# Frozen contract: market-wide earnings calendar

Both the backend and the frontend are built against this file. It was frozen before either was written. Do not change it unilaterally. If implementation proves a part of it wrong, say so rather than quietly diverging.

Decided through a two-candidate arena design bakeoff and a cross-judge, then verified against the real repo. The working trail that produced it, meaning the design brief, the plan, and the candidate packages, is deliberately not in this repo. It was local scratch for the build, and the commit messages on the branch that added this endpoint record the decisions that outlived it.

## Endpoint

```
POST /pages/earnings-calendar
```

No trailing slash. `APPEND_SLASH` would 301 the POST into a GET and produce a 405, the same reason `dip` and `trending` omit it. Mounted at `/pages/` already, so declare `path("earnings-calendar", overview.earnings_calendar, name="earnings_calendar")` in `pages/urls.py`.

Distinct from the existing `path("earnings", ...)`, which returns historical reported EPS.

Permission is `AllowAny`. `AllowAnonymousWithQuota` reads `request.data["symbol"]` and raises `quota_exceeded` when it is absent (`accounts/permissions.py:22-24`), so a market-wide calendar cannot use it. `trending` and `symbol-search` use `AllowAny` for the same reason. A calendar is also not a symbol view, so it must not spend the 5 free views.

## Request

```json
{ "start": "2026-10-12", "days": 7 }
```

- `start`, required, an ISO date, inclusive.
- `days`, optional, an integer from 1 to 42, defaulting to 7.

Chosen over a `start`/`end` pair because `days >= 1` makes `start` later than `end` unrepresentable, so there is no range rule to get wrong, and the payload size is bounded by construction.

The window is client-supplied because the client owns its own date axis, meaning which Monday and which month. The server must not hardcode "the current week".

The two windows the frontend sends, so neither side has to guess. The weekly board sends `days: 5`, which lands `window.end` on Friday and matches its five columns exactly. The monthly grid sends `weeks * 7`, running from the Monday on or before the 1st to cover every week the month touches, which is 28 to 42 days and stays inside the server's bound. This was the one gap the frontend delegate found in the first draft of this file, whose example showed a seven-day weekly window.

## Response 200

```json
{
  "asOf": "2026-10-11",
  "window": { "start": "2026-10-12", "end": "2026-10-18" },
  "days": [
    {
      "date": "2026-10-15",
      "sessions": [
        {
          "session": "before_open",
          "tiles": [
            { "symbol": "TSM", "name": "Taiwan Semiconductor Manufacturing", "estimate": 1.79 },
            { "symbol": "SCHW", "name": "The Charles Schwab Corporation", "estimate": 0.77 }
          ]
        },
        {
          "session": "after_close",
          "tiles": [ { "symbol": "NFLX", "name": "Netflix, Inc.", "estimate": 5.12 } ]
        },
        {
          "session": "unannounced",
          "tiles": [ { "symbol": "WAL", "name": "Western Alliance Bancorporation", "estimate": 1.86 } ]
        }
      ]
    }
  ]
}
```

Invariants, all enforced server-side so the client never re-derives them:

- `days` is sorted ascending by date and contains **only dates with at least one tile**. A date absent from `days` has zero entries. The client builds its Monday-to-Friday grid from its own window and treats absent dates as empty cells.
- Each `sessions` array lists only non-empty groups, in the fixed order `before_open`, `after_close`, `unannounced`. Array order **is** display order, so the client needs no ordering table.
- `tiles` is sorted ascending by symbol, so the order is deterministic and the cached payload is stable.
- `asOf` is the date the cached snapshot was fetched and does not change between requests within the TTL.
- `window.end` is `start + days - 1`, echoed back.
- `estimate` is a number or `null`.
- `name` is a string or `null`.

The three session values are the whole vocabulary. `before_open` comes from the provider's `pre-market`, `after_close` from `post-market`, and `unannounced` from a blank value **or any value we have never seen**. The mapping is total on purpose, so a future provider value degrades into the third group instead of crashing the calendar.

## Response errors

Mirror `fetch_wisesheets`. Rate limiting and timeouts become 503 with a `Retry-After` header. Auth failures and upstream 5xx become 500. Never a 200 carrying a broken calendar, and never cached.

## Module layout

Each module owns one thing. This mirrors the existing `pages/trending.py` beside `pages/wisesheets.py`.

- **NEW `pages/alphavantage.py`** owns the HTTP call and upstream error mapping, and nothing else. One public function returning CSV text or a DRF `Response`. Reads `ALPHAVANTAGE_API_KEY`, which is already in `server/.env` and in `render.yaml` under `sync: false`. Same shape as `fetch_wisesheets`, but this provider answers in CSV rather than JSON.
- **NEW `pages/earnings_calendar.py`** owns the domain. Pure functions and module constants, no I/O, no `requests`, no clock. It holds the session vocabulary and its order, the grouping, the window slice, and the mock. Style it after `pages/trending.py`, which is the same kind of module.
- **EDIT `pages/serializers.py`** adds the window serializer.
- **EDIT `pages/services.py`** adds `get_earnings_calendar` to both service classes, as a payload dict, following `get_trending` at `services.py:70` exactly.
- **EDIT `pages/views/overview.py`** adds the view and its TTL constant.
- **EDIT `pages/urls.py`** adds the route.
- **NEW `pages/tests/test_earnings_calendar.py`** covers the grouping, the window slice, the blank session, and the HTTP-200 guard.

### Functions in `pages/earnings_calendar.py`

- `build_payload(csv_text, as_of) -> dict` builds the whole forward calendar as `{"asOf", "days"}`. This is the one place the rows become days and sessions. Pure, with `as_of` passed in rather than read from the clock, the same trick as `rank_movers`. Skips rows whose `reportDate` is missing or unparseable.
- `window_payload(payload, start, end) -> dict` filters `days` to the inclusive range and returns the full response body including the `window` envelope. This is the only function that produces the response shape, so nothing else can hand-write a lookalike.
- `mock_payload(today) -> dict` builds a payload in code for `MOCK=True`.
- `_as_float(value)` coerces a provider field or returns `None`, copied in spirit from `trending._as_float`. The provider stringifies everything and uses the literal `"None"` for missing values, and neither may reach the payload.

### The cached unit is the payload dict

`build_payload` produces it, the service returns it, and the view caches it under `{MODE}:earnings_calendar`. It is primitives only, so Redis never holds one of our classes and a later code change cannot make a stored value undeserializable. This follows `get_trending`, which caches a payload dict, and it replaces the candidate designs' plan to cache a frozen dataclass, which would have pickled it.

Key it with `MODE` so `mock` and `live` never collide, as `dip` and `trending` do.

TTL is 21600 seconds, six hours. Every visitor shares the one key, so the TTL and not traffic decides spend, keeping the worst case at 4 upstream calls a day against the 25.

Wrap the cache miss in a double-checked Redis lock, the shape the statement views already use, so a cold-cache burst of anonymous visitors collapses to one upstream call instead of exhausting the day in seconds.

## The one thing that must not be got wrong

Alpha Vantage reports rate limiting and errors with **HTTP 200**, carrying JSON or a mangled body, rather than an error status. Observed live, where a request returned the normal CSV header followed by a second line reading `I,n,f,o,r,m,a`, which is seven characters of the word Information written into the CSV one field per character.

So a client that returns the body on any 200 and hands it to `csv.DictReader` turns a quota exhaustion into a calendar with one garbage tile, which is then cached for six hours. That is a silent false-empty in front of users instead of a clean error.

`alphavantage.fetch_earnings_calendar` must therefore refuse anything that is not a real calendar. Treat all of these as upstream failure and return a `Response`:

- a body that is JSON, which is how the provider carries a `Note` or `Information` message
- a body whose first line is not the expected header
- a body whose rows yield **no** parseable `reportDate`

The last case is deliberate. An empty calendar is not a state worth caching, and a real calendar always has rows, so refusing to serve one is safer than showing users nothing for six hours.

## Mock requirements

`MockFinancialDataService.get_earnings_calendar` returns `earnings_calendar.mock_payload(date.today())`, built in code and never read from a fixture. The fixtures under `pages/statement_samples/` are gitignored and generated, so a fixture-backed payload 500s on a clean checkout, and the e2e suite runs `MOCK=True`. This is the same reasoning documented on `MockFinancialDataService.get_trending` at `services.py:148`.

The mock must include entries in all three session states, including a blank-session one, and enough tiles to fill a weekly board. Dates must be relative to `today` so the window overlaps the future and the e2e suite sees rows.

## Frontend

Page at `/earnings`, rendering `ProductHeader` and `Footer` itself. There is no shared layout in this app, so every page composes its own; `DipPage.jsx:210-312` is the model.

Two view modes behind a toolbar toggle, matching the two Stitch references. A **weekly board** of five day columns, each holding up to three session groups of company tiles. A **monthly grid** of Monday-to-Friday cells, each holding its day's tiles with an overflow indicator when a day holds more than fit.

The window is computed client-side from the toolbar and sent as the request body. Omitting `days` is not supported by the server, so the page always sends one.

Call it with `authenticatedClient` from `src/helpers/api.js`, which attaches `X-Anonymous-Session` and sends credentials. It POSTs when a payload is present.

Real density is far above the mockup, so the monthly grid will need its overflow indicator on busy days. Oct 15 holds 27 symbols and the busiest day this year holds 576. There is no relevance signal in the feed, so alphabetical is the only honest order, and the grid must cap what it renders per cell.

Tiles show a logo and the ticker, with `estimate` available for a tooltip. Use `companyLogoUrl` from `src/shared/companyLogoUrl.js`, which returns a logo.dev URL that 404s on unknown tickers so an `onError` chip can fall back to the ticker. The ticker chip is currently trapped inside `src/dip/components/WatchlistSidebar.jsx:26-54` and is not exported.

Session coverage decays with distance, at 66 percent known within 7 days, 30 percent for days 8 to 30, and about 2 percent beyond. So the weekly board is well supported and the monthly grid's later weeks will be almost entirely the `unannounced` group. That is expected, not a bug.
