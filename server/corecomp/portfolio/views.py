import os
from datetime import date, timedelta

from django.core.cache import cache
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from services import financial_data_service

from . import analysis
from .models import Transaction
from .serializers import TransactionSerializer

MAX_ANALYSIS_SYMBOLS = 200
DEFAULT_BENCHMARK = "SPY"
BATCH_CACHE_SECONDS = 3600
# The provider publishes a session's close hours after it ends, so a buy dated
# today has no row yet. Reaching back keeps the last close available for the
# units and for a series anchored on the window end; 14 days clears any
# weekend-plus-holiday gap.
FETCH_LOOKBACK_DAYS = 14
# Read at import, like the pages app, so a MOCK flip needs a restart and a
# cache flush rather than serving mock-shaped bytes under a live key.
MODE = "mock" if os.getenv("MOCK") == "True" else "live"


def _payload(request):
    return request.data if isinstance(request.data, dict) else {}


def _validate_symbol(symbol):
    """Return a Response when the symbol cannot be accepted, else None.

    The check goes to the provider rather than the `Symbol` table, because that
    table is seeded from a universe that omits tradable ETFs such as VOO even
    though the price endpoints serve them.
    """
    if not symbol:
        return Response(
            {"error": "symbol is required"}, status=status.HTTP_400_BAD_REQUEST
        )
    quote = financial_data_service.get_current_price(symbol)
    if isinstance(quote, Response):
        return quote
    if not (quote or {}).get("Global Quote"):
        return Response(
            {"error": "unknown symbol"}, status=status.HTTP_400_BAD_REQUEST
        )
    return None


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def transactions(request):
    if request.method == "GET":
        rows = Transaction.objects.filter(user=request.user)
        return Response(TransactionSerializer(rows, many=True).data)
    return _save(request)


def _save(request):
    payload = dict(_payload(request))

    row = None
    tx_id = payload.get("id")
    if tx_id is not None:
        row = Transaction.objects.filter(user=request.user, pk=tx_id).first()
        if row is None:
            return Response(
                {"error": "not found"}, status=status.HTTP_404_NOT_FOUND
            )

    if "symbol" in payload:
        symbol = str(payload.get("symbol") or "").strip().upper()
        invalid = _validate_symbol(symbol)
        if invalid is not None:
            return invalid
        payload["symbol"] = symbol

    serializer = TransactionSerializer(row, data=payload, partial=row is not None)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    if row is None:
        serializer.save(user=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    serializer.save()
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def delete_transaction(request):
    tx_id = _payload(request).get("id")
    if tx_id is None:
        return Response(
            {"error": "id is required"}, status=status.HTTP_400_BAD_REQUEST
        )

    deleted, _ = Transaction.objects.filter(user=request.user, pk=tx_id).delete()
    if not deleted:
        return Response({"error": "not found"}, status=status.HTTP_404_NOT_FOUND)
    return Response({"deleted": tx_id}, status=status.HTTP_200_OK)


def _parse_date(value, field):
    """(date, None) or (None, Response)."""
    if value in (None, ""):
        return None, None
    try:
        return date.fromisoformat(str(value)), None
    except ValueError:
        return None, Response(
            {"error": f"{field} must be YYYY-MM-DD"},
            status=status.HTTP_400_BAD_REQUEST,
        )


def _cached_batch(kind, start, end, symbols, fetch):
    """Redis-cache an upstream batch by its canonical symbol list.

    Shared across users and workers, which is what keeps a portfolio load from
    spending the monthly provider budget once per page view. The process-local
    memo inside wisesheets still collapses an in-worker burst on top of this.
    """
    key = f"{MODE}:portfolio_{kind}:{start}:{end}:{','.join(symbols)}"
    cached = cache.get(key)
    if cached is not None:
        return cached
    value = fetch(symbols, start, end)
    if isinstance(value, Response):
        return value
    cache.set(key, value, BATCH_CACHE_SECONDS)
    return value


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def analysis_view(request):
    from_date, invalid = _parse_date(request.query_params.get("from"), "from")
    if invalid is not None:
        return invalid
    to_date, invalid = _parse_date(request.query_params.get("to"), "to")
    if invalid is not None:
        return invalid

    rows = list(
        Transaction.objects.filter(user=request.user).values(
            "id", "symbol", "trade_date", "kind", "amount", "shares", "price"
        )
    )
    symbols = sorted({row["symbol"] for row in rows})
    if len(symbols) > MAX_ANALYSIS_SYMBOLS:
        return Response(
            {"error": "too many symbols"}, status=status.HTTP_400_BAD_REQUEST
        )

    benchmark = str(
        request.query_params.get("benchmark") or DEFAULT_BENCHMARK
    ).strip().upper()

    today = date.today()
    earliest_allowed = today.replace(year=today.year - 4)  # 5 calendar years
    start_date = from_date or (min(row["trade_date"] for row in rows) if rows else today)
    if start_date < earliest_allowed:
        start_date = earliest_allowed
        if from_date is not None:
            return Response(
                {"error": "from is outside the provider's history window"},
                status=status.HTTP_400_BAD_REQUEST,
            )
    end_date = to_date or today
    if end_date < start_date:
        return Response(
            {"error": "to must not be before from"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    start_iso = start_date.isoformat()
    end_iso = end_date.isoformat()
    fetch_start = start_date - timedelta(days=FETCH_LOOKBACK_DAYS)
    if fetch_start < earliest_allowed:
        fetch_start = earliest_allowed
    fetch_iso = fetch_start.isoformat()

    if not rows:
        empty = {
            "dates": [],
            "value": [],
            "invested": [],
            "dividends": [],
            "benchmark_value": [],
            "benchmark_dividends": [],
        }
        return Response({
            "window": {"start": start_iso, "end": end_iso},
            "benchmark": benchmark,
            "positions": [],
            "summary": analysis.summarize(empty),
            "series": empty,
        })

    transactions = [
        {
            "id": row["id"],
            "symbol": row["symbol"],
            "trade_date": row["trade_date"].isoformat(),
            "kind": row["kind"],
            "amount": float(row["amount"]),
            "shares": float(row["shares"]) if row["shares"] is not None else None,
            "price": float(row["price"]) if row["price"] is not None else None,
        }
        for row in rows
    ]

    fetch_symbols = sorted(set(symbols) | {benchmark})

    prices = _cached_batch(
        "eod", fetch_iso, end_iso, fetch_symbols,
        financial_data_service.get_eod_daily_batch,
    )
    if isinstance(prices, Response):
        return prices

    dividends = _cached_batch(
        "dividends", fetch_iso, end_iso, fetch_symbols,
        financial_data_service.get_dividends_batch,
    )
    if isinstance(dividends, Response):
        return dividends

    if not prices.get(benchmark):
        return Response(
            {"error": "unknown benchmark"}, status=status.HTTP_400_BAD_REQUEST
        )

    series = analysis.build_series(
        transactions,
        prices,
        dividends,
        benchmark,
        prices,
        dividends,
        start=start_iso,
        end=end_iso,
    )
    return Response({
        "window": {"start": start_iso, "end": end_iso},
        "benchmark": benchmark,
        "positions": analysis.build_positions(transactions, prices),
        "summary": analysis.summarize(series),
        "series": series,
    })
