from datetime import date
from decimal import Decimal

import pytest
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.response import Response
from rest_framework.test import APIClient
from services import financial_data_service

from portfolio.models import Transaction

User = get_user_model()

pytestmark = pytest.mark.django_db

URL = reverse("portfolio_analysis")


@pytest.fixture
def user():
    return User.objects.create_user(username="alice", password="pw", is_active=True)


def client_for(user):
    client = APIClient()
    client.force_authenticate(user=user)
    return client


@pytest.fixture
def fake_batches(monkeypatch):
    calls = {"eod": 0, "dividends": 0}

    def fake_eod(symbols, start, end):
        calls["eod"] += 1
        return {
            symbol: [
                ("2024-01-02", 100.0 + index, 100.0 + index),
                ("2024-06-03", 120.0 + index, 120.0 + index),
            ]
            for index, symbol in enumerate(sorted(symbols))
        }

    def fake_dividends(symbols, start, end):
        calls["dividends"] += 1
        return {symbol: [] for symbol in symbols}

    def fake_live(symbols):
        return {symbol: None for symbol in symbols}

    monkeypatch.setattr(financial_data_service, "get_eod_daily_batch", fake_eod)
    monkeypatch.setattr(
        financial_data_service, "get_dividends_batch", fake_dividends
    )
    monkeypatch.setattr(financial_data_service, "get_live_price_batch", fake_live)
    return calls


def _trade(user, symbol="AAPL", amount="1000.00"):
    return Transaction.objects.create(
        user=user,
        symbol=symbol,
        trade_date="2024-01-02",
        kind="BUY",
        amount=Decimal(amount),
    )


def test_returns_series_positions_and_summary(user, fake_batches):
    _trade(user)

    response = client_for(user).get(URL)

    assert response.status_code == 200
    body = response.json()
    assert body["benchmark"] == "SPY"
    assert body["window"] == {"start": "2024-01-02", "end": body["window"]["end"]}
    assert body["positions"][0]["symbol"] == "AAPL"
    assert body["positions"][0]["units"] == 10.0
    assert body["series"]["dates"] == ["2024-01-02", "2024-06-03"]
    assert body["series"]["value"] == [1000.0, 1200.0]
    assert body["summary"]["invested"] == 1000.0


def test_a_window_ending_today_uses_the_live_quote(user, fake_batches, monkeypatch):
    # The fake EOD rows stop in 2024, so the live row is what makes the
    # position current.
    monkeypatch.setattr(
        financial_data_service,
        "get_live_price_batch",
        lambda symbols: {symbol: 150.0 for symbol in symbols},
    )
    _trade(user)

    response = client_for(user).get(URL)

    assert response.status_code == 200
    body = response.json()
    assert body["summary"]["value"] == 1500.0
    assert body["positions"][0]["price"] == 150.0
    assert body["positions"][0]["market_value"] == 1500.0
    assert body["series"]["dates"][-1] == date.today().isoformat()


def test_a_failed_live_feed_falls_back_to_the_closing_price(
    user, fake_batches, monkeypatch
):
    monkeypatch.setattr(
        financial_data_service,
        "get_live_price_batch",
        lambda symbols: Response({"detail": "upstream"}, status=503),
    )
    _trade(user)

    response = client_for(user).get(URL)

    assert response.status_code == 200
    body = response.json()
    assert body["summary"]["value"] == 1200.0
    assert body["positions"][0]["price"] == 120.0
    assert body["series"]["dates"][-1] == "2024-06-03"


def test_empty_ledger_returns_zeros_without_calling_the_provider(user, monkeypatch):
    def explode(*args, **kwargs):
        raise AssertionError("the provider must not be called for an empty ledger")

    monkeypatch.setattr(financial_data_service, "get_eod_daily_batch", explode)

    response = client_for(user).get(URL)

    assert response.status_code == 200
    body = response.json()
    assert body["positions"] == []
    assert body["series"]["dates"] == []
    assert body["summary"]["profit"] == 0.0


def test_a_second_request_is_served_from_cache(user, fake_batches):
    _trade(user)
    client = client_for(user)

    client.get(URL)
    client.get(URL)

    assert fake_batches["eod"] == 1
    assert fake_batches["dividends"] == 1


def test_a_bad_date_is_rejected(user, fake_batches):
    _trade(user)

    response = client_for(user).get(URL, {"from": "not-a-date"})

    assert response.status_code == 400
    assert "from" in response.json()["error"]


def test_a_purchase_after_the_last_session_uses_the_prior_close(user, monkeypatch):
    """A buy dated today, before the provider publishes today's close.

    The window holds no trading session, which used to surface as a 400
    "unknown benchmark" even though the symbol and the benchmark were both fine.
    """

    def ranged_eod(symbols, start, end):
        rows = [("2024-06-02", 110.0), ("2024-06-03", 120.0)]
        return {
            symbol: [
                (day, close, close) for day, close in rows if start <= day <= end
            ]
            for symbol in symbols
        }

    monkeypatch.setattr(financial_data_service, "get_eod_daily_batch", ranged_eod)
    monkeypatch.setattr(
        financial_data_service,
        "get_dividends_batch",
        lambda symbols, start, end: {symbol: [] for symbol in symbols},
    )
    Transaction.objects.create(
        user=user,
        symbol="AAPL",
        trade_date="2024-06-04",
        kind="BUY",
        amount=Decimal("1200.00"),
    )

    response = client_for(user).get(
        URL, {"from": "2024-06-04", "to": "2024-06-04"}
    )

    assert response.status_code == 200
    body = response.json()
    assert body["series"]["dates"] == ["2024-06-04"]
    assert body["summary"]["value"] == 1200.0
    assert body["summary"]["invested"] == 1200.0
    assert body["summary"]["profit"] == 0.0


def test_an_unknown_benchmark_is_rejected(user, monkeypatch):
    _trade(user)

    monkeypatch.setattr(
        financial_data_service,
        "get_eod_daily_batch",
        lambda symbols, start, end: {symbol: [] for symbol in symbols},
    )
    monkeypatch.setattr(
        financial_data_service,
        "get_dividends_batch",
        lambda symbols, start, end: {symbol: [] for symbol in symbols},
    )

    response = client_for(user).get(URL, {"benchmark": "ZZZZNOTREAL"})

    assert response.status_code == 400
    assert response.json()["error"] == "unknown benchmark"


def test_more_than_two_hundred_symbols_is_rejected(user, fake_batches):
    Transaction.objects.bulk_create([
        Transaction(
            user=user,
            symbol=f"S{index:03d}",
            trade_date="2024-01-02",
            kind="BUY",
            amount=Decimal("10"),
        )
        for index in range(201)
    ])

    response = client_for(user).get(URL)

    assert response.status_code == 400
    assert response.json()["error"] == "too many symbols"
    assert fake_batches["eod"] == 0


def test_anonymous_request_is_unauthenticated(api_client):
    assert api_client.get(URL).status_code == 401
