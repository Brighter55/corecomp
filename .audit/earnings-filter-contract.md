# Frozen contract: earnings calendar filter, and the header entry

Second increment on the earnings calendar, built on the merged first one. Read [earnings-calendar-contract.md](earnings-calendar-contract.md) first, since this extends its response shape. Both workers code against this file.

## Why market cap needs a second provider

Alpha Vantage's `EARNINGS_CALENDAR` returns only `symbol, name, reportDate, fiscalDateEnding, estimate, currency, timeOfTheDay`. There is no size field and no parameter to request one, so the calendar feed cannot answer a market cap question.

Market cap already exists in this repo. `wisesheets.py` requests `marketCap` inside `LIVE_FIELDS`, `trending.py` already ranks its movers by it, and `get_live_rows(symbols)` resolves it for up to 25 symbols per request, which is the provider's own ceiling. That batched call is the data path, and it costs one WiseSheets request per 25 symbols resolved.

Measured window sizes, so the cost is visible: the Oct 12 to 16 week holds 70 symbols, or 3 requests. The busiest single day holds 320, or 13 requests. All of October holds roughly 1,150, or about 46 requests. Cached per symbol, those are paid once per cache period and shared by every visitor rather than per view.

## Response change

Each tile in the calendar response gains two fields.

```json
{
  "symbol": "JPM",
  "name": "J P Morgan Chase & Co",
  "estimate": 4.33,
  "marketCap": 812000000000,
  "popular": true
}
```

- `marketCap` is a number or `null`. `null` means unresolved, which is not the same as small.
- `popular` is a boolean, computed server-side from a curated list.

Both live on the tile rather than in a separate lookup so the client can filter with no round trip and no second copy of the curated list. The client must never compute `popular` itself, since that would put the definition of popular in two places.

## Filter semantics

Five options, single-select, applied client-side over the tiles the response already carries.

- `all`, the default, shows every tile.
- `popular` shows tiles where `popular` is true.
- `cap100b`, `cap10b`, `cap1b` show tiles where `marketCap` is at least 100,000,000,000, 10,000,000,000, and 1,000,000,000 respectively.

A tile whose `marketCap` is `null` fails every threshold filter, because an unknown size is not a size above a threshold. That is deliberate and honest rather than treating unknown as zero or as passing.

The weekly board filters tiles inside each session group, and a group left with no tiles disappears, matching the server's existing rule that only non-empty groups are sent. The monthly grid filters before its per-cell cap and before its overflow count, so the count describes what the filter actually left. A day with nothing left reads as empty rather than as an error.

## Backend

**NEW `server/corecomp/pages/market_caps.py`** owns market cap and the definition of popular.

- `POPULAR`, a curated `frozenset` of well-known large caps. Start from `trending.UNIVERSE` and extend to roughly the S&P 100 so the filter is useful rather than near-empty. This is the one subjective definition in the feature, so it lives in exactly one place and is easy to change. Comment where it came from.
- `is_popular(symbol) -> bool`.
- `get_market_caps(symbols) -> dict[str, float | None]` resolves a batch, with a Redis per-symbol cache. Cache each symbol under `{MODE}:market_cap_{symbol}` for 604800 seconds, a week, following `info_{symbol}` which already carries a market cap at that TTL. Resolve only the misses, in batches of 25 through `wisesheets.get_live_rows`. A symbol that comes back unknown, or a batch that errors, caches as `None` for a short retry window rather than a week, so one upstream failure does not pin a symbol as sizeless.

Follow the existing error convention. `fetch_wisesheets` returns a DRF `Response` on 401/403, 429, timeout and 5xx, and `_upstream` never caches a `Response`.

**EDIT `server/corecomp/pages/earnings_calendar.py`.** `window_payload` gains an optional `caps` argument and stamps `marketCap` and `popular` onto each tile. It stays the only function that produces the response shape, so nothing else may hand-write the wire form.

**EDIT `server/corecomp/pages/views/overview.py`.** The `earnings_calendar` view resolves market caps for the symbols in the requested window and passes them to `window_payload`. Resolution is a nicety rather than core data, so if it fails the calendar must still render with `marketCap: null` everywhere instead of returning an error. Do not resolve caps for the whole three month calendar, only for the requested window.

## Frontend

**Filter button.** Placed immediately LEFT of the Weekly and Monthly toggle, inside a new flex wrapper around the button and the existing `role="radiogroup"` at `EarningsToolbar.jsx:34`. The wrapper replaces the radiogroup as the right-hand child of the toolbar's `justify-between` row, so the toggle stays flush right. Reuse the `NAV_BUTTON` constant at `EarningsToolbar.jsx:9-10` and match the aria-label convention used by `Previous week` and `Next week`. The button must show that a filter is active, not only when the popup is open.

**Filter popup.** Reuse the existing shadcn `popover` primitive at `client/src/components/ui/popover.tsx`, as `src/shared/Explanation.jsx` and `src/shared/SymbolSearch.jsx` already do. Do NOT add `@radix-ui/react-radio-group`. It is not a dependency and this feature does not justify a new one, so build a bespoke `role="radiogroup"` with `role="radio"` buttons mirroring the view toggle in the same toolbar file. There is one radio pattern in this repo and this keeps it at one.

**Task 2, the header entry.** In `client/src/headers/product-header/ProductHeader.jsx`, add an Earnings item to the Features dropdown, after the Dip Finder button and before the closing `</div>` at line 96. Items are `<button type="button">` calling `handleItemClicked(path)`, each holding two `<p>` lines, a `text-sm font-semibold text-[var(--text-main)]` label and a `text-xs text-[var(--text-muted)]` description. Use the path `/earnings`. Add the matching entry to the mobile menu as well, after line 192, since that list is maintained separately and would otherwise be missing it. Do not touch `LandingHeader.tsx`, whose Features is an anchor into the marketing page, not a nav dropdown.

## Tests

- Backend covers the filter's data path: a resolved cap lands on the tile, an unresolved one becomes `null`, a popular symbol is flagged, the per-symbol cache is used on a second call, and an upstream error degrades to `null` rather than a failure.
- Frontend covers the behaviour a user sees: each radio narrows the visible tiles, a `null` market cap disappears under a threshold filter, the overflow count reflects the filtered set, and the empty state appears when nothing matches.

## Not in scope

Error UI for a failed market cap resolution. The calendar renders with unknown sizes instead, and the filter then shows an empty result. Flag it if it turns out to matter.
