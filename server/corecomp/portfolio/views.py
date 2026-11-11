from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from services import financial_data_service

from .models import Transaction
from .serializers import TransactionSerializer


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
