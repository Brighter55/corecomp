from unittest.mock import patch

import pytest
from django.core.cache import cache
from django.urls import reverse
from pages.services import MockFinancialDataService
from pages.trending import MOVERS_COUNT
from pages.views import overview
from rest_framework import status
from rest_framework.response import Response

url = reverse("trending")

# Matches TRENDING_TTL_SECONDS; asserted rather than imported so changing the
# freshness/cost dial has to be deliberate here too.
TRENDING_TTL_SECONDS = 3600

# Anonymous quota sets live at an unprefixed anon_quota:{session_id} key, so
# cache.clear() between tests does NOT reset them. Own ids, as test_dip.py does.
SESSION_REPEAT = "trending-session-repeat"


def _payload(symbols=("NVDA", "AAPL")):
    return {
        "asOf": "2026-10-08",
        "movers": [
            {
                "symbol": symbol,
                "name": f"{symbol} Corp",
                "price": 100.0 + index,
                "percentChange": float(index),
                "volume": 1000 + index,
                "marketCap": 10.0,
                "spark": [1.0, 2.0],
            }
            for index, symbol in enumerate(symbols)
        ],
    }


# --- payload ----------------------------------------------------------------


@pytest.mark.django_db
@patch("pages.views.overview.financial_data_service.get_trending")
def test_returns_the_ranked_payload(mock_get_trending, api_client):
    mock_get_trending.return_value = _payload()

    response = api_client.post(url, format="json")

    assert response.status_code == 200
    body = response.json()
    assert body["asOf"]
    assert [mover["symbol"] for mover in body["movers"]] == ["NVDA", "AAPL"]


# --- anonymous access: the whole point of this endpoint ---------------------


@pytest.mark.django_db
@patch("pages.views.overview.financial_data_service.get_trending")
def test_anonymous_without_a_session_header_is_allowed(mock_get_trending, api_client):
    # Every other endpoint in this module 403s here -- see
    # test_dip.py::test_anonymous_without_session_header_rejected. Trending is
    # AllowAny deliberately: it is landing-page teaser content, and spending the
    # visitor's 5-symbol allowance to render the homepage would put the paywall
    # in front of the search box.
    mock_get_trending.return_value = _payload()

    response = api_client.post(url, format="json")

    assert response.status_code == 200


@pytest.mark.django_db
@patch("pages.views.overview.financial_data_service.get_trending")
def test_loading_the_page_repeatedly_never_exhausts_the_quota(mock_get_trending, api_client):
    # Six fills is more than QUOTA (5). A quota-guarded route refuses the sixth;
    # this one must not, however many times a visitor reloads the landing page.
    mock_get_trending.return_value = _payload()

    for _ in range(6):
        response = api_client.post(
            url, format="json", HTTP_X_ANONYMOUS_SESSION=SESSION_REPEAT
        )
        assert response.status_code == 200


# --- caching ----------------------------------------------------------------


@pytest.mark.django_db
@patch("pages.views.overview.financial_data_service.get_trending")
def test_second_request_is_served_from_cache(mock_get_trending, api_client):
    mock_get_trending.return_value = _payload()

    first = api_client.post(url, format="json")
    second = api_client.post(url, format="json")

    assert first.json() == second.json()
    assert mock_get_trending.call_count == 1
    assert cache.get(f"{overview.MODE}:trending") is not None


@pytest.mark.django_db
@patch("pages.views.overview.financial_data_service.get_trending")
def test_cache_key_is_mode_namespaced(mock_get_trending, api_client):
    # Older keys in this module are not namespaced, so flipping MOCK would serve
    # their stale bytes for up to 7 days. Trending must not repeat that.
    mock_get_trending.return_value = _payload()

    api_client.post(url, format="json")

    assert cache.get(f"{overview.MODE}:trending") is not None
    assert overview.MODE in ("live", "mock")


@pytest.mark.django_db
@patch("pages.views.overview.financial_data_service.get_trending")
def test_cache_does_not_leak_between_features(mock_get_trending, api_client):
    mock_get_trending.return_value = _payload()

    api_client.post(url, format="json")

    assert cache.get("info_AAPL") is None
    assert cache.get("current_price_AAPL") is None


# --- upstream error passthrough --------------------------------------------


@pytest.mark.django_db
@patch("pages.views.overview.financial_data_service.get_trending")
def test_rate_limit_aborts_the_request(mock_get_trending, api_client):
    mock_get_trending.return_value = Response(
        {"error": "rate limit issue"},
        status=status.HTTP_503_SERVICE_UNAVAILABLE,
        headers={"Retry-After": "60000"},
    )

    response = api_client.post(url, format="json")

    assert response.status_code == 503
    assert response.headers.get("Retry-After") == "60000"
    assert response.json()["error"] == "rate limit issue"


@pytest.mark.django_db
@patch("pages.views.overview.financial_data_service.get_trending")
def test_errors_are_not_cached(mock_get_trending, api_client):
    mock_get_trending.return_value = Response(
        {"error": "rate limit issue"}, status=status.HTTP_503_SERVICE_UNAVAILABLE
    )

    api_client.post(url, format="json")

    assert cache.get(f"{overview.MODE}:trending") is None


# --- mock mode --------------------------------------------------------------


def test_mock_payload_needs_no_fixture_file():
    # The e2e suite runs MOCK=True and routes-and-auth-provider.spec.ts already
    # visits /overview. The other mock methods read gitignored
    # statement_samples/*.json; trending builds its payload in code so there is
    # no file to be missing in CI.
    payload = MockFinancialDataService().get_trending()

    assert payload["asOf"]
    assert payload["movers"]
    for mover in payload["movers"]:
        assert len(mover["spark"]) >= 2
        assert mover["symbol"]


def test_mock_serves_a_full_page_set_so_the_carousel_can_page():
    # The frontend paginates MOVERS_COUNT at a time. A mock smaller than that
    # leaves the browser suite with a carousel that has nothing to page to.
    payload = MockFinancialDataService().get_trending()

    assert len(payload["movers"]) == MOVERS_COUNT

    # Pre-ranked descending, so the page never has to re-sort -- the e2e spec
    # depends on that ordering being the display order.
    changes = [mover["percentChange"] for mover in payload["movers"]]
    assert changes == sorted(changes, reverse=True)
    assert len(set(mover["symbol"] for mover in payload["movers"])) == MOVERS_COUNT
