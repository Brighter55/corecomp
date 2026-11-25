"""Pure portfolio math. No Django, no DRF, no I/O.

Units, cost basis and realized gains come from the share-count engine in
`holdings`. Provider closes are split-adjusted across the whole history, so a
historical value restates the units held that day into today's share units
using every recorded split after it. Pairing a pre-split unit count with an
adjusted close would shrink every pre-split point by the split factor.

Dividends use `adjDividend`, which the provider also expresses in today's share
units, so the same adjustment applies before multiplying.

Profit. `invested` is net cash contributed, meaning buys minus sells.
`profit = value + dividends - invested`, which counts realized gains from a sale
as profit and does not double count the cash received. Returns divide that
profit by cost basis: the summary uses the total cost basis of the holdings
still owned, and a position uses its own, falling back to the dollars purchased
when it is fully sold so the loss still shows.
"""

from bisect import bisect_right
from datetime import date, timedelta

from . import holdings

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

_FAR_FUTURE = "9999-12-31"


def _to_float(value):
    if value is None:
        return None
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def _day(value):
    """ISO date string, so a date object and a string compare the same way."""
    if hasattr(value, "isoformat"):
        return value.isoformat()
    return str(value)


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


def close_lookup(prices):
    """`close_for(symbol, day)` for the holdings engine, at or before `day`."""
    index = _index(prices)

    def lookup(symbol, day):
        return _price_at(index, symbol, day)[1]

    return lookup


def _adjusted_units(step, symbol, day, splits):
    """Units held on `day` restated into today's share units.

    Provider closes are split-adjusted across the whole history, so a unit
    count from before a recorded split must be scaled by every split after it.
    """
    units = _at(step, day)
    if units == 0:
        return 0.0
    return units * holdings.split_product(splits, symbol, day, _FAR_FUTURE)


def _buy_amounts(transactions):
    totals = {}
    for tx in transactions:
        if tx.get("kind") != "BUY":
            continue
        amount = _to_float(tx.get("amount")) or 0.0
        totals[tx["symbol"]] = totals.get(tx["symbol"], 0.0) + amount
    return totals


def _invested_pairs(transactions):
    pairs = []
    for tx in transactions:
        kind = tx.get("kind")
        if kind not in ("BUY", "SELL"):
            continue
        amount = _to_float(tx.get("amount"))
        if amount is None or amount < 0:
            continue
        pairs.append((tx["trade_date"], amount if kind == "BUY" else -amount))
    return pairs


def _has_split_after(splits, symbol, day):
    for split in splits or []:
        if split.get("symbol") != symbol:
            continue
        if _day(split["effective_date"]) > day:
            return True
    return False


def _position_split_factor(splits, symbol, first_date):
    if first_date is None:
        return None
    if not _has_split_after(splits, symbol, first_date):
        return None
    return holdings.split_product(splits, symbol, first_date, _FAR_FUTURE)


def _dividend_entries(transactions, dividends, states, splits):
    """One `(day, symbol, signed_cash)` per payment, one source per symbol.

    A symbol with any ledger DIVIDEND row uses the ledger. A DTAX row is foreign
    withholding stored positive, so it subtracts. Every other symbol uses the
    provider's adjusted dividend against the units held on the ex-date.
    """
    ledger_symbols = {
        tx["symbol"] for tx in transactions if tx.get("kind") == "DIVIDEND"
    }

    entries = []
    for tx in transactions:
        kind = tx.get("kind")
        if kind not in ("DIVIDEND", "DTAX"):
            continue
        symbol = tx["symbol"]
        if symbol not in ledger_symbols:
            continue
        amount = _to_float(tx.get("amount")) or 0.0
        entries.append(
            (tx["trade_date"], symbol, amount if kind == "DIVIDEND" else -amount)
        )

    for symbol, rows in (dividends or {}).items():
        if symbol in ledger_symbols:
            continue
        state = (states or {}).get(symbol)
        if state is None:
            continue
        step = state["unit_steps"]
        for ex_date, amount in rows:
            units = _adjusted_units(step, symbol, ex_date, splits)
            if units > 0 and amount:
                entries.append((ex_date, symbol, units * amount))
    return entries


