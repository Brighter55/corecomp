import pytest
from django.urls import reverse
from unittest.mock import patch
from pages.models import Symbol
from rest_framework.response import Response
from rest_framework import status

url = reverse('pricing')
# test for valid request where the endpoint fetches
@patch("pages.views.overview.transform_pricing")
@patch("pages.views.overview.financial_data_service.get_pricing")
@pytest.mark.django_db
def test_valid_fetch(mock_get_pricing, mock_transform_pricing, authorized_client):
    symbol = Symbol(
        symbol="IBM",
        name="International Business Machines Corp",
        type="Stock"
    )
    symbol.save()
    return_value = {
        "data": "valid data"
    }
    mock_get_pricing.return_value = return_value
    mock_transform_pricing.return_value = return_value
    payload = {"symbol": "IBM"}
    response = authorized_client.post(url, payload, format="json")
    assert response.json() == return_value
    assert response.status_code == 200

# test for valid request where the endpoint returns cached_data
@patch("pages.views.overview.transform_pricing")
@patch("pages.views.overview.financial_data_service.get_pricing")
@pytest.mark.django_db
def test_valid_cache(mock_get_pricing, mock_transform_pricing, authorized_client):
    symbol = Symbol(
        symbol="IBM",
        name="International Business Machines Corp",
        type="Stock"
    )
    symbol.save()
    return_value = {
        "data": "valid data"
    }
    mock_get_pricing.return_value = return_value
    mock_transform_pricing.return_value = return_value
    payload = {"symbol": "IBM"}
    response = authorized_client.post(url, payload, format="json")
    assert response.json() == return_value
    assert response.status_code == 200
    response = authorized_client.post(url, payload, format="json")
    assert response.status_code == 200
    assert mock_get_pricing.call_count == 1

# test for invalid case where Alpha Vantage returns error message about rate limit
@patch("pages.views.overview.financial_data_service.get_pricing")
@pytest.mark.django_db
def test_exceeds_rate_limit(mock_get_pricing, authorized_client):
    symbol = Symbol(
        symbol="IBM",
        name="International Business Machines Corp",
        type="Stock"
    )
    symbol.save()
    payload = {"symbol": "IBM"}
    
    mock_get_pricing.return_value = Response(
        {"error": "rate limit issue"},
        status=status.HTTP_503_SERVICE_UNAVAILABLE,
        headers={"Retry-After":  "60000"}
    )
    response = authorized_client.post(url, payload, format="json")
    assert response.status_code == 503
    assert response.headers.get("Retry-After") == "60000"
    assert response.json()["error"] == "rate limit issue"

# test for invalid case where the provider has no data for the symbol
@patch("pages.views.overview.financial_data_service.get_pricing")
@pytest.mark.django_db
def test_symbol_not_in_provider(mock_get_pricing, authorized_client):
    symbol = Symbol(
        symbol="IBM",
        name="International Business Machines Corp",
        type="Stock"
    )
    symbol.save()
    payload = {"symbol": "IBM"}

    mock_get_pricing.return_value = {}
    response = authorized_client.post(url, payload, format="json")
    assert response.status_code == 204

# test for invalid case where the symbol is invalid
@patch("pages.views.overview.financial_data_service.get_pricing")
@pytest.mark.django_db
def test_invalid_symbol(mock_get_pricing, authorized_client):
    symbol = Symbol(
        symbol="IBM",
        name="International Business Machines Corp",
        type="Stock"
    )
    symbol.save()
    payload = {"symbol": "IBM"}
    
    mock_get_pricing.return_value = Response(
        {"error": "invalid api call issue"},
        status=status.HTTP_500_INTERNAL_SERVER_ERROR
    )
    response = authorized_client.post(url, payload, format="json")
    assert response.status_code == 500