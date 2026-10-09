"""Ranked "today's movers" for the /overview landing page.

WiseSheets exposes no screener, gainers or most-active endpoint, so there is no
way to ask the provider what the market is doing. This ranks a fixed, curated
universe by day-over-day % change instead. The result is a leaderboard of
UNIVERSE, not of the market, and the UI is labelled accordingly.

Cost: two batched upstream requests per refresh, flat regardless of how many
symbols are in UNIVERSE.
"""

# Top-N handed to the landing page. 12 divides cleanly at every breakpoint the
# grid uses -- 12/4 = 3 pages, 12/2 = 6, 12/1 = 12 -- so the carousel never
# lands on a partial page. Changing this needs the frontend page math rechecked.
MOVERS_COUNT = 12

# The card's percentage is today's move, so the line drawn beside it has to
# describe roughly the same span -- a month of closes illustrates a different
# timescale than the number. WiseSheets exposes no intraday series (its period
# grammar is latest / lastNd / a date / a range), so a week of daily closes is
# the closest honest approximation: 5 sessions plus the live point.
SPARK_POINTS = 6

# Calendar days; two weeks is ~10 trading sessions, comfortably more than
# SPARK_POINTS needs and with slack for holidays. Also keeps the batch well
# clear of the provider's 10000-row limit -- the 4-year _eod_params window would
# be ~20,000 rows for this universe and would silently paginate into three
# requests.
HISTORY_DAYS = 14

# Curated, not computed. Capped at 25 because prices/live reports `limit: 25`
# as its per-request ticker ceiling (spike-verified).
UNIVERSE = (
    "AAPL", "MSFT", "NVDA", "AMZN", "GOOGL",
    "META", "TSLA", "AVGO", "JPM", "V",
    "UNH", "XOM", "JNJ", "WMT", "MA",
    "PG", "COST", "HD", "ORCL", "KO",
)


def _as_float(value):
    """Coerce a provider field, or None if it is missing/unparseable.

    prices/live returns every field as a string, and this codebase's provider
    uses the literal "None" for missing values -- neither may reach the payload,
    whose types the client's number formatting depends on.
    """
    if value is None:
        return None
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def rank_movers(quotes, history, today, count=MOVERS_COUNT):
    """Top `count` symbols by today's % change, highest first.

    quotes:  {symbol: {"name", "price", "marketCap"}} from the batched live call
    history: {symbol: [{"date", "close", "volume"}, ...]} oldest -> newest, from
             the batched eod call
    today:   the date to measure from, passed in rather than read from the clock
             so the ranking stays pure and testable

    `prices/eod` only carries *completed* sessions, so during a trading day its
    newest bar is yesterday's. Diffing the two newest bars therefore reports
    yesterday's move -- so while the session is open the live price is measured
    against the newest close instead. Once today's bar is published the live
    price equals it, and measuring live-against-it would collapse to ~0%, so
    that case goes back to the two bars.
    """
    movers = []
    today_iso = today.isoformat() if hasattr(today, "isoformat") else today

    for symbol, rows in history.items():
        if not rows:
            continue

        newest = rows[-1]
        live = _as_float((quotes.get(symbol) or {}).get("price"))

        if newest["date"] == today_iso:
            # Today's bar exists, so it is "current" and the previous session is
            # the reference. Needs a prior bar to measure against.
            if len(rows) < 2:
                continue
            current, previous = newest["close"], rows[-2]["close"]
            # The newest bar already IS the current price -- appending it would
            # only repeat the final sparkline point.
            has_live_point = False
        elif live is not None:
            current, previous = live, newest["close"]
            has_live_point = True
        elif len(rows) >= 2:
            # No live price to work with; fall back to the bars.
            current, previous = newest["close"], rows[-2]["close"]
            has_live_point = False
        else:
            continue

        # A zero previous close has no defined percentage change; ranking it as
        # 0 would put a meaningless row into the list.
        if not previous or current is None:
            continue

        # The series has to end on the same price the percentage is measured to,
        # or the line stops at yesterday's close while the card claims a move.
        closes = [row["close"] for row in rows]
        if has_live_point:
            closes.append(current)

        quote = quotes.get(symbol) or {}
        price = _as_float(quote.get("price"))
        movers.append({
            "symbol": symbol,
            "name": quote.get("name"),
            "price": price if price is not None else current,
            "percentChange": (current - previous) / previous * 100,
            "volume": newest.get("volume"),
            "marketCap": _as_float(quote.get("marketCap")),
            "spark": closes[-SPARK_POINTS:],
        })

    # Not rounded: the client rounds for display, and collapsing near-ties here
    # would make the order depend on float noise. Same reasoning as dip.
    movers.sort(key=lambda mover: mover["percentChange"], reverse=True)
    return movers[:count]
