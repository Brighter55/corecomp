"""Robinhood activity CSV into ledger rows. Pure Python, no Django, no I/O.

The file is an export, not a hand-entered ledger: one row per broker event,
amounts formatted for humans, and splits expressed as the number of shares
added rather than a ratio. The parser converts all of that into the share-count
model the rest of the app already replays.

`counts` has two preview-only buckets. REC is stored as a zero-cost BUY and SPL
becomes a Split row, so neither is a ledger kind, but the preview must show them
as adjustments rather than bury them inside BUY or drop them entirely.
"""

import csv
import io
from dataclasses import dataclass
from datetime import datetime
from decimal import Decimal, InvalidOperation
from fractions import Fraction

from . import holdings

_TRADE_CODES = {"Buy": "BUY", "Sell": "SELL"}
_CASH_CODES = {"CDIV": "DIVIDEND", "DTAX": "DTAX"}
_COUNT_KEYS = ("BUY", "SELL", "DIVIDEND", "DTAX", "REC", "SPL")


@dataclass(frozen=True)
class ImportResult:
    rows: list
    splits: list
    counts: dict
    skipped: int
    unresolved_splits: list
    positions: dict


def parse_activity(text):
    """Parse activity CSV text into rows, splits and a preview."""
    rows = []
    splits = []
    pending_splits = []
    unresolved = []
    counts = dict.fromkeys(_COUNT_KEYS, 0)
    skipped = 0

    for raw in csv.DictReader(io.StringIO(text)):
        symbol = _symbol(raw.get("Instrument"))
        if not symbol:
            skipped += 1
            continue

        code = (raw.get("Trans Code") or "").strip()
        if (
            code not in _TRADE_CODES
            and code not in _CASH_CODES
            and code not in ("REC", "SPL")
        ):
            skipped += 1
            continue

        day = _date(raw.get("Activity Date"))

        if code in _TRADE_CODES:
            kind = _TRADE_CODES[code]
            rows.append(
                _ledger_row(
                    symbol,
                    day,
                    kind,
                    amount=abs(_decimal(raw.get("Amount")) or Decimal("0")),
                    shares=_decimal(raw.get("Quantity")),
                    price=_decimal(raw.get("Price")),
                )
            )
            counts[kind] += 1
        elif code in _CASH_CODES:
            kind = _CASH_CODES[code]
            rows.append(
                _ledger_row(
                    symbol,
                    day,
                    kind,
                    amount=abs(_decimal(raw.get("Amount")) or Decimal("0")),
                )
            )
            counts[kind] += 1
        elif code == "REC":
            rows.append(
                _ledger_row(
                    symbol,
                    day,
                    "BUY",
                    amount=Decimal("0"),
                    shares=_decimal(raw.get("Quantity")),
                    price=Decimal("0"),
                )
            )
            counts["REC"] += 1
        else:
            pending_splits.append(
                (symbol, day, _decimal(raw.get("Quantity")) or Decimal("0"))
            )

    # Resolve splits only after every trade is known. The export is newest
    # first, so a split row is read before the purchases it scales.
    for symbol, day, added in sorted(pending_splits, key=lambda item: (item[1], item[0])):
        split, rejection = _resolve_split(symbol, day, added, rows, splits)
        if split is None:
            unresolved.append(rejection)
        else:
            splits.append(split)
            counts["SPL"] += 1

    return ImportResult(
        rows=rows,
        splits=splits,
        counts=counts,
        skipped=skipped,
        unresolved_splits=unresolved,
        positions=_positions(rows, splits),
    )


def _resolve_split(symbol, day, quantity, rows, splits):
    """(split, None) or (None, unresolvable). Held position excludes this row."""
    held = _held_units(rows, splits, symbol, day)
    added = Fraction(quantity)
    if held > 0 and held + added > 0:
        ratio = (held + added) / held
        return (
            {
                "symbol": symbol,
                "effective_date": day,
                "numerator": ratio.numerator,
                "denominator": ratio.denominator,
            },
            None,
        )
    return None, {"symbol": symbol, "trade_date": day, "shares": quantity}


def _held_units(rows, splits, symbol, before):
    """Units held strictly before `before`, with earlier splits applied.

    The export is newest-first, so the rows parsed so far are the ones after
    this date. Filter by date rather than trusting file order. A trade dated
    the same day is excluded because a split takes effect at the open.
    """
    prior_rows = [row for row in rows if row["trade_date"] < before]
    prior_splits = [split for split in splits if split["effective_date"] < before]
    events = holdings.normalise(prior_rows, prior_splits, _no_close)
    state = holdings.replay(events).get(symbol)
    return Fraction(str(state["units"])) if state else Fraction(0)


def _positions(rows, splits):
    events = holdings.normalise(rows, splits, _no_close)
    return {symbol: state["units"] for symbol, state in holdings.replay(events).items()}


def _no_close(_symbol, _day):
    return None


def _ledger_row(symbol, day, kind, amount, shares=None, price=None):
    return {
        "symbol": symbol,
        "trade_date": day,
        "kind": kind,
        "amount": amount,
        "shares": shares,
        "price": price,
    }


def _symbol(value):
    lines = (value or "").splitlines()
    return lines[0].strip().upper() if lines else ""


def _date(value):
    text = (value or "").strip()
    try:
        return datetime.strptime(text, "%m/%d/%Y").date().isoformat()
    except ValueError as error:
        raise ValueError(f"unreadable date {text!r}") from error


def _decimal(value):
    if value is None:
        return None
    text = str(value).strip().replace("$", "").replace(",", "")
    if not text:
        return None
    negative = text.startswith("(") and text.endswith(")")
    if negative:
        text = text[1:-1]
    try:
        number = Decimal(text)
    except InvalidOperation as error:
        raise ValueError(f"unreadable number {value!r}") from error
    return -number if negative else number
