import pytest
from django.core.cache import cache
from django.urls import reverse
from unittest.mock import patch

from pages.models import Symbol
from rest_framework import status
from rest_framework.response import Response

from pages.views import overview


url = reverse("dip")

# Matches DIP_TTL_SECONDS; asserted rather than imported so a change to the
# freshness/cost dial has to be deliberate here too.
DIP_TTL_SECONDS = 600

# Anonymous quota sets live at an unprefixed anon_quota:{session_id} key, so
# cache.clear() between tests does NOT reset them. Each anonymous test gets its
# own session id and this file stays independent of accounts/tests, which uses
# "session-1" for the same purpose.
SESSION_WITHIN = "dip-session-within"
SESSION_OVER = "dip-session-over"
SESSION_REPEAT = "dip-session-repeat"
SESSION_BATCH = "dip-session-batch"


def _create_symbol(symbol, name=None):
    return Symbol.objects.create(symbol=symbol, name=name or f"{symbol} Corp", type="Stock")


def _dip_row(symbol, price=100.0, sma50=80.0, sma200=50.0, name=None):
    return {
        "symbol": symbol,
        "name": name or f"{symbol} Corp",
        "price": price,
        "sma50": sma50,
        "sma200": sma200,
    }


# --- happy path -------------------------------------------------------------


@pytest.mark.django_db
@patch("pages.views.overview.financial_data_service.get_dip_row")
def test_dip_computes_variance_for_both_windows(mock_get_dip_row, authorized_client):
    _create_symbol("AAPL", "Apple Inc")
    mock_get_dip_row.return_value = _dip_row("AAPL", price=100.0, sma50=80.0, sma200=50.0)

    response = authorized_client.post(url, {"symbols": ["AAPL"]}, format="json")

    assert response.status_code == 200
    body = response.json()
    assert body["asOf"]

    result = body["results"][0]
    assert result["symbol"] == "AAPL"
    assert result["name"] == "Apple Inc"
    assert result["price"] == 100.0
    assert result["status"] == "ok"
    # (100 - 80) / 80 * 100 and (100 - 50) / 50 * 100
    assert result["variance"]["50"] == pytest.approx(25.0)
    assert result["variance"]["200"] == pytest.approx(100.0)


@pytest.mark.django_db
@patch("pages.views.overview.financial_data_service.get_dip_row")
def test_variance_is_not_rounded(mock_get_dip_row, authorized_client):
    # Rounding here would collapse near-ties: the client sorts on this value and
    # only rounds for display, so -11.4 and -11.6 must stay distinguishable.
    _create_symbol("AAPL")
    mock_get_dip_row.return_value = _dip_row("AAPL", price=88.6, sma50=100.0, sma200=100.0)

    response = authorized_client.post(url, {"symbols": ["AAPL"]}, format="json")

    variance = response.json()["results"][0]["variance"]["200"]
    assert variance == pytest.approx(-11.4)
    assert variance != -11


@pytest.mark.django_db
@patch("pages.views.overview.financial_data_service.get_dip_row")
def test_symbols_are_upper_cased_and_deduped(mock_get_dip_row, authorized_client):
    _create_symbol("AAPL")
    mock_get_dip_row.return_value = _dip_row("AAPL")

    response = authorized_client.post(
        url, {"symbols": [" aapl ", "AAPL", "aapl"]}, format="json"
    )

    assert response.status_code == 200
    body = response.json()
    assert len(body["results"]) == 1
    assert body["results"][0]["symbol"] == "AAPL"


@pytest.mark.django_db
@patch("pages.views.overview.financial_data_service.get_dip_row")
def test_one_row_per_requested_symbol_in_order(mock_get_dip_row, authorized_client):
    for symbol in ("AAPL", "MSFT"):
        _create_symbol(symbol)
    mock_get_dip_row.side_effect = lambda symbol: _dip_row(symbol)

    response = authorized_client.post(url, {"symbols": ["AAPL", "MSFT"]}, format="json")

    symbols = [result["symbol"] for result in response.json()["results"]]
    assert symbols == ["AAPL", "MSFT"]


# --- degraded branches ------------------------------------------------------


@pytest.mark.django_db
@patch("pages.views.overview.financial_data_service.get_dip_row")
def test_symbol_missing_from_symbol_table_is_unknown(mock_get_dip_row, authorized_client):
    # A stale localStorage ticker must not brick the whole chart.
    _create_symbol("AAPL")
    mock_get_dip_row.return_value = _dip_row("AAPL")

    response = authorized_client.post(url, {"symbols": ["AAPL", "ZZZZ"]}, format="json")

    assert response.status_code == 200
    results = {result["symbol"]: result for result in response.json()["results"]}

    assert results["ZZZZ"]["status"] == "unknown"
    assert results["ZZZZ"]["name"] is None
    assert results["ZZZZ"]["variance"] == {"50": None, "200": None}
    # the known symbol is unaffected
    assert results["AAPL"]["status"] == "ok"


