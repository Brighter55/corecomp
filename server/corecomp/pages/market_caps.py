"""Market cap resolution, and the curated definition of "popular".

The earnings calendar feed (Alpha Vantage EARNINGS_CALENDAR) carries no size
field, so a market-cap filter needs a second provider. Market cap already lives
in WiseSheets: `wisesheets.get_live_rows` resolves `marketCap` for up to 25
symbols per request, the same batched path pages/trending.py ranks its movers
by. This module owns that lookup and caches it per symbol, so the calendar view
never talks to the provider directly and every visitor shares the cache.

The one subjective definition in the feature -- which symbols count as
"popular" -- lives here too, so the client can filter on it without holding a
second copy.
"""

import os

from django.core.cache import cache
from rest_framework.response import Response

from pages import wisesheets

# The same {MODE}: cache namespace the views build (pages/views/overview.py).
# Repeated rather than imported because the view imports this module, so the
# dependency runs one way and this constant cannot live above it. A test pins
# the two equal, so a change to how MOCK is read cannot drift them apart.
MODE = "mock" if os.getenv("MOCK") == "True" else "live"

# A resolved cap is stable for a week -- the same TTL info_{symbol} carries a
# market cap at. An unresolved symbol is retried far sooner: one upstream miss
# must not pin a symbol as sizeless for a week.
CAP_TTL_SECONDS = 604800
CAP_RETRY_TTL_SECONDS = 300

# The provider's own per-request ticker ceiling (see wisesheets.get_live_rows).
BATCH_SIZE = 25

# Curated, not computed, and case-insensitive (is_popular upper-cases first).
# The bar is recognition, not size: these are names a casual investor knows.
# It is deliberately 41 and much narrower than the cap100b threshold, so
# "Popular" reads as a distinct option rather than a near-duplicate of it. A
# longer list -- an S&P 100 draft was the first attempt -- collapses back into
# cap100b, since nearly every S&P 100 member is above 100 billion. Edit freely,
# but keep the bar at recognition and the size near this.
POPULAR = frozenset({
    "AAPL", "MSFT", "NVDA", "GOOGL", "AMZN", "META", "TSLA", "AVGO",
    "ORCL", "AMD", "NFLX", "INTC", "IBM", "JPM", "V", "MA", "BAC",
    "WFC", "GS", "UNH", "JNJ", "LLY", "PFE", "MRK", "WMT", "PG", "KO",
    "PEP", "COST", "HD", "MCD", "NKE", "DIS", "SBUX", "XOM", "CVX",
    "CAT", "BA", "GE", "VZ", "T",
})


def is_popular(symbol):
    """True when `symbol` is one of the curated household names."""
    return bool(symbol) and str(symbol).strip().upper() in POPULAR


def _as_float(value):
    """Coerce a provider field, or None. WiseSheets stringifies everything and
    uses the literal "None" for missing values; neither may reach a cap."""
    if value is None:
        return None
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


# Distinguishes a cached `None` ("unresolved this period") from an absent key.
_MISS = object()


def _cache_key(upper_symbol):
    return f"{MODE}:market_cap_{upper_symbol}"


def get_market_caps(symbols):
    """{symbol: market cap or None} for a batch, Redis-cached per symbol.

    Resolved caps are cached for a week; unresolved symbols -- absent upstream,
    no `marketCap` field, or a batch the provider rejected -- are cached as
    `None` for a short retry window, so one upstream failure cannot pin a
    symbol as sizeless for a week.

    Keys come back spelled as the caller passed them (so the caller can look a
    tile up with no case juggling); the cache key and the provider query use the
    upper-cased form. Only the misses cost anything: each batch of at most
    BATCH_SIZE symbols is one `wisesheets.get_live_rows` call. A provider error
    is a DRF Response, which `get_live_rows` returns rather than raising; it
    degrades this batch to `None` and is never cached long.
    """
    if MODE == "mock":
        # MOCK=True means fixtures and no network (client/e2e/env.ts pins it so
        # the browser suite spends no WiseSheets quota). The mock calendar is a
        # fixed payload with no real symbols to size, so there is nothing to
        # resolve and no reason to reach the provider.
        return {}

    caps = {}
    unresolved = []  # (upper, raw) pairs, one per distinct symbol

    for raw in dict.fromkeys(str(symbol).strip() for symbol in symbols):
        if not raw:
            continue
        upper = raw.upper()
        cached_value = cache.get(_cache_key(upper), _MISS)
        if cached_value is _MISS:
            unresolved.append((upper, raw))
        else:
            caps[raw] = cached_value

    for start in range(0, len(unresolved), BATCH_SIZE):
        _resolve(unresolved[start:start + BATCH_SIZE], caps)

    return caps


def _resolve(batch, caps):
    """Resolve one batch of (upper, raw) pairs and merge into `caps`."""
    rows = wisesheets.get_live_rows([upper for upper, _ in batch])
    failed = isinstance(rows, Response)
    by_upper = {} if failed else {key.upper(): row for key, row in rows.items()}

    for upper, raw in batch:
        cap = None if failed else _as_float((by_upper.get(upper) or {}).get("marketCap"))
        caps[raw] = cap
        cache.set(
            _cache_key(upper),
            cap,
            timeout=CAP_TTL_SECONDS if cap is not None else CAP_RETRY_TTL_SECONDS,
        )
