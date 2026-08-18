import pytest
from django.urls import reverse
from unittest.mock import patch
from pages.models import Symbol

url = reverse('symbol_search')

# test that autocomplete is free for anonymous users (not metered by the quota)
@pytest.mark.django_db
def test_anonymous_search_is_free(api_client):
    Symbol(
        symbol="IBM",
        name="International Business Machines Corp",
        type="Stock"
    ).save()

    payload = {"symbol": "IB"}
    response = api_client.post(url, payload, format="json")
    assert response.status_code == 200
    assert response.json() == [{'name': 'International Business Machines Corp', 'symbol': 'IBM'}]


# test for valid request
@pytest.mark.django_db
def test_valid(authorized_client):
    symbol = Symbol(
        symbol="IBM",
        name="International Business Machines Corp",
        type="Stock"
    )
    symbol.save()

    payload = {"symbol": "IB"}
    response = authorized_client.post(url, payload, format="json")
    data = response.json()
    assert data == [{'name': 'International Business Machines Corp', 'symbol': 'IBM'}]