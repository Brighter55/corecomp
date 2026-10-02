# CoreComp feature map

Where to start when something is reported broken, and — more importantly — the
changes that look like cleanups and are actually regressions.

Paths are relative to the repo root. Line numbers drift; function and key names
are the durable part.

> **Keep this true.** A stale map is worse than no map, because it is trusted.
> When you change behaviour, grep this file for the old behaviour and fix it.

---

## Symptom → start here

| Symptom | Start here |
|---|---|
| Any data endpoint 500s | Redis down. `docker compose up -d` in `server/` |
| Data endpoints 500 under `MOCK=True` | Missing gitignored fixtures — `generate_statement_samples --symbol IBM` |
| Symbol search returns nothing | `Symbol` table is empty. It is seeded by `import_symbol_model`, **not** by a migration |
| 403 on a public POST | `accounts/authenticate.py:CustomJWTAuthentication` — the CSRF branch, or the `AllowAny` skip |
| 403 `quota_exceeded` too early | `accounts/permissions.py` — see the two-class trap below |
| `/pages/dip` numbers disagree with `/overview` | Expected in some cases — dip has its own cache. See trap 2 |
| Stale data after flipping `MOCK` | Un-namespaced cache keys. See trap 3 |
| 405 instead of 404 on a `pages/` route | Missing/extra trailing slash. See trap 8 |
| A ratio looks rounded or unrounded oddly | `pages/utils.py` — rounding is deliberate per-metric |
| Silent anonymous request failures | `accounts/auto_refresh_jwt_middleware.py` swallows exceptions. See trap 10 |
| Frontend shows `undefined` in a URL | `VITE_BACKEND_BASE_URL` wasn't set at build time |

### Routing

`server/corecomp/corecomp/urls.py` mounts `accounts/` and `pages/`.
**All eleven data endpoints live in one module**: `pages/views/overview.py`.
There is no per-feature views file — do not go looking for `views/dip.py`.

`/pages/dip` · `/pages/current-price` · `/pages/info` · `/pages/income-statement` ·
`/pages/cash-flow` · `/pages/balance-sheet` · `/pages/earnings` ·
`/pages/dividends` · `/pages/pricing` · `/pages/composite` · `/pages/symbol-search`

### Where things live

| Concern | File |
|---|---|
| All data views + their caching | `pages/views/overview.py` |
| Avatar/logos, statement→AV mapping | `pages/wisesheets.py` |
| Service classes (`FinancialDataService`, `MockFinancialDataService`) | `pages/services.py` |
| Which service is live | `services/__init__.py` (note: **not** `pages/`) |
| Ratio computators / annotators | `pages/utils.py` |
| Quota permissions | `accounts/permissions.py` |
| CSRF + JWT auth | `accounts/authenticate.py` |
| Frontend API client, CSRF + session headers | `client/src/helpers/api.js` |
| Dip page | `client/src/dip/DipPage.jsx`, `useDipWatchlist.js` |
| The page that fetches the data endpoints | `client/src/overview/SymbolOverviewPage.tsx` |

---

## Traps

The fix that looks right and is wrong. Every entry here is a deliberate decision
that a "cleanup" would silently reverse.

### 1. CSRF is cookie-only, and `AllowAny` views must skip it

`accounts/authenticate.py:CustomJWTAuthentication` enforces CSRF **only** for
unsafe methods on non-`AllowAny` views. `_view_allows_anonymous` inspects the DRF
view's `permission_classes` and returns early.

Why: public endpoints must never 403 from the auth layer. Cookies are readable
because the API and app share the registrable domain (`api.corecomp.cc` /
`corecomp.cc`) — a same-site subdomain topology that is *required*, not cosmetic.

- **Wrong fix:** "simplify" the CSRF branch into a cookie-only double-submit that
  runs unconditionally, or drop `_view_allows_anonymous`. It passes locally
  (shared host) and breaks every authenticated POST to `symbol_search`.
- **Wrong fix:** move the API to a different registrable domain. The
  `csrftoken` cookie becomes invisible to JS and the whole scheme dies.
- **Right fix:** leave it. `client/src/helpers/api.js:buildPostHeaders` already
  omits `X-CSRFToken` when no cookie exists (never sends the literal `undefined`).

