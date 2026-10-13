"""Market-wide earnings calendar: the domain, with no I/O.

Rows arrive from Alpha Vantage's EARNINGS_CALENDAR as CSV text. This module is
the one place they become the grouping the whole app shares: days sorted
ascending, each holding only its non-empty session groups, in the fixed order
before_open, after_close, unannounced, with tiles sorted by symbol. The view
caches build_payload's dict and slices it per request with window_payload;
nothing else invents the response shape.

As with pages/trending.py, the clock is injected (as_of, today) rather than read
here, so every function is pure and testable.
"""

import csv
import io
from datetime import date, timedelta

from pages.market_caps import is_popular

# The complete session vocabulary, in display order. Array order is display
# order, so the client needs no ordering table of its own.
SESSIONS = ("before_open", "after_close", "unannounced")

# Provider timeOfTheDay -> session. Only the two scheduled values are named, so
# any value we have never seen -- including the blank that is 78% of real rows --
# degrades into `unannounced` instead of being dropped or crashing the calendar.
# The mapping is total on purpose: a future provider value must land somewhere.
SESSION_BY_TIME_OF_DAY = {
    "pre-market": "before_open",
    "post-market": "after_close",
}

CSV_COLUMNS = (
    "symbol", "name", "reportDate", "fiscalDateEnding",
    "estimate", "currency", "timeOfTheDay",
)


def _as_float(value):
    """Coerce a provider field, or None if it is missing/unparseable.

    The estimate column is a string and is empty when absent; the codebase also
    uses the literal "None" for missing values elsewhere. Both fail float() and
    become None, which is the only value the contract allows besides a number.
    """
    if value is None:
        return None
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def _parse_date(value):
    """A reportDate string -> date, or None when missing/unparseable."""
    if not value:
        return None
    try:
        return date.fromisoformat(str(value).strip())
    except ValueError:
        return None


def build_payload(csv_text, as_of):
    """The whole forward calendar as {"asOf", "days"}.

    The one place rows become days and sessions. Skips any row whose reportDate
    is missing or unparseable; a body that reached here already passed the
    client's real-calendar guard, so this only ever mends a stray bad line.
    """
    grouped = {}  # iso_date -> {session -> [tile]}
    for row in csv.DictReader(io.StringIO(csv_text)):
        report_date = _parse_date(row.get("reportDate"))
        if report_date is None:
            continue
        iso_date = report_date.isoformat()
        session = SESSION_BY_TIME_OF_DAY.get(
            (row.get("timeOfTheDay") or "").strip(), "unannounced"
        )
        grouped.setdefault(iso_date, {}).setdefault(session, []).append({
            "symbol": (row.get("symbol") or "").strip(),
            "name": (row.get("name") or "").strip() or None,
            "estimate": _as_float(row.get("estimate")),
        })

    days = []
    for iso_date in sorted(grouped):
        sessions = [
            {"session": session, "tiles": sorted(tiles, key=lambda tile: tile["symbol"])}
            for session in SESSIONS
            for tiles in [grouped[iso_date].get(session)]
            if tiles
        ]
        days.append({"date": iso_date, "sessions": sessions})

    as_of_iso = as_of.isoformat() if hasattr(as_of, "isoformat") else as_of
    return {"asOf": as_of_iso, "days": days}


def _iso(value):
    """A date or ISO string -> ISO string, so the two spellings compare equal."""
    return value.isoformat() if hasattr(value, "isoformat") else value


def window_days(payload, start, end):
    """payload's days within the inclusive [start, end] range.

    The one definition of "the requested window". Dates compare as ISO strings,
    which sort correctly; a date absent from the result means an empty cell, and
    the client never re-derives the grid.
    """
    start_iso, end_iso = _iso(start), _iso(end)
    return [day for day in payload["days"] if start_iso <= day["date"] <= end_iso]