def build_positions(transactions, splits, prices, states, dividends, end):
    """One row per held symbol, valued from the engine's final state."""
    index = _index(prices)
    bought = _buy_amounts(transactions)

    first_date = {}
    shares_typed = {}
    for tx in transactions:
        kind = tx.get("kind")
        if kind not in ("BUY", "SELL"):
            continue
        symbol = tx["symbol"]
        first_date[symbol] = min(
            first_date.get(symbol, tx["trade_date"]), tx["trade_date"]
        )
        typed = _to_float(tx.get("shares"))
        if typed is not None:
            shares_typed[symbol] = shares_typed.get(symbol, 0.0) + (
                typed if kind == "BUY" else -typed
            )

    dividends_by_symbol = {}
    for day, symbol, cash in _dividend_entries(
        transactions, dividends, states, splits
    ):
        if day <= end:
            dividends_by_symbol[symbol] = dividends_by_symbol.get(symbol, 0.0) + cash

    positions = []
    for symbol, state in states.items():
        units = state["units"]
        latest_date, latest = _latest(index, symbol)
        market_value = units * latest if latest is not None else 0.0
        cost_basis = state["cost_basis"]
        realized = state["realized"]
        dividends_paid = dividends_by_symbol.get(symbol, 0.0)
        profit = market_value - cost_basis + realized + dividends_paid
        denominator = cost_basis if cost_basis > 0 else bought.get(symbol, 0.0)
        lifetime = round(profit / denominator * 100, 4) if denominator else None

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
            "cost_basis": round(cost_basis, 2),
            "average_cost": state["average_cost"],
            "realized": round(realized, 2),
            "unrealized": round(market_value - cost_basis, 2),
            "profit": round(profit, 2),
            "return_pct": lifetime,
            "period_returns": period_returns,
            "first_date": first_date.get(symbol),
            "shares_typed": round(shares_typed[symbol], 8) if symbol in shares_typed else None,
            "split_factor": _position_split_factor(
                splits, symbol, first_date.get(symbol)
            ),
        })

    positions.sort(key=lambda row: row["market_value"], reverse=True)
    return positions


def income_projection(states, dividends, end, total_value):
    """Forward dividend income from the units held now.

    Provider rows are split-adjusted, so the current unit count multiplies the
    per-share amounts directly. Gross of foreign withholding.
    """
    end_day = date.fromisoformat(_day(end))
    end_iso = end_day.isoformat()
    current_from = (end_day - timedelta(days=365)).isoformat()
    prior_from = (end_day - timedelta(days=730)).isoformat()

    current_total = 0.0
    prior_total = 0.0
    for symbol, state in (states or {}).items():
        units = state.get("units", 0.0)
        if units <= 0:
            continue
        for ex_date, amount in (dividends or {}).get(symbol, []):
            per_share = _to_float(amount) or 0.0
            if not per_share:
                continue
            day = _day(ex_date)
            if current_from <= day <= end_iso:
                current_total += per_share * units
            elif prior_from <= day < current_from:
                prior_total += per_share * units

    current_income = round(current_total, 2)
    prior_income = round(prior_total, 2)
    return {
        "forward_income": current_income,
        "forward_yield_pct": (
            round(current_income / total_value * 100, 4) if total_value else None
        ),
        "dividend_growth_pct": (
            round((current_income - prior_income) / prior_income * 100, 4)
            if prior_income
            else None
        ),
    }


def with_live_close(prices, quotes, day):
    """Copy of `prices` with a live-price row appended for `day` where missing."""
    if not quotes or not day:
        return prices

    result = {}
    for symbol, rows in (prices or {}).items():
        live = quotes.get(symbol)
        if live is None or (rows and rows[-1][0] >= day):
            result[symbol] = rows
            continue
        result[symbol] = list(rows) + [(day, live, live)]
    return result


def build_series(
    transactions,
    prices,
    dividends,
    splits,
    states,
    benchmark_symbol,
    benchmark_prices,
    benchmark_dividends,
    start=None,
    end=None,
):
    """Value, invested capital, cash dividends and the benchmark replay."""
    index = _index(prices)
    benchmark_index = _index(benchmark_prices)

    unit_steps = {symbol: state["unit_steps"] for symbol, state in states.items()}
    invest_step = _step_function(_invested_pairs(transactions))

    dividend_step = _step_function([
        (day, cash)
        for day, _symbol, cash in _dividend_entries(
            transactions, dividends, states, splits
        )
    ])

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
            units = _adjusted_units(step, symbol, day, splits)
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


def summarize(series, cost_basis):
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
            round(profit / cost_basis * 100, 4) if cost_basis else None
        ),
        "benchmark_value": round(benchmark_value, 2),
        "benchmark_profit": round(benchmark_value - invested, 2),
        "benchmark_return_pct": (
            round((benchmark_value - invested) / invested * 100, 4)
            if invested
            else None
        ),
    }