### 2. `/pages/dip` keeps its own cache — deliberately

`overview.py:dip` reads and writes only `{mode}:dip_{symbol}`, TTL 600. It shares
nothing with `info_{symbol}` or `current_price_{symbol}`.

Why: dip needs one upstream resource (`prices/live`); overview needs six. Riding
`info_{symbol}` would make a dip-only view cost 4–5 upstream calls instead of 1 —
and `info`'s moving averages are frozen for 7 days, which is a wrong denominator
for a metric that measures deviation *from* the average.

- **Wrong fix:** "unify the caches" to remove duplication. Do not, without
  redoing the measurement.
- **Right fix:** treat `DIP_TTL_SECONDS` as a free, independent knob — raising it
  to 1800/3600 cuts upstream spend and touches nothing else.

Related: the 60s in-process `live:{symbol}` memo in `pages/wisesheets.py` *is*
shared, keyed by upstream resource rather than by feature. Opening `/dip` and
`/overview` for the same symbol costs one upstream call, not two.

### 3. `MOCK` is read at import time, and nine cache keys aren't namespaced

`services/__init__.py` picks the service class at import. `overview.py:MODE`
becomes `"mock"` or `"live"` at import. Only **dip** is mode-prefixed; the other
nine keys (`info_`, `current_price_`, `pricing_`, …) are not.

Why dip opted out: it was built later and would rather not add a tenth instance
of the problem.

- **Wrong fix:** flip `MOCK` and expect it to take effect. It needs a **restart**
  (import-time) *and* `clear_cache` (stale bytes otherwise served for up to 7
  days on the 604800s keys).
- **Wrong fix:** delete `MODE` as unused-looking complexity.
- **Right fix:** namespacing the nine legacy keys is a known deferred refactor,
  not a bug to fix in passing.

### 4. Setting `MOCK` in `scripts/check.py` would break the verifier

`check.py` deliberately never sets `MOCK`. The suite mocks `requests` at the
transport layer, and assertions reason about the live code path. Setting it makes
verification diverge from the app it verifies.

### 5. Two quota classes, and only one guards `/pages/dip`

- `AllowAnonymousWithQuota` — scalar, reads `request.data["symbol"]`. Used by the
  single-symbol endpoints.
- `AllowAnonymousWithQuotaList` — reads `request.data["symbols"]`. **Used by
  `/pages/dip`.**

They share the same `anon_quota:{session_id}` set, so a visitor's 5 symbols are
spent across both. Debugging a dip quota bug in the scalar class means reading
code that never runs for that route.

Two further subtleties:

- The scalar class **adds then checks**, so an over-limit symbol is already in the
  set (and the TTL refreshed) when it 403s. The list class **checks first** and
  writes only if the request fits — a denied request must not grow the set.
- The set is written via the **raw** redis connection, bypassing django-redis's
  key prefix, so `cache.clear()` in tests does **not** reset it. Quota state can
  leak between test runs and between `/dip` and single-symbol endpoints.

- **Wrong fix:** "consolidate these into one permission class" — the add/check
  ordering difference is the whole point.

### 6. `_value` emits the *string* `"None"`, not `None`

`pages/wisesheets.py`: unmatched Alpha Vantage fields are emitted as `"None"` to
match the AV fixture convention — annotators index keys directly and would
`KeyError` otherwise. Every AV fixture key is emitted per report so the live
service returns shape-identical data to `MockFinancialDataService`.

- **Wrong fix:** "clean up" these to real `None` for type-correctness. It breaks
  the mock/live parity contract and can break annotators.
- **Separately:** `PERatio`, `MarketCapitalization`, `SharesOutstanding` and
  `EPS` pass the raw upstream string through on purpose (AV-style), *not* through
  `_safe_float`/`_key`. That's documented in a comment right above them.

### 7. Service methods return a `Response` on error — they never raise

Views branch on `isinstance(data, Response)`. The contract is pinned in
`pages/services.py` and `pages/wisesheets.py`.

- **Wrong fix:** convert error paths to exceptions for "cleaner" control flow.
  Every view's error handling stops working.

### 8. `pages/` routes have no trailing slash, on purpose

`pages/urls.py` documents it: `APPEND_SLASH` would 301 a POST, and `fetch`
follows a 301 as a GET, turning it into a 405.

