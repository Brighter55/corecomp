"""Pure portfolio math. No Django, no DRF, no I/O.

Units rule. A holding is dollars, not shares. For each BUY, units is the
dollars paid divided by the split-adjusted close on the purchase date; a SELL
subtracts dollars proceeds divided the same way. The provider's `close` is
already restated into today's share units across the whole history, so this
yields the correct current share count without any split data. A 10:1 split
needs no special case, and no branch on a split exists anywhere below.

Dividends use `adjDividend`, which the provider also expresses in today's share
units, so `units * adjDividend` is the cash actually received. Pairing an
unadjusted dividend with a current-terms unit count would overstate every
pre-split payment by the split factor.

Profit. `invested` is net cash contributed, meaning buys minus sells.
`profit = value + dividends - invested`, which counts realized gains from a sale
as profit and does not double count the cash received.
"""

from bisect import bisect_right
from datetime import date, timedelta

KNOWN_SPLIT_FACTORS = (0.1, 0.5, 1.5, 2.0, 3.0, 4.0, 5.0, 7.0, 10.0, 15.0, 20.0)
SPLIT_TOLERANCE = 0.03

PERIODS = ("1d", "7d", "1m", "3m", "6m", "ytd", "1y", "5y", "all")
PERIOD_DAYS = {
    "1d": 1,
    "7d": 7,
    "1m": 30,
    "3m": 91,
    "6m": 182,
    "1y": 365,
    "5y": 365 * 5,
}


def _to_float(value):
    if value is None:
        return None
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def _index(prices):
    return {
        symbol: ([row[0] for row in series], series)
        for symbol, series in (prices or {}).items()
    }


def _price_at(index, symbol, day):
    """(date, close) at or before `day`, falling back to the first row.

    The fallback is for a purchase that predates the available price window.
    """
    entry = index.get(symbol)
    if not entry or not entry[1]:
        return None, None
    dates, rows = entry
    position = bisect_right(dates, day) - 1
    if position < 0:
        position = 0
    row = rows[position]
    return row[0], row[1]


def _close_at(index, symbol, day):
    """Close at or before `day`, or None before the symbol's first row."""
    entry = index.get(symbol)
    if not entry or not entry[1]:
        return None
    dates, rows = entry
    position = bisect_right(dates, day) - 1
    if position < 0:
        return None
    return rows[position][1]


def _latest(index, symbol):
    """(date, close) of the last row, or (None, None)."""
    entry = index.get(symbol)
    if not entry or not entry[1]:
        return None, None
    row = entry[1][-1]
    return row[0], row[1]


def _anchor_date(period, latest):
    """Start date for a period label, or None when the label is 'all'."""
    end = date.fromisoformat(latest)
    if period == "ytd":
        return date(end.year, 1, 1).isoformat()
    days = PERIOD_DAYS.get(period)
    if days is None:
        return None
    return (end - timedelta(days=days)).isoformat()


def _step_function(pairs):
    """[(day, delta), ...] -> (days, cumulative) sorted by day."""
    total = 0.0
    days, values = [], []
    for day, delta in sorted(pairs, key=lambda item: item[0]):
        total += delta
        days.append(day)
        values.append(total)
    return days, values


def _at(step, day):
    """Cumulative value for every step on or before `day`."""
    days, values = step
    position = bisect_right(days, day) - 1
    return values[position] if position >= 0 else 0.0


def split_factor(units, shares_typed):
    """The cumulative split factor since purchase, or None when uncertain.

    Advisory only. It exists to label a derived share count, never to decide a
    valuation. A rounded price or an intraday fill lands near a factor without
    matching it, so a result outside the tolerance is reported as unknown rather
    than guessed.
    """
    shares = _to_float(shares_typed)
    if shares is None or shares <= 0:
        return None
    ratio = units / shares
    for factor in KNOWN_SPLIT_FACTORS:
        if abs(ratio - factor) / factor <= SPLIT_TOLERANCE:
            return factor
    return None


def _trade_pairs(transactions, index):
    """Cumulative unit deltas and net invested cash, per symbol and overall."""
    unit_pairs = {}
    invest_pairs = []
    for tx in transactions:
        kind = tx.get("kind")
        if kind not in ("BUY", "SELL"):
            continue
        amount = _to_float(tx.get("amount"))
        if amount is None or amount < 0:
            continue
        symbol = tx["symbol"]
        _, close = _price_at(index, symbol, tx["trade_date"])
        if not close:
            continue
        units = amount / close
        if kind == "SELL":
            units = -units
            invested = -amount
        else:
            invested = amount
        unit_pairs.setdefault(symbol, []).append((tx["trade_date"], units))
        invest_pairs.append((tx["trade_date"], invested))
    return unit_pairs, invest_pairs


