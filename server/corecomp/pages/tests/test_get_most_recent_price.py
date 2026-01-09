import pytest
from django.urls import reverse
from unittest.mock import patch
from types import SimpleNamespace
from pages.models import Symbol


url = reverse('get_most_recent_price')

# test for valid request
@patch("pages.views.overview.get_stock_price")
@pytest.mark.django_db
def test_get_price(mock_get_price, authorized_client):
    symbol = Symbol(
        symbol="IBM",
        name="International Business Machines Corp",
        type="Stock"
    )
    symbol.save()
    mock_get_price.return_value = {
        'Global Quote': {
            '01. symbol': 'IBM',
            '02. open': '295.0000',
            '03. high': '303.0400',
            '04. low': '294.4200',
            '05. price': '302.4700',
            '06. volume': '4147315',
            '07. latest trading day': '2026-01-06',
            '08. previous close': '294.9700',
            '09. change': '7.5000',
            '10. change percent': '2.5426%'
        }
    }

    payload = {"symbol": "IBM"}
    response = authorized_client.post(url, payload, format="json")
    assert response.status_code == 200
    assert response.json()["price"] == "302.47"

# test for invalid symbol where the symbol is not in the database
@pytest.mark.django_db
def test_symbol_not_in_database(authorized_client):
    payload = {"symbol": "invalid symbol"}
    response = authorized_client.post(url, payload, format="json")
    assert response.status_code == 400
    assert response.json()["symbol"][0] == "symbol not in Symbol model"

# test for invalid case where Alpha Vantage returns error message about rate limit
@patch("pages.views.overview.get_stock_price")
@pytest.mark.django_db
def test_exceeds_rate_limit(mock_get_price, authorized_client):
    symbol = Symbol(
        symbol="IBM",
        name="International Business Machines Corp",
        type="Stock"
    )
    symbol.save()
    mock_get_price.return_value = {
        "Information": "Our standard APIcall frequency is ..."
    }
    payload = {"symbol": "IBM"}
    response = authorized_client.post(url, payload, format="json")
    assert response.status_code == 503
    assert response.headers.get("Retry-After") == "60000"
    assert response.json()["error"] == "rate limit issue"

    mock_get_price.return_value = {
        "Note": "Our standard APIcall frequency is ..."
    }
    response = authorized_client.post(url, payload, format="json")
    assert response.status_code == 503
    assert response.headers.get("Retry-After") == "60000"
    assert response.json()["error"] == "rate limit issue"

# test for invalid case where Alpha Vantage returns error message about invalid api call
@patch("pages.views.overview.get_stock_price")
@pytest.mark.django_db
def test_invalid_api_call(mock_get_price, authorized_client):
    symbol = Symbol(
        symbol="IBM",
        name="International Business Machines Corp",
        type="Stock"
    )
    symbol.save()
    mock_get_price.return_value = {
        "Error Message": "Invalid API key ..."
    }
    payload = {"symbol": "IBM"}
    response = authorized_client.post(url, payload, format="json")
    assert response.status_code == 500
    assert response.json()["error"] == "invalid api call issue"

# test for invalid case where the symbol exists in Symbol but not in Alpha Vantage or Alpha Vantage doesn't have data
@patch("pages.views.overview.get_stock_price")
@pytest.mark.django_db
def test_symbol_not_in_alpha_vantage(mock_get_price, authorized_client):
    symbol = Symbol(
        symbol="IBM",
        name="International Business Machines Corp",
        type="Stock"
    )
    symbol.save()
    mock_get_price.return_value = {
        'Global Quote': {}
    }
    payload = {"symbol": "IBM"}
    response = authorized_client.post(url, payload, format="json")
    assert response.status_code == 400
    assert response.json()["error"] == "invalid symbol"