- **Wrong fix:** add trailing slashes for consistency with `admin/`.

### 9. Upstream errors are never cached — but *degraded* dip rows are

`pages/wisesheets.py` memoizes upstream values in a process-local dict and
returns without caching on error. Meanwhile `overview.py:dip` caches degraded
rows too, because quota — not staleness — is the binding constraint on the free
plan.

- **Wrong fix:** "don't cache failures" applied to dip. A symbol whose upstream
  flaps would re-fetch on every request and burn quota.

### 10. Silent exception swallowing

`accounts/auto_refresh_jwt_middleware.py` has `except Exception: pass` — a failed
refresh silently leaves the request anonymous, which then looks like a quota bug.
This is intentional but makes failures invisible; check it before chasing a
mysterious 403.

### 11. `import_symbol_model` defaults to the expensive source

`--source wisesheets` (the default) paginates `/companies/` and can spend
~1,000 requests of the shared 5,000/month free tier. `--source sec` makes one
free SEC EDGAR call.

- **Right fix:** `--source sec` unless you specifically need the WiseSheets data.

### 12. Tests must not read gitignored files

This one actually happened: CI failed on the first PR with two gates red that
were green locally, because the suite silently depended on files that are not in
the repo — `pages/statement_samples/*.json` (generated, gitignored) and
`client/.env`. The suite had never been runnable from a clean checkout.

- **Wrong fix:** "works on my machine" — regenerate the samples in CI. That
  spends real WiseSheets quota on every run and still leaves the frontend broken.
- **Right fix:** test data must be committed. `overview_payload` (conftest.py)
  reads a tracked fixture, and `client/.env.test` pins the test-mode config.
- **How to check:** hide the gitignored files and run the gate —
  `mv statement_samples{,.hidden}`, same for `client/.env` and `server/.env`,
  then `python scripts/check.py`. That is CI's exact situation.

Anything a test reads must be in git. If it is not, the test passes locally and
fails for everyone else, which is worse than no test.

### 13. Never run `pipenv` from the repo root

The Pipfile is in `server/`. Running pipenv from the root resolves against
`~/.virtualenvs/corecomp-*` instead of the project's `server-*` environment and
gives a different interpreter (or a confusing `No module named …`). It also
silently *creates a `Pipfile` at the repo root* pinning whatever Python it
found. `check.py` pins `PIPENV_PIPFILE` for exactly this reason; if a root
`Pipfile` appears, that is what happened — delete it.

### 14. `pipenv run` overrides your environment with `server/.env`

The one that nearly cost real money. **`pipenv run <cmd>` loads `server/.env`
and overwrites the process environment with it** — it does not defer to
variables you already set.

```
$ MOCK=True pipenv run python -c "import os; print(os.getenv('MOCK'))"
Loading .env environment variables...
False          # <- server/.env's value won
```

Why it matters: a browser suite that meant to run on fixtures would have run
against **live WiseSheets and spent the shared quota**, with no error to show
for it. It also silently discarded every variable `scripts/check.py` sets
(`REDIS_CACHE_LOCATION`, `CSRF_TRUSTED_ORIGINS`, any `CORECOMP_TEST_*`
override) — invisible locally only because `server/.env` happens to hold usable
values on a developer machine.

- **Wrong fix:** pass the env to `pipenv run` and assume it arrives.
- **Right fix:** invoke the virtualenv's interpreter directly —
  `pipenv --venv` then `<venv>/Scripts/python.exe` (Windows) or
  `<venv>/bin/python`. Both `scripts/check.py:python_cmd()` and
  `client/e2e/env.ts:pythonExe()` resolve this way.
- **How to check:** `MOCK=True <resolved-python> -c "import os; print(os.getenv('MOCK'))"`
  should print `True`.

---

## Known gaps

Recorded so nobody assumes coverage that doesn't exist.