def window_symbols(payload, start, end):
    """The symbols the requested window actually carries.

    The view resolves market caps for exactly these, so cost tracks the window
    rather than the whole forward calendar -- a week is a few requests, three
    months is dozens.
    """
    return {
        tile["symbol"]
        for day in window_days(payload, start, end)
        for group in day["sessions"]
        for tile in group["tiles"]
    }


def _tile(tile, caps):
    """One tile of the response, with the filter's two fields stamped on.

    `marketCap` is a number or None; None means unresolved, which is not the
    same as small and fails every threshold filter. `popular` is computed
    server-side so the curated list never has a second copy on the client.
    """
    symbol = tile["symbol"]
    return {
        "symbol": symbol,
        "name": tile["name"],
        "estimate": tile["estimate"],
        "marketCap": caps.get(symbol),
        "popular": is_popular(symbol),
    }


def window_payload(payload, start, end, caps=None):
    """The response body: payload's days sliced to [start, end], plus envelope.

    The only function that produces the response shape, so nothing can hand-write
    a lookalike. Each tile is rebuilt rather than mutated, so stamping one
    window's market caps can never leak into the cached payload or into another
    window's response.

    `caps` maps symbol -> market cap (or None) for this window, already resolved
    by the caller. A symbol absent from it is stamped None.
    """
    caps = caps or {}
    days = [
        {
            "date": day["date"],
            "sessions": [
                {
                    "session": group["session"],
                    "tiles": [_tile(tile, caps) for tile in group["tiles"]],
                }
                for group in day["sessions"]
            ],
        }
        for day in window_days(payload, start, end)
    ]
    return {
        "asOf": payload["asOf"],
        "window": {"start": _iso(start), "end": _iso(end)},
        "days": days,
    }


def mock_payload(today):
    """A payload built in code for MOCK=True, never read from a fixture.

    Same reasoning as MockFinancialDataService.get_trending: statement_samples/
    is gitignored and generated, so a fixture-backed payload 500s on a clean
    checkout, and the e2e suite runs MOCK=True. Dates are relative to `today` and
    start at offset 0, so whatever window the page computes for the current week
    always overlaps real rows. All three sessions appear, including the
    blank-session `unannounced` group the live feed is mostly made of.

    Written as CSV and passed through build_payload so the mock obeys the exact
    same grouping and ordering rules as the live path instead of restating them.
    """
    # (day offset, timeOfTheDay, symbol, name, estimate)
    rows = [
        (0, "pre-market", "AAPL", "Apple Inc.", 1.35),
        (0, "pre-market", "MSFT", "Microsoft Corporation", 2.88),
        (0, "post-market", "NFLX", "Netflix, Inc.", 5.12),
        (0, "post-market", "TSLA", "Tesla, Inc.", 0.74),
        (1, "", "WAL", "Western Alliance Bancorporation", 1.86),
        (1, "", "SCHW", "The Charles Schwab Corporation", 0.77),
        (1, "", "TSM", "Taiwan Semiconductor Manufacturing", 1.79),
        (2, "pre-market", "JPM", "JPMorgan Chase & Co.", 3.42),
        (2, "", "XOM", "Exxon Mobil Corporation", 1.95),
        (3, "post-market", "AVGO", "Broadcom Inc.", 2.06),
        (3, "post-market", "ORCL", "Oracle Corporation", 1.44),
        (4, "pre-market", "UNH", "UnitedHealth Group Incorporated", 6.10),
        (4, "post-market", "V", "Visa Inc.", 2.35),
        (4, "", "KO", "The Coca-Cola Company", 0.72),
        (6, "pre-market", "WMT", "Walmart Inc.", 0.55),
        (8, "", "PG", "The Procter & Gamble Company", 1.68),
    ]

    buffer = io.StringIO()
    writer = csv.writer(buffer)
    writer.writerow(CSV_COLUMNS)
    for offset, time_of_day, symbol, name, estimate in rows:
        report_date = (today + timedelta(days=offset)).isoformat()
        writer.writerow([symbol, name, report_date, report_date, estimate, "USD", time_of_day])
    return build_payload(buffer.getvalue(), today)
