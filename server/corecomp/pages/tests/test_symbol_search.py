import pytest
from django.urls import reverse
from unittest.mock import patch
from pages.models import Symbol

url = reverse('symbol_search')
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