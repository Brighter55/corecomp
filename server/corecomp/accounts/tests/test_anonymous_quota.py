from unittest.mock import patch

import pytest
from django.urls import reverse
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


# --- the batch permission shares the same allowance --------------------------
#
# /pages/dip (AllowAnonymousWithQuotaList) and the single-symbol views
# (AllowAnonymousWithQuota) write the same unprefixed anon_quota:{session_id}
# set, so a visitor cannot collect 5 symbols on each endpoint.

dip_url = reverse("dip")


@pytest.mark.django_db
@patch("pages.views.overview.financial_data_service.get_dip_row")
@patch("pages.views.overview.financial_data_service.get_current_price")
def test_dip_spend_counts_against_single_symbol_endpoints(
    mock_get_current_price, mock_get_dip_row, api_client
):
    mock_get_current_price.return_value = _mock_global_quote()
    mock_get_dip_row.side_effect = lambda symbol: {
        "symbol": symbol, "name": f"{symbol} Corp", "price": 10.0,
        "sma50": 9.0, "sma200": 8.0,
    }
    session = "shared-session-dip-first"
    for symbol in ["AAPL", "MSFT", "GOOG"]:
        _create_symbol(symbol)

    spent = api_client.post(
        dip_url, {"symbols": ["AAPL", "MSFT", "GOOG"]}, format="json",
        HTTP_X_ANONYMOUS_SESSION=session,
    )
    assert spent.status_code == 200

    # Two more fit, the third does not: 3 spent on /dip + 2 here = 5.
    for symbol in ["AMZN", "TSLA"]:
        _create_symbol(symbol)
        allowed = api_client.post(
            url, {"symbol": symbol}, format="json", HTTP_X_ANONYMOUS_SESSION=session
        )
        assert allowed.status_code == 200

    _create_symbol("NVDA")
    refused = api_client.post(
        url, {"symbol": "NVDA"}, format="json", HTTP_X_ANONYMOUS_SESSION=session
    )
    assert refused.status_code == 403
    assert refused.json()["detail"] == "quota_exceeded"


@pytest.mark.django_db
@patch("pages.views.overview.financial_data_service.get_dip_row")
@patch("pages.views.overview.financial_data_service.get_current_price")
def test_single_symbol_spend_counts_against_dip(
    mock_get_current_price, mock_get_dip_row, api_client
):
    mock_get_current_price.return_value = _mock_global_quote()
    mock_get_dip_row.side_effect = lambda symbol: {
        "symbol": symbol, "name": f"{symbol} Corp", "price": 10.0,
        "sma50": 9.0, "sma200": 8.0,
    }
    session = "shared-session-price-first"
    for symbol in ["AAPL", "MSFT", "GOOG"]:
        _create_symbol(symbol)
        allowed = api_client.post(
            url, {"symbol": symbol}, format="json", HTTP_X_ANONYMOUS_SESSION=session
        )
        assert allowed.status_code == 200

    # 3 already spent, so a batch of 3 new symbols would reach 6.
    for symbol in ["AMZN", "TSLA", "NVDA"]:
        _create_symbol(symbol)

    refused = api_client.post(
        dip_url, {"symbols": ["AMZN", "TSLA", "NVDA"]}, format="json",
        HTTP_X_ANONYMOUS_SESSION=session,
    )
    assert refused.status_code == 403

    # A batch that fits exactly still works.
    allowed = api_client.post(
        dip_url, {"symbols": ["AMZN", "TSLA"]}, format="json",
        HTTP_X_ANONYMOUS_SESSION=session,
    )
    assert allowed.status_code == 200


@pytest.mark.django_db
def test_dip_rejects_a_non_mapping_body_without_crashing(api_client):
    # Permissions run before serializer validation, so request.data is
    # unvalidated here -- a JSON array must not raise AttributeError.
    response = api_client.post(
        dip_url, ["AAPL"], format="json", HTTP_X_ANONYMOUS_SESSION="session-malformed"
    )

    assert response.status_code in (400, 403)
    assert response.status_code != 500