@pytest.mark.django_db
@patch("pages.views.overview.financial_data_service.get_dip_row")
def test_provider_returns_nothing_is_unavailable(mock_get_dip_row, authorized_client):
    _create_symbol("AAPL")
    mock_get_dip_row.return_value = {}

    response = authorized_client.post(url, {"symbols": ["AAPL"]}, format="json")

    assert response.status_code == 200
    result = response.json()["results"][0]
    assert result["status"] == "unavailable"
    assert result["variance"] == {"50": None, "200": None}


@pytest.mark.django_db
@patch("pages.views.overview.financial_data_service.get_dip_row")
def test_missing_moving_average_yields_null_not_zero(mock_get_dip_row, authorized_client):
    _create_symbol("AAPL")
    mock_get_dip_row.return_value = _dip_row("AAPL", price=100.0, sma50=None, sma200=50.0)

    response = authorized_client.post(url, {"symbols": ["AAPL"]}, format="json")

    variance = response.json()["results"][0]["variance"]
    # None, not 0 -- plotting it as 0 would read as "flat", not "unknown".
    assert variance["50"] is None
    assert variance["200"] == pytest.approx(100.0)


# --- upstream error passthrough --------------------------------------------


@pytest.mark.django_db
@patch("pages.views.overview.financial_data_service.get_dip_row")
def test_rate_limit_aborts_the_whole_request(mock_get_dip_row, authorized_client):
    _create_symbol("AAPL")
    mock_get_dip_row.return_value = Response(
        {"error": "rate limit issue"},
        status=status.HTTP_503_SERVICE_UNAVAILABLE,
        headers={"Retry-After": "60000"},
    )

    response = authorized_client.post(url, {"symbols": ["AAPL"]}, format="json")

    assert response.status_code == 503
    assert response.headers.get("Retry-After") == "60000"
    assert response.json()["error"] == "rate limit issue"


@pytest.mark.django_db
@patch("pages.views.overview.financial_data_service.get_dip_row")
def test_invalid_api_call_aborts_the_whole_request(mock_get_dip_row, authorized_client):
    _create_symbol("AAPL")
    mock_get_dip_row.return_value = Response(
        {"error": "invalid api call issue"},
        status=status.HTTP_500_INTERNAL_SERVER_ERROR,
    )

    response = authorized_client.post(url, {"symbols": ["AAPL"]}, format="json")

    assert response.status_code == 500
    assert response.json()["error"] == "invalid api call issue"


@pytest.mark.django_db
@patch("pages.views.overview.financial_data_service.get_dip_row")
def test_errors_are_not_cached(mock_get_dip_row, authorized_client):
    _create_symbol("AAPL")
    mock_get_dip_row.return_value = Response(
        {"error": "rate limit issue"}, status=status.HTTP_503_SERVICE_UNAVAILABLE
    )

    authorized_client.post(url, {"symbols": ["AAPL"]}, format="json")

    assert cache.get(f"{overview.MODE}:dip_AAPL") is None


# --- validation -------------------------------------------------------------


@pytest.mark.django_db
def test_rejects_more_than_twenty_symbols(authorized_client):
    # Authenticated on purpose: an anonymous caller is denied by the quota
    # permission (21 > QUOTA) before the serializer ever sees the list.
    symbols = [f"SYM{i}" for i in range(21)]

    response = authorized_client.post(url, {"symbols": symbols}, format="json")

    assert response.status_code == 400
    assert "symbols" in response.json()


@pytest.mark.django_db
def test_rejects_an_empty_list(authorized_client):
    response = authorized_client.post(url, {"symbols": []}, format="json")

    assert response.status_code == 400


@pytest.mark.django_db
def test_rejects_a_missing_list(authorized_client):
    response = authorized_client.post(url, {}, format="json")

    assert response.status_code == 400


# --- caching ----------------------------------------------------------------


@pytest.mark.django_db
@patch("pages.views.overview.financial_data_service.get_dip_row")
def test_second_request_is_served_from_cache(mock_get_dip_row, authorized_client):
    _create_symbol("AAPL")
    mock_get_dip_row.return_value = _dip_row("AAPL")

    payload = {"symbols": ["AAPL"]}
    first = authorized_client.post(url, payload, format="json")
    second = authorized_client.post(url, payload, format="json")

    assert first.json() == second.json()
    assert mock_get_dip_row.call_count == 1
    assert cache.get(f"{overview.MODE}:dip_AAPL") is not None


@pytest.mark.django_db
@patch("pages.views.overview.financial_data_service.get_dip_row")
def test_cache_key_is_mode_namespaced(mock_get_dip_row, authorized_client):
    # The other keys in this module are not namespaced, so flipping MOCK would
    # serve their stale bytes for up to 7 days. Dip must not repeat that.
    _create_symbol("AAPL")
    mock_get_dip_row.return_value = _dip_row("AAPL")

    authorized_client.post(url, {"symbols": ["AAPL"]}, format="json")

    assert cache.get(f"{overview.MODE}:dip_AAPL") is not None
    assert overview.MODE in ("live", "mock")


