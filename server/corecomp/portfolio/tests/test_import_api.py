import hashlib
from decimal import Decimal
from pathlib import Path

import pytest
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.urls import reverse
from rest_framework.test import APIClient
from services import financial_data_service

from portfolio.models import Split, Transaction

User = get_user_model()

pytestmark = pytest.mark.django_db

URL = reverse("portfolio_import")
ANALYSIS_URL = reverse("portfolio_analysis")
FIXTURE = Path(__file__).resolve().parent / "fixtures" / "robinhood_activity.csv"


@pytest.fixture
def user():
    return User.objects.create_user(username="alice", password="pw", is_active=True)


def client_for(user):
    client = APIClient()
    client.force_authenticate(user=user)
    return client


def send(client, data, dry_run=False):
    upload = SimpleUploadedFile("activity.csv", data, content_type="text/csv")
    payload = {"file": upload}
    if dry_run:
        payload["dry_run"] = "true"
    return client.post(URL, payload, format="multipart")


@pytest.fixture
def fake_batches(monkeypatch):
    def fake_eod(symbols, start, end):
        return {
            symbol: [("2024-01-02", 100.0, 100.0), ("2024-06-03", 120.0, 120.0)]
            for symbol in symbols
        }

    monkeypatch.setattr(financial_data_service, "get_eod_daily_batch", fake_eod)
    monkeypatch.setattr(
        financial_data_service,
        "get_dividends_batch",
        lambda symbols, start, end: {symbol: [] for symbol in symbols},
    )
    monkeypatch.setattr(
        financial_data_service,
        "get_live_price_batch",
        lambda symbols: {symbol: None for symbol in symbols},
    )


def test_dry_run_previews_positions_and_writes_nothing(user):
    response = send(client_for(user), FIXTURE.read_bytes(), dry_run=True)

    assert response.status_code == 200
    body = response.json()
    assert body["counts"] == {
        "BUY": 5,
        "SELL": 1,
        "DIVIDEND": 1,
        "DTAX": 1,
        "REC": 1,
        "SPL": 1,
    }
    assert body["skipped"] == 4
    assert body["positions"] == {
        "ACME": 13.75,
        "FICT": 0.0,
        "SPLT": 20.0,
        "MULTI": 3.0,
    }
    assert body["rows"][0] == {
        "symbol": "ACME",
        "trade_date": "2024-01-02",
        "kind": "BUY",
        "amount": 1050.0,
        "shares": 10.5,
        "price": 100.0,
    }
    assert "imported" not in body
    assert not Transaction.objects.exists()
    assert not Split.objects.exists()


def test_real_run_writes_rows_and_split_then_reupload_is_conflict(user):
    data = FIXTURE.read_bytes()
    client = client_for(user)

    first = send(client, data)

    assert first.status_code == 200
    assert first.json()["imported"] == 9
    assert Transaction.objects.filter(user=user).count() == 9
    split = Split.objects.get()
    assert split.symbol == "SPLT"
    assert split.effective_date.isoformat() == "2024-01-20"
    assert (split.numerator, split.denominator) == (10, 1)
    assert set(Transaction.objects.values_list("import_hash", flat=True)) == {
        hashlib.sha256(data).hexdigest()
    }
    dtax = Transaction.objects.get(kind="DTAX")
    assert dtax.amount == Decimal("0.75")
    assert dtax.symbol == "ACME"

    second = send(client, data)

    assert second.status_code == 409
    assert second.json() == {"error": "already imported"}
    assert Transaction.objects.count() == 9
    assert Split.objects.count() == 1


def test_a_utf8_bom_is_accepted(user):
    response = send(
        client_for(user), b"\xef\xbb\xbf" + FIXTURE.read_bytes(), dry_run=True
    )

    assert response.status_code == 200
    assert response.json()["counts"]["BUY"] == 5


def test_non_utf8_body_is_rejected(user):
    response = send(client_for(user), b"\xff\xfe\x00not utf-8")

    assert response.status_code == 400
    assert response.json() == {"error": "file must be UTF-8"}
    assert not Transaction.objects.exists()


def test_anonymous_request_is_unauthenticated(api_client):
    upload = SimpleUploadedFile(
        "activity.csv", FIXTURE.read_bytes(), content_type="text/csv"
    )

    response = api_client.post(URL, {"file": upload}, format="multipart")

    assert response.status_code == 401


def test_analysis_reports_the_units_the_preview_promised(user, fake_batches):
    client = client_for(user)

    preview = send(client, FIXTURE.read_bytes()).json()
    analysis = client.get(ANALYSIS_URL).json()

    units = {position["symbol"]: position["units"] for position in analysis["positions"]}
    assert units == preview["positions"]
    assert units == {"ACME": 13.75, "FICT": 0.0, "SPLT": 20.0, "MULTI": 3.0}