def build_positions(transactions, prices):
    """One row per symbol with units, cost basis and current value."""
    index = _index(prices)
    unit_pairs, _ = _trade_pairs(transactions, index)

    shares_typed = {}
    cost_basis = {}
    first_date = {}
    for tx in transactions:
        kind = tx.get("kind")
        if kind not in ("BUY", "SELL"):
            continue
        symbol = tx["symbol"]
        amount = _to_float(tx.get("amount")) or 0.0
        cost_basis[symbol] = cost_basis.get(symbol, 0.0) + (
            amount if kind == "BUY" else -amount
        )
        first_date[symbol] = min(
            first_date.get(symbol, tx["trade_date"]), tx["trade_date"]
        )
        typed = _to_float(tx.get("shares"))
        if typed is not None:
            shares_typed[symbol] = shares_typed.get(symbol, 0.0) + (
                typed if kind == "BUY" else -typed
            )

    positions = []
    for symbol, pairs in unit_pairs.items():
        units = sum(delta for _, delta in pairs)
        latest_date, latest = _latest(index, symbol)
        market_value = units * latest if latest is not None else 0.0
        basis = cost_basis.get(symbol, 0.0)
        lifetime = (
            round((market_value - basis) / basis * 100, 4) if basis else None
        )

        period_returns = {}
        for period in PERIODS:
            if period == "all":
                period_returns[period] = lifetime
                continue
            anchor = _anchor_date(period, latest_date) if latest_date else None
            if anchor is None or latest is None:
                period_returns[period] = None
                continue
            _, anchor_close = _price_at(index, symbol, anchor)
            period_returns[period] = (
                round((latest / anchor_close - 1) * 100, 4)
                if anchor_close
                else None
            )

        positions.append({
            "symbol": symbol,
            "units": round(units, 8),
            "price": latest,
            "market_value": round(market_value, 2),
            "cost_basis": round(basis, 2),
            "return_pct": lifetime,
            "period_returns": period_returns,
            "first_date": first_date.get(symbol),
            "shares_typed": round(shares_typed[symbol], 8) if symbol in shares_typed else None,
            "split_factor": split_factor(units, shares_typed.get(symbol)),
        })

    positions.sort(key=lambda row: row["market_value"], reverse=True)
    return positions


def build_series(
    transactions,
    prices,
    dividends,
    benchmark_symbol,
    benchmark_prices,
    benchmark_dividends,
    start=None,
    end=None,
):
    """Value, invested capital, cash dividends and the benchmark replay."""
    index = _index(prices)
    benchmark_index = _index(benchmark_prices)
    unit_pairs, invest_pairs = _trade_pairs(transactions, index)

    unit_steps = {
        symbol: _step_function(pairs) for symbol, pairs in unit_pairs.items()
    }
    invest_step = _step_function(invest_pairs)

    dividend_pairs = []
    for symbol, rows in (dividends or {}).items():
        step = unit_steps.get(symbol)
        if step is None:
            continue
        for ex_date, amount in rows:
            held = _at(step, ex_date)
            if held > 0 and amount:
                dividend_pairs.append((ex_date, held * amount))
    dividend_step = _step_function(dividend_pairs)

    benchmark_unit_pairs = []
    for tx in transactions:
        kind = tx.get("kind")
        if kind not in ("BUY", "SELL"):
            continue
        amount = _to_float(tx.get("amount"))
        if amount is None or amount < 0:
            continue
        _, close = _price_at(benchmark_index, benchmark_symbol, tx["trade_date"])
        if not close:
            continue
        units = amount / close
        benchmark_unit_pairs.append(
            (tx["trade_date"], -units if kind == "SELL" else units)
        )
    benchmark_unit_step = _step_function(benchmark_unit_pairs)

    benchmark_dividend_pairs = []
    for ex_date, amount in (benchmark_dividends or {}).get(benchmark_symbol, []):
        held = _at(benchmark_unit_step, ex_date)
        if held > 0 and amount:
            benchmark_dividend_pairs.append((ex_date, held * amount))
    benchmark_dividend_step = _step_function(benchmark_dividend_pairs)

    calendar = {row[0] for series in (prices or {}).values() for row in series}
    calendar.update(
        row[0] for row in (benchmark_prices or {}).get(benchmark_symbol, [])
    )
    dates = sorted(calendar)
    if start:
        dates = [day for day in dates if day >= start]
    if end:
        dates = [day for day in dates if day <= end]
    if not dates and end:
        # The window holds no session, which is what a buy dated today looks
        # like before the provider publishes the close. Anchor on the end date
        # and let _close_at carry the last known close, so the point shows the
        # holding at its cost rather than nothing at all.
        dates = [end]

    series = {
        "dates": dates,
        "value": [],
        "invested": [],
        "dividends": [],
        "benchmark_value": [],
        "benchmark_dividends": [],
    }
    for day in dates:
        value = 0.0
        for symbol, step in unit_steps.items():
            units = _at(step, day)
            if units == 0:
                continue
            close = _close_at(index, symbol, day)
            if close is None:
                continue
            value += units * close

        benchmark_close = _close_at(benchmark_index, benchmark_symbol, day)
        benchmark_value = (
            _at(benchmark_unit_step, day) * benchmark_close
            if benchmark_close is not None
            else 0.0
        )

        series["value"].append(round(value, 2))
        series["invested"].append(round(_at(invest_step, day), 2))
        series["dividends"].append(round(_at(dividend_step, day), 2))
        series["benchmark_value"].append(round(benchmark_value, 2))
        series["benchmark_dividends"].append(
            round(_at(benchmark_dividend_step, day), 2)
        )
    return series


def summarize(series):
    """Headline numbers from the last point of a series."""
    if not series["dates"]:
        return {
            "value": 0.0,
            "invested": 0.0,
            "dividends": 0.0,
            "profit": 0.0,
            "return_pct": None,
            "benchmark_value": 0.0,
            "benchmark_profit": 0.0,
            "benchmark_return_pct": None,
        }

    value = series["value"][-1]
    invested = series["invested"][-1]
    dividends = series["dividends"][-1]
    benchmark_value = series["benchmark_value"][-1] + series["benchmark_dividends"][-1]
    profit = round(value + dividends - invested, 2)

    return {
        "value": value,
        "invested": invested,
        "dividends": dividends,
        "profit": profit,
        "return_pct": (
            round(profit / invested * 100, 4) if invested else None
        ),
        "benchmark_value": round(benchmark_value, 2),
        "benchmark_profit": round(benchmark_value - invested, 2),
        "benchmark_return_pct": (
            round((benchmark_value - invested) / invested * 100, 4)
            if invested
            else None
        ),
    }
