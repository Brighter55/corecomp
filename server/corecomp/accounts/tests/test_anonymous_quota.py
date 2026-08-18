from django.urls import reverse
from unittest.mock import patch
import pytest
from pages.models import Symbol


# The quota gate applies to real data views, not the free symbol-search
# autocomplete. current_price is a representative AllowAnonymousWithQuota view.
url = reverse("current_price")


def _mock_global_quote(symbol="AAPL"):
    return {
        "Global Quote": {
            "01. symbol": symbol,
            "05. price": "302.4700",
        }
    }


def _create_symbol(symbol):
    return Symbol.objects.create(symbol=symbol, name=f"{symbol} Corp", type="Stock")


@pytest.mark.django_db
@patch("pages.views.overview.financial_data_service.get_current_price")
def test_anonymous_within_quota(mock_get_current_price, api_client):
    mock_get_current_price.return_value = _mock_global_quote()
    symbols = ["AAPL", "MSFT", "GOOG", "AMZN", "TSLA"]
    for symbol in symbols:
        _create_symbol(symbol)
        response = api_client.post(url, {"symbol": symbol}, format="json", HTTP_X_ANONYMOUS_SESSION="session-1")
        assert response.status_code == 200


@pytest.mark.django_db
@patch("pages.views.overview.financial_data_service.get_current_price")
def test_anonymous_exceeds_quota(mock_get_current_price, api_client):
    mock_get_current_price.return_value = _mock_global_quote()
    symbols = ["AAPL", "MSFT", "GOOG", "AMZN", "TSLA", "NVDA"]
    for symbol in symbols:
        _create_symbol(symbol)
        response = api_client.post(url, {"symbol": symbol}, format="json", HTTP_X_ANONYMOUS_SESSION="session-1")
    assert response.status_code == 403
    assert response.json()["detail"] == "quota_exceeded"


@pytest.mark.django_db
@patch("pages.views.overview.financial_data_service.get_current_price")
def test_reviewing_same_symbol_does_not_consume_extra_quota(mock_get_current_price, api_client):
    # viewing the same company again shouldn't use up another quota slot
    _create_symbol("AAPL")
    mock_get_current_price.return_value = _mock_global_quote()
    for _ in range(6):
        response = api_client.post(url, {"symbol": "AAPL"}, format="json", HTTP_X_ANONYMOUS_SESSION="session-1")
        assert response.status_code == 200


@pytest.mark.django_db
def test_anonymous_without_session_header_rejected(api_client):
    response = api_client.post(url, {"symbol": "AAPL"}, format="json")
    assert response.status_code == 403


@pytest.mark.django_db
@patch("pages.views.overview.financial_data_service.get_current_price")
def test_authenticated_user_unlimited(mock_get_current_price, authenticated_client):
    mock_get_current_price.return_value = _mock_global_quote()
    symbols = ["AAPL", "MSFT", "GOOG", "AMZN", "TSLA", "NVDA", "NFLX"]
    for symbol in symbols:
        _create_symbol(symbol)
        response = authenticated_client.post(url, {"symbol": symbol}, format="json")
        assert response.status_code == 200