| Gap | Detail |
|---|---|
| **`.tsx`/`.ts` are not linted** | `client/eslint.config.js` globs `{js,jsx}` only. 18 `.tsx` + 2 `.ts` files escape ESLint. `tsc --noEmit` covers them partially, but it only sees ~20 files (`allowJs: false`) |
| **E2E covers dip + the quota boundary only** | A Playwright harness exists (see below), but `/overview/:symbol` and the auth flows are not yet covered by it |
| **Cache mode-namespacing** | Nine legacy keys still un-prefixed (trap 3). Deferred, not fixed |
| **Stampede locks** | `info` and `current_price` lack the `redis.lock` that the cheaper views have; a cold `info` hit by N requests does 4N upstream calls |
| **`tickers` batching** | `get_live_row` indexes `rows[0]`, assuming the plural param returns one row. Unverified against the real API |
| **The verifier does not test your feature** | A green `check.py` means *nothing else broke*. It does not mean the new thing works — that needs a test you write. See the `reproduce-bug` skill |

---

## What is actually mutation-verified

A passing test proves nothing until you have seen it fail. These were checked by
deliberately breaking the code and confirming the suite goes red:

| Mutation | Caught by |
|---|---|
| Quota limit removed entirely | `test_anonymous_quota.py` |
| Quota set written with no TTL | `test_quota_set_carries_an_expiry` |
| Symbol case not normalised (`ibm` vs `IBM`) | `test_symbol_case_does_not_consume_extra_quota` |
| Dip list permission writes before checking | `test_single_symbol_spend_counts_against_dip` |
| `AllowAny` views no longer skip CSRF | `test_csrf_auth.py` |
| CSRF enforced on every request | `test_csrf_auth.py` |
| Quota relaxed on the batch permission (`QUOTA 5 -> 99`) | `e2e/anon/dip-quota.spec.ts` |
| Any request leaving localhost | `client/e2e/fixtures.ts` hermetic guard |

The middle two were **not** caught until those tests were written — the quota
TTL and the case normalisation had no defence at all, which is exactly the kind
of hole that looks covered.

Not mutation-checked: everything else. Treat other tests as documents of intent
until you have seen them fail.

## Browser tests (Playwright)

There is a real browser suite for the things jsdom cannot see: cookies crossing
ports, CORS preflight, the `X-Anonymous-Session` header, `localStorage`
persistence, and the quota as the browser actually experiences it.

```bash
python scripts/check.py --e2e     # or: cd client && npm run e2e
```

**`--e2e` is NOT part of the default gate list** on purpose. Every other gate
runs the live code path and never sets `MOCK`; the browser gate sets `MOCK=True`
and its own Redis DB. Folding it in would break that guarantee.

What it runs against: a real Django server on `:8000` with `MOCK=True`, and the
SPA built into `client/dist-e2e` and served by `vite preview` on `:4173`. Both
are started by `playwright.config.ts`. `e2e_prepare` migrates, flushes Redis DB
2, and seeds the `Symbol` table first.

Things to know before editing it:

- **Both sides must say `localhost`.** `localhost` and `127.0.0.1` are different
  origins *and* cross-site for cookies, so a mismatch makes the browser withhold
  `access_token`/`csrftoken` and every request silently looks anonymous. The
  hermetic guard deliberately does not allowlist `127.0.0.1` so this fails loudly.
- **The hermetic guard** (`client/e2e/fixtures.ts`) fails any test whose browser
  contacts a non-localhost host. Two hosts are allowlisted-and-aborted, each with
  a written reason: `accounts.google.com/gsi/*` (loaded on *every* route by
  `GoogleOAuthProvider`) and `img.logo.dev` (logos — aborting also exercises the
  ticker-chip fallback, so assert the chip, not an `<img>`).
- **Auth without Google**: `scripts/e2e_mint_token.py` mints a JWT offline. It
  lives outside `server/` so it can never be deployed, and refuses to run unless
  `MOCK=True` and `AUTH_COOKIE_SECURE=False`.
- **`AUTH_COOKIE_SECURE` is `True` unless the value is the literal string
  `"False"`.** Get it wrong and the browser drops the cookie over plain http.
- **A `<header>` nested in `<section>` loses the implicit `banner` role.** The
  landing page does this (`Landing.tsx:14-15`), so query `locator('header')`
  rather than `getByRole('banner')` if you want to match every route.

## Verifying a change

```bash
python scripts/check.py     # every gate; see the `check` skill
```

For anything touching quota, auth, or caching: read the traps above **before**
deciding the change is safe. For a reported bug, use the `reproduce-bug` skill —
symptom → failing test → fix → red-to-green → keep the test.