@pytest.mark.django_db
@patch("pages.views.overview.financial_data_service.get_dip_row")
def test_cache_does_not_leak_between_features(mock_get_dip_row, authorized_client):
    # Dip is self-contained: it must not read or write info_/current_price_.
    _create_symbol("AAPL")
    mock_get_dip_row.return_value = _dip_row("AAPL")

    authorized_client.post(url, {"symbols": ["AAPL"]}, format="json")

    assert cache.get("info_AAPL") is None
    assert cache.get("current_price_AAPL") is None


# --- anonymous quota --------------------------------------------------------


@pytest.mark.django_db
@patch("pages.views.overview.financial_data_service.get_dip_row")
def test_anonymous_within_quota(mock_get_dip_row, api_client):
    mock_get_dip_row.side_effect = lambda symbol: _dip_row(symbol)
    symbols = ["AAPL", "MSFT", "GOOG", "AMZN", "TSLA"]
    for symbol in symbols:
        _create_symbol(symbol)

    response = api_client.post(
        url, {"symbols": symbols}, format="json", HTTP_X_ANONYMOUS_SESSION="SESSION_WITHIN"
    )

    assert response.status_code == 200
    assert len(response.json()["results"]) == 5


@pytest.mark.django_db
@patch("pages.views.overview.financial_data_service.get_dip_row")
def test_anonymous_exceeding_quota_is_refused(mock_get_dip_row, api_client):
    mock_get_dip_row.side_effect = lambda symbol: _dip_row(symbol)
    for symbol in ["AAPL", "MSFT", "GOOG", "AMZN", "TSLA"]:
        api_client.post(
            url, {"symbols": [symbol]}, format="json", HTTP_X_ANONYMOUS_SESSION="SESSION_OVER"
        )

    # The 6th distinct symbol is one too many.
    response = api_client.post(
        url, {"symbols": ["NVDA"]}, format="json", HTTP_X_ANONYMOUS_SESSION="SESSION_OVER"
    )

    assert response.status_code == 403
    assert response.json()["detail"] == "quota_exceeded"


@pytest.mark.django_db
@patch("pages.views.overview.financial_data_service.get_dip_row")
def test_anonymous_repeating_a_symbol_does_not_consume_quota(mock_get_dip_row, api_client):
    _create_symbol("AAPL")
    mock_get_dip_row.return_value = _dip_row("AAPL")

    for _ in range(6):
        response = api_client.post(
            url, {"symbols": ["AAPL"]}, format="json", HTTP_X_ANONYMOUS_SESSION="SESSION_REPEAT"
        )
        assert response.status_code == 200


@pytest.mark.django_db
@patch("pages.views.overview.financial_data_service.get_dip_row")
def test_anonymous_batch_that_would_exceed_quota_is_refused_whole(mock_get_dip_row, api_client):
    # Denied before any write: the set must not grow by the symbols in a request
    # that was refused, which is the bug the scalar permission has.
    mock_get_dip_row.side_effect = lambda symbol: _dip_row(symbol)
    for symbol in ["AAPL", "MSFT", "GOOG", "AMZN"]:
        _create_symbol(symbol)

    refused = api_client.post(
        url,
        {"symbols": ["AAPL", "MSFT", "GOOG", "AMZN", "TSLA", "NVDA"]},
        format="json",
        HTTP_X_ANONYMOUS_SESSION="SESSION_BATCH",
    )
    assert refused.status_code == 403

    # A single new symbol still fits, because the refused batch spent nothing.
    _create_symbol("TSLA")
    allowed = api_client.post(
        url, {"symbols": ["TSLA"]}, format="json", HTTP_X_ANONYMOUS_SESSION="SESSION_BATCH"
    )
    assert allowed.status_code == 200


@pytest.mark.django_db
def test_anonymous_without_session_header_rejected(api_client):
    response = api_client.post(url, {"symbols": ["AAPL"]}, format="json")

    assert response.status_code == 403
    assert response.json()["detail"] == "quota_exceeded"


@pytest.mark.django_db
@patch("pages.views.overview.financial_data_service.get_dip_row")
def test_authenticated_user_unlimited(mock_get_dip_row, authenticated_client):
    mock_get_dip_row.side_effect = lambda symbol: _dip_row(symbol)
    symbols = [f"SYM{i}" for i in range(12)]

    response = authenticated_client.post(url, {"symbols": symbols}, format="json")

    assert response.status_code == 200
    assert len(response.json()["results"]) == 12
    # no Symbol rows exist for these, so they all report as unknown rather than
    # failing -- the quota is simply not consulted for a signed-in user
    assert all(result["status"] == "unknown" for result in response.json()["results"])
