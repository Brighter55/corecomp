"""Share-count holdings engine. Pure Python, no Django, no DRF, no I/O.

Units come from what the user bought. A split scales the running count, so a
10:1 split multiplies units and leaves cost basis alone. The reducer walks one
symbol's events in date order and applies every split before any trade on the
same day, because a split takes effect at the open.

Money leaves the walk rounded to two places. Units leave rounded to eight.
"""


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


def _ratio(numerator, denominator):
    """Positive numerator/denominator ratio, or None when unusable."""
    num = _to_float(numerator)
    den = _to_float(denominator)
    if num is None or den is None or num <= 0 or den <= 0:
        return None
    return num / den


def _event(day, symbol, kind, shares=0.0, amount=0.0, ratio=None):
    return {
        "date": day,
        "symbol": symbol,
        "kind": kind,
        "shares": shares,
        "amount": amount,
        "ratio": ratio,
    }


def normalise(transactions, splits, close_for):
    """Event list from ledger rows and provider splits.

    A row with `shares` uses them. A legacy row without them converts its
    dollars at the split-adjusted close, and is dropped when no close resolves.
    A split row needs a positive numerator and denominator.
    """
    events = []
    for row in transactions:
        kind = row.get("kind")
        if kind not in ("BUY", "SELL", "SPLIT"):
            continue
        symbol = row["symbol"]
        day = _day(row["trade_date"])

        if kind == "SPLIT":
            ratio = _to_float(row.get("ratio"))
            if ratio is None or ratio <= 0:
                ratio = _ratio(row.get("numerator"), row.get("denominator"))
            if ratio is not None:
                events.append(_event(day, symbol, "SPLIT", ratio=ratio))
            continue

        amount = _to_float(row.get("amount")) or 0.0
        shares = _to_float(row.get("shares"))
        if shares is None:
            close = _to_float(close_for(symbol, day))
            if not close:
                continue
            shares = amount / close
            if shares == 0:
                continue
        events.append(_event(day, symbol, kind, shares=shares, amount=amount))

    for split in splits or []:
        ratio = _ratio(split.get("numerator"), split.get("denominator"))
        if ratio is None:
            continue
        events.append(
            _event(
                _day(split["effective_date"]), split["symbol"], "SPLIT", ratio=ratio
            )
        )
    return events


def replay(events):
    """Final holding per symbol after walking its events oldest first.

    A sale removes cost at the average cost of that moment. An oversized sale
    clamps units at zero, resets the average, and books its cash against
    whatever cost remained.
    """
    grouped = {}
    for event in events:
        grouped.setdefault(event["symbol"], []).append(event)

    states = {}
    for symbol, symbol_events in grouped.items():
        ordered = sorted(
            symbol_events,
            key=lambda event: (event["date"], event["kind"] != "SPLIT"),
        )
        units = 0.0
        cost = 0.0
        realized = 0.0
        days = []
        step_units = []
        held = False

        for event in ordered:
            kind = event["kind"]
            if kind == "SPLIT":
                if not held:
                    continue
                units *= event["ratio"]
            elif kind == "BUY":
                held = True
                units += event["shares"]
                cost += event["amount"]
            else:
                held = True
                average = cost / units if units > 0 else 0.0
                removed = min(event["shares"], units) * average
                realized += event["amount"] - removed
                units = max(0.0, units - event["shares"])
                cost = cost - removed if units > 0 else 0.0

            if days and days[-1] == event["date"]:
                step_units[-1] = units
            else:
                days.append(event["date"])
                step_units.append(units)

        if not held:
            continue
        states[symbol] = {
            "units": round(units, 8),
            "cost_basis": round(cost, 2),
            "average_cost": round(cost / units, 2) if units > 0 else None,
            "realized": round(realized, 2),
            "unit_steps": (days, [round(value, 8) for value in step_units]),
        }
    return states


def split_product(splits, symbol, after_date, on_or_before_date):
    """Product of split ratios in (after_date, on_or_before_date].

    The API compares this against 1.0 to spot a provider split the ledger does
    not yet record.
    """
    after = _day(after_date)
    before = _day(on_or_before_date)
    product = 1.0
    for split in splits or []:
        if split.get("symbol") != symbol:
            continue
        day = _day(split["effective_date"])
        if not after < day <= before:
            continue
        ratio = _ratio(split.get("numerator"), split.get("denominator"))
        if ratio is not None:
            product *= ratio
    return product
