from decimal import Decimal

import pytest
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APIClient
from services import financial_data_service

from portfolio.models import Transaction

User = get_user_model()

pytestmark = pytest.mark.django_db

LIST_URL = reverse("portfolio_transactions")
DELETE_URL = reverse("portfolio_transaction_delete")

VALID = {
    "symbol": "AAPL",
    "trade_date": "2024-06-06",
    "kind": "BUY",
    "amount": "12100.00",
    "shares": "10",
    "price": "1210.00",
}


@pytest.fixture
def known_symbols(monkeypatch):
    """Stub the provider lookup so the suite never reaches the network."""

    def fake_current_price(symbol):
        if symbol in {"AAPL", "VOO"}:
            return {"Global Quote": {"05. price": "100.00"}}
        return {"Global Quote": {}}

    monkeypatch.setattr(
        financial_data_service, "get_current_price", fake_current_price
    )


@pytest.fixture
def user():
    return User.objects.create_user(username="alice", password="pw", is_active=True)


@pytest.fixture
def other_user():
    return User.objects.create_user(username="bob", password="pw", is_active=True)


def client_for(user):
    client = APIClient()
    client.force_authenticate(user=user)
    return client


def test_create_persists_the_trade(user, known_symbols):
    response = client_for(user).post(LIST_URL, VALID, format="json")

    assert response.status_code == 201
    body = response.json()
    assert body["symbol"] == "AAPL"
    assert body["amount"] == "12100.0000"
    assert body["trade_date"] == "2024-06-06"

    row = Transaction.objects.get()
    assert row.user == user


def test_symbol_is_normalised_to_uppercase(user, known_symbols):
    response = client_for(user).post(
        LIST_URL, {**VALID, "symbol": " aapl "}, format="json"
    )

    assert response.status_code == 201
    assert response.json()["symbol"] == "AAPL"


def test_etf_symbol_is_accepted(user, known_symbols):
    response = client_for(user).post(
        LIST_URL, {**VALID, "symbol": "VOO"}, format="json"
    )

    assert response.status_code == 201


def test_unknown_symbol_is_rejected(user, known_symbols):
    response = client_for(user).post(
        LIST_URL, {**VALID, "symbol": "ZZZZNOTREAL"}, format="json"
    )

    assert response.status_code == 400
    assert not Transaction.objects.exists()


def test_missing_symbol_is_rejected(user, known_symbols):
    payload = {key: value for key, value in VALID.items() if key != "symbol"}

    response = client_for(user).post(LIST_URL, payload, format="json")

    assert response.status_code == 400
    assert not Transaction.objects.exists()


def test_negative_amount_is_rejected(user, known_symbols):
    response = client_for(user).post(
        LIST_URL, {**VALID, "amount": "-1"}, format="json"
    )

    assert response.status_code == 400
    assert not Transaction.objects.exists()


def test_list_returns_only_the_callers_rows(user, other_user, known_symbols):
    client_for(user).post(LIST_URL, VALID, format="json")
    Transaction.objects.create(
        user=other_user,
        symbol="MSFT",
        trade_date="2024-06-06",
        kind="BUY",
        amount=Decimal("10"),
    )

    rows = client_for(user).get(LIST_URL).json()

    assert len(rows) == 1
    assert rows[0]["symbol"] == "AAPL"


def test_update_requires_ownership(user, other_user, known_symbols):
    row = Transaction.objects.create(
        user=other_user,
        symbol="MSFT",
        trade_date="2024-06-06",
        kind="BUY",
        amount=Decimal("10"),
    )

    response = client_for(user).post(
        LIST_URL, {**VALID, "id": row.id, "amount": "999"}, format="json"
    )

    assert response.status_code == 404
    row.refresh_from_db()
    assert row.amount == Decimal("10")


def test_update_leaves_unsupplied_fields_alone(user, known_symbols):
    created = client_for(user).post(LIST_URL, VALID, format="json").json()

    response = client_for(user).post(
        LIST_URL, {"id": created["id"], "amount": "9000"}, format="json"
    )

    assert response.status_code == 200
    row = Transaction.objects.get()
    assert row.amount == Decimal("9000.0000")
    assert row.symbol == "AAPL"


def test_delete_requires_ownership(user, other_user):
    row = Transaction.objects.create(
        user=other_user,
        symbol="MSFT",
        trade_date="2024-06-06",
        kind="BUY",
        amount=Decimal("10"),
    )

    response = client_for(user).post(DELETE_URL, {"id": row.id}, format="json")

    assert response.status_code == 404
    assert Transaction.objects.filter(pk=row.id).exists()


def test_delete_removes_the_callers_row(user, known_symbols):
    created = client_for(user).post(LIST_URL, VALID, format="json").json()

    response = client_for(user).post(
        DELETE_URL, {"id": created["id"]}, format="json"
    )

    assert response.status_code == 200
    assert not Transaction.objects.filter(pk=created["id"]).exists()


def test_payload_cannot_reassign_the_user(user, other_user, known_symbols):
    response = client_for(user).post(
        LIST_URL, {**VALID, "user": other_user.id}, format="json"
    )

    assert response.status_code == 201
    assert Transaction.objects.get().user == user


def test_decimal_amounts_do_not_lose_precision(user, known_symbols):
    client = client_for(user)
    client.post(LIST_URL, {**VALID, "amount": "0.1"}, format="json")
    client.post(LIST_URL, {**VALID, "amount": "0.1"}, format="json")

    total = sum(Transaction.objects.values_list("amount", flat=True), Decimal("0"))

    assert total == Decimal("0.2000")


def test_anonymous_get_is_unauthenticated(api_client):
    assert api_client.get(LIST_URL).status_code == 401


def test_anonymous_post_is_unauthenticated(api_client):
    assert api_client.post(LIST_URL, VALID, format="json").status_code == 401
