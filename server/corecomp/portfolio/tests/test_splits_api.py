import pytest
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APIClient
from services import financial_data_service

from portfolio.models import Split

User = get_user_model()

pytestmark = pytest.mark.django_db

LIST_URL = reverse("portfolio_splits")
DELETE_URL = reverse("portfolio_split_delete")

VALID = {
    "symbol": "AAPL",
    "effective_date": "2024-06-10",
    "numerator": 4,
    "denominator": 1,
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


def test_create_then_list_returns_the_split(user, known_symbols):
    created = client_for(user).post(
        LIST_URL, {**VALID, "symbol": " aapl "}, format="json"
    )

    assert created.status_code == 201
    assert created.json()["symbol"] == "AAPL"

    rows = client_for(user).get(LIST_URL).json()

    assert rows == [
        {
            "id": created.json()["id"],
            "symbol": "AAPL",
            "effective_date": "2024-06-10",
            "numerator": 4,
            "denominator": 1,
        }
    ]


def test_another_users_split_is_hidden_and_untouchable(user, other_user):
    row = Split.objects.create(
        user=other_user,
        symbol="MSFT",
        effective_date="2024-06-10",
        numerator=2,
        denominator=1,
    )

    assert client_for(user).get(LIST_URL).json() == []

    update = client_for(user).post(
        LIST_URL, {"id": row.id, "numerator": 3}, format="json"
    )
    assert update.status_code == 404
    assert update.json() == {"error": "not found"}

    delete = client_for(user).post(DELETE_URL, {"id": row.id}, format="json")
    assert delete.status_code == 404
    assert delete.json() == {"error": "not found"}
    assert Split.objects.filter(pk=row.id).exists()


def test_unknown_symbol_is_rejected(user, known_symbols):
    response = client_for(user).post(
        LIST_URL, {**VALID, "symbol": "ZZZZNOTREAL"}, format="json"
    )

    assert response.status_code == 400
    assert response.json() == {"error": "unknown symbol"}
    assert not Split.objects.exists()


def test_zero_numerator_is_rejected(user, known_symbols):
    response = client_for(user).post(
        LIST_URL, {**VALID, "numerator": 0}, format="json"
    )

    assert response.status_code == 400
    assert response.json() == {"numerator": ["numerator must be positive"]}
    assert not Split.objects.exists()


def test_zero_denominator_is_rejected(user, known_symbols):
    response = client_for(user).post(
        LIST_URL, {**VALID, "denominator": 0}, format="json"
    )

    assert response.status_code == 400
    assert response.json() == {"denominator": ["denominator must be positive"]}
    assert not Split.objects.exists()


def test_same_symbol_and_date_twice_is_rejected(user, known_symbols):
    client = client_for(user)
    client.post(LIST_URL, VALID, format="json")

    response = client.post(LIST_URL, VALID, format="json")

    assert response.status_code == 400
    assert response.json() == {"error": "split already recorded"}
    assert Split.objects.count() == 1


def test_malformed_effective_date_is_rejected(user, known_symbols):
    response = client_for(user).post(
        LIST_URL, {**VALID, "effective_date": "2024-13-40"}, format="json"
    )

    assert response.status_code == 400
    assert response.json() == {"error": "effective_date must be YYYY-MM-DD"}
    assert not Split.objects.exists()


def test_update_by_id_changes_the_ratio(user, known_symbols):
    created = client_for(user).post(LIST_URL, VALID, format="json").json()

    response = client_for(user).post(
        LIST_URL, {"id": created["id"], "numerator": 10}, format="json"
    )

    assert response.status_code == 200
    assert response.json() == {
        "id": created["id"],
        "symbol": "AAPL",
        "effective_date": "2024-06-10",
        "numerator": 10,
        "denominator": 1,
    }
    assert Split.objects.get().numerator == 10


def test_delete_removes_the_row_and_a_second_delete_is_not_found(
    user, known_symbols
):
    created = client_for(user).post(LIST_URL, VALID, format="json").json()
    client = client_for(user)

    response = client.post(DELETE_URL, {"id": created["id"]}, format="json")

    assert response.status_code == 200
    assert response.json() == {"deleted": created["id"]}
    assert not Split.objects.filter(pk=created["id"]).exists()

    again = client.post(DELETE_URL, {"id": created["id"]}, format="json")
    assert again.status_code == 404
    assert again.json() == {"error": "not found"}


def test_anonymous_is_unauthenticated(api_client):
    assert api_client.get(LIST_URL).status_code == 401
    assert api_client.post(LIST_URL, VALID, format="json").status_code == 401
