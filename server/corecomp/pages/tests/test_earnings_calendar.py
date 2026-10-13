"""Tests for the market-wide earnings calendar.

No live Alpha Vantage request is ever made. The account shares a 25-request/day
budget with production, so every test mocks the provider and the CSVs are string
constants in this file. The HTTP-200 guard is the highest-priority behaviour
here: Alpha Vantage reports rate limiting and errors with a 200, and a client
that trusts the status code caches a broken calendar for six hours.
"""

import json
from datetime import date
from unittest.mock import patch

import pytest
import requests
from django.core.cache import cache
from django.urls import reverse
from pages import alphavantage
from pages.earnings_calendar import (
    build_payload,
    mock_payload,
    window_payload,
    window_symbols,
)
from pages.services import MockFinancialDataService
from pages.views import overview
from rest_framework import status
from rest_framework.response import Response

url = reverse("earnings_calendar")

# Matches EARNINGS_CALENDAR_TTL_SECONDS; asserted rather than imported so moving
# the freshness/cost dial has to be deliberate here too.
TTL_SECONDS = 21600

# The exact EARNINGS_CALENDAR header, measured live.
HEADER = "symbol,name,reportDate,fiscalDateEnding,estimate,currency,timeOfTheDay"

# Two dates. Oct 15 holds all three sessions (before_open, after_close, and a
# blank-session unannounced row); Oct 16 holds a blank and an unrecognised
# timeOfTheDay so both land in unannounced, and one missing estimate. The quoted
# name keeps the comma-in-name case honest.
CALENDAR_CSV = (
    HEADER + "\n"
    "TSM,Taiwan Semiconductor Manufacturing,2026-10-15,2026-09-30,1.79,USD,pre-market\n"
    "SCHW,The Charles Schwab Corporation,2026-10-15,2026-09-30,0.77,USD,pre-market\n"
    'NFLX,"Netflix, Inc.",2026-10-15,2026-09-30,5.12,USD,post-market\n'
    "WAL,Western Alliance Bancorporation,2026-10-15,2026-09-30,1.86,USD,\n"
    "AAPL,Apple Inc.,2026-10-16,2026-09-30,,USD,\n"
    "ZZZ,Unknown Session Corp,2026-10-16,2026-09-30,3.30,USD,mystery-timing\n"
)

AS_OF = date(2026, 10, 11)


@pytest.fixture(autouse=True)
def fresh_earnings_calendar_cache():
    """Drop the cached calendar before each test.

    The shared dev Redis DB can already hold `{MODE}:earnings_calendar` from a
    running app, and conftest clears only *after* each test, so the first view
    test would otherwise read that foreign payload and assert against it.
    """
    cache.delete(f"{overview.MODE}:earnings_calendar")
    yield


def _tiles_by_symbol(day):
    return {
        tile["symbol"]: tile
        for session_group in day["sessions"]
        for tile in session_group["tiles"]
    }


# --- build_payload: rows -> days -> sessions --------------------------------


def test_groups_rows_by_date_and_session_in_fixed_order():
    payload = build_payload(CALENDAR_CSV, AS_OF)

    assert payload["asOf"] == "2026-10-11"
    assert [day["date"] for day in payload["days"]] == ["2026-10-15", "2026-10-16"]

    first = payload["days"][0]
    assert [group["session"] for group in first["sessions"]] == [
        "before_open", "after_close", "unannounced",
    ]
    # tiles sorted ascending by symbol, so the cached payload is stable
    assert [t["symbol"] for t in first["sessions"][0]["tiles"]] == ["SCHW", "TSM"]
    assert [t["symbol"] for t in first["sessions"][1]["tiles"]] == ["NFLX"]
    assert [t["symbol"] for t in first["sessions"][2]["tiles"]] == ["WAL"]


def test_blank_and_unrecognised_time_of_day_both_become_unannounced():
    # Blank is 78% of real rows, and a never-seen provider value must degrade
    # into the third group rather than be dropped or crash the calendar.
    payload = build_payload(CALENDAR_CSV, AS_OF)

    second = payload["days"][1]
    assert [group["session"] for group in second["sessions"]] == ["unannounced"]
    assert [t["symbol"] for t in second["sessions"][0]["tiles"]] == ["AAPL", "ZZZ"]


def test_estimate_is_a_number_or_null_and_name_is_a_string():
    payload = build_payload(CALENDAR_CSV, AS_OF)

    first = _tiles_by_symbol(payload["days"][0])
    assert first["TSM"]["estimate"] == pytest.approx(1.79)
    assert first["NFLX"]["name"] == "Netflix, Inc."  # comma survived the quoting

    second = _tiles_by_symbol(payload["days"][1])
    assert second["AAPL"]["estimate"] is None  # blank estimate column


def test_rows_without_a_parseable_report_date_are_skipped():
    csv_text = HEADER + "\n" + "AAA,Alpha Inc.,not-a-date,2026-09-30,1.0,USD,pre-market\n"

    payload = build_payload(csv_text, AS_OF)

    assert payload["days"] == []


# --- window_payload: the response shape -------------------------------------


def test_window_payload_slices_inclusively_and_echoes_the_window():
    payload = build_payload(CALENDAR_CSV, AS_OF)

    body = window_payload(payload, date(2026, 10, 15), date(2026, 10, 15))

    assert body["asOf"] == "2026-10-11"
    assert body["window"] == {"start": "2026-10-15", "end": "2026-10-15"}
    assert [day["date"] for day in body["days"]] == ["2026-10-15"]


def test_dates_with_no_rows_are_absent_not_empty_entries():
    # The client builds its Monday-to-Friday grid and treats absent dates as
    # empty cells, so a quiet date must not appear as an empty day.
    payload = build_payload(CALENDAR_CSV, AS_OF)

    body = window_payload(payload, date(2026, 10, 15), date(2026, 10, 17))

    assert [day["date"] for day in body["days"]] == ["2026-10-15", "2026-10-16"]  # 17 absent


# --- the mock ---------------------------------------------------------------


def test_mock_payload_covers_all_three_sessions_relative_to_today():
    today = date(2026, 10, 12)

    payload = mock_payload(today)

    assert payload["asOf"] == "2026-10-12"
    assert [day["date"] for day in payload["days"]] == sorted(
        day["date"] for day in payload["days"]
    )
    sessions = {
        group["session"] for day in payload["days"] for group in day["sessions"]
    }
    assert sessions == {"before_open", "after_close", "unannounced"}
    # Offset 0 is today, so whatever window the page computes for the current
    # week always overlaps rows.
    assert today.isoformat() in {day["date"] for day in payload["days"]}


def test_mock_service_calendar_needs_no_fixture_file():
    # The e2e suite runs MOCK=True; a fixture-backed payload would 500 on a clean
    # checkout, where statement_samples/*.json does not exist.
    payload = MockFinancialDataService().get_earnings_calendar()

    assert payload["asOf"] == date.today().isoformat()
    assert payload["days"]


# --- the HTTP-200 guard: the one thing that must not be got wrong -----------


def _fake_response(status_code, text):
    response = requests.Response()
    response.status_code = status_code
    response._content = text.encode("utf-8")
    return response


def _mock_get(monkeypatch, status_code, text):
    monkeypatch.setenv("ALPHAVANTAGE_API_KEY", "test-key")
    monkeypatch.setattr(
        alphavantage.requests, "get", lambda *a, **k: _fake_response(status_code, text)
    )


def test_a_real_calendar_is_returned_as_csv_text(monkeypatch):
    _mock_get(monkeypatch, 200, CALENDAR_CSV)

    assert alphavantage.fetch_earnings_calendar() == CALENDAR_CSV


def test_json_error_body_with_http_200_is_refused(monkeypatch):
    # Alpha Vantage carries a Note/Information message as JSON on a 200. Handing
    # it to the CSV parser would yield a calendar with one garbage tile.
    body = json.dumps({"Information": "the rate limit is 25 requests per day"})
    _mock_get(monkeypatch, 200, body)

    result = alphavantage.fetch_earnings_calendar()

    assert isinstance(result, Response)
    assert result.status_code == status.HTTP_503_SERVICE_UNAVAILABLE
    assert result.headers["Retry-After"] == "60000"


def test_non_calendar_header_with_http_200_is_refused(monkeypatch):
    _mock_get(monkeypatch, 200, "symbol,price\nAAPL,190.12\n")

    result = alphavantage.fetch_earnings_calendar()

    assert isinstance(result, Response)
    assert result.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR


def test_body_with_no_parseable_report_date_is_refused(monkeypatch):
    # The observed live failure: the normal CSV header followed by
    # `I,n,f,o,r,m,a`, the word "Information" written one field per character.
    # Its header matches and it is not JSON, so only the reportDate check
    # catches it.
    _mock_get(monkeypatch, 200, HEADER + "\n" + "I,n,f,o,r,m,a\n")

    result = alphavantage.fetch_earnings_calendar()

    assert isinstance(result, Response)
    assert result.status_code == status.HTTP_503_SERVICE_UNAVAILABLE
    assert result.headers["Retry-After"] == "60000"


def test_header_only_empty_calendar_is_refused(monkeypatch):
    # An empty calendar is not a state worth caching: a real one always has rows,
    # and serving nothing for six hours is worse than a clean error.
    _mock_get(monkeypatch, 200, HEADER + "\n")

    result = alphavantage.fetch_earnings_calendar()

    assert isinstance(result, Response)
    assert result.status_code == status.HTTP_503_SERVICE_UNAVAILABLE


# --- upstream error mapping (mirrors fetch_wisesheets) ----------------------


def test_missing_api_key_is_a_500(monkeypatch):
    monkeypatch.delenv("ALPHAVANTAGE_API_KEY", raising=False)

    result = alphavantage.fetch_earnings_calendar()

    assert isinstance(result, Response)
    assert result.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR


def test_http_429_maps_to_503_with_retry_after(monkeypatch):
    _mock_get(monkeypatch, 429, "")

    result = alphavantage.fetch_earnings_calendar()

    assert result.status_code == status.HTTP_503_SERVICE_UNAVAILABLE
    assert result.headers["Retry-After"] == "60000"


def test_http_401_maps_to_500(monkeypatch):
    _mock_get(monkeypatch, 401, "")

    assert alphavantage.fetch_earnings_calendar().status_code == 500


def test_http_500_maps_to_500(monkeypatch):
    _mock_get(monkeypatch, 500, "")

    assert alphavantage.fetch_earnings_calendar().status_code == 500


def test_timeout_maps_to_503(monkeypatch):
    monkeypatch.setenv("ALPHAVANTAGE_API_KEY", "test-key")
    monkeypatch.setattr(
        alphavantage.requests, "get",
        lambda *a, **k: (_ for _ in ()).throw(requests.Timeout("timeout")),
    )

    result = alphavantage.fetch_earnings_calendar()

    assert result.status_code == status.HTTP_503_SERVICE_UNAVAILABLE
    assert result.headers["Retry-After"] == "60000"


# --- the view ---------------------------------------------------------------


def _calendar_payload():
    return build_payload(CALENDAR_CSV, AS_OF)


@pytest.mark.django_db
@patch("pages.views.overview.get_market_caps", return_value={})
@patch("pages.views.overview.financial_data_service.get_earnings_calendar")
def test_slices_the_cached_calendar_to_the_requested_window(mock_get, mock_caps, api_client):
    mock_get.return_value = _calendar_payload()

    response = api_client.post(url, {"start": "2026-10-15", "days": 1}, format="json")

    assert response.status_code == 200
    body = response.json()
    assert body["asOf"] == "2026-10-11"
    assert body["window"] == {"start": "2026-10-15", "end": "2026-10-15"}
    assert [day["date"] for day in body["days"]] == ["2026-10-15"]
    assert mock_get.call_count == 1


@pytest.mark.django_db
@patch("pages.views.overview.get_market_caps", return_value={})
@patch("pages.views.overview.financial_data_service.get_earnings_calendar")
def test_the_cached_unit_is_the_whole_calendar_not_the_window(mock_get, mock_caps, api_client):
    # Cost must be independent of how far the client pages: a second, disjoint
    # window is served from the one cached payload without a second upstream call.
    mock_get.return_value = _calendar_payload()

    api_client.post(url, {"start": "2026-10-15", "days": 1}, format="json")
    second = api_client.post(url, {"start": "2026-10-16", "days": 5}, format="json")

    assert second.json()["window"] == {"start": "2026-10-16", "end": "2026-10-20"}
    assert mock_get.call_count == 1


@pytest.mark.django_db
@patch("pages.views.overview.get_market_caps", return_value={})
@patch("pages.views.overview.financial_data_service.get_earnings_calendar")
def test_days_defaults_to_seven(mock_get, mock_caps, api_client):
    mock_get.return_value = _calendar_payload()

    response = api_client.post(url, {"start": "2026-10-15"}, format="json")

    assert response.status_code == 200
    # start + days - 1
    assert response.json()["window"] == {"start": "2026-10-15", "end": "2026-10-21"}


@pytest.mark.django_db
@patch("pages.views.overview.get_market_caps", return_value={})
@patch("pages.views.overview.financial_data_service.get_earnings_calendar")
def test_anonymous_without_a_session_header_is_allowed(mock_get, mock_caps, api_client):
    # AllowAnonymousWithQuota would 403 here: it needs a `symbol`, and the
    # calendar has none. A calendar must also not spend the 5 free symbol views.
    mock_get.return_value = _calendar_payload()

    response = api_client.post(url, {"start": "2026-10-15", "days": 7}, format="json")

    assert response.status_code == 200


@pytest.mark.django_db
@patch("pages.views.overview.get_market_caps", return_value={})
@patch("pages.views.overview.financial_data_service.get_earnings_calendar")
def test_repeated_views_never_exhaust_the_anonymous_quota(mock_get, mock_caps, api_client):
    # Six fills is more than QUOTA (5). A quota-guarded route refuses the sixth.
    mock_get.return_value = _calendar_payload()

    for _ in range(6):
        response = api_client.post(
            url,
            {"start": "2026-10-15", "days": 7},
            format="json",
            HTTP_X_ANONYMOUS_SESSION="earnings-session-repeat",
        )
        assert response.status_code == 200


@pytest.mark.django_db
@patch("pages.views.overview.get_market_caps", return_value={})
@patch("pages.views.overview.financial_data_service.get_earnings_calendar")
def test_second_request_is_served_from_the_mode_namespaced_cache(mock_get, mock_caps, api_client):
    mock_get.return_value = _calendar_payload()

    first = api_client.post(url, {"start": "2026-10-15", "days": 7}, format="json")
    second = api_client.post(url, {"start": "2026-10-15", "days": 7}, format="json")

    assert first.json() == second.json()
    assert mock_get.call_count == 1
    assert cache.get(f"{overview.MODE}:earnings_calendar") is not None
    assert overview.MODE in ("live", "mock")


@pytest.mark.django_db
@patch("pages.views.overview.financial_data_service.get_earnings_calendar")
def test_rate_limit_aborts_the_request_and_is_not_cached(mock_get, api_client):
    mock_get.return_value = Response(
        {"error": "rate limit issue"},
        status=status.HTTP_503_SERVICE_UNAVAILABLE,
        headers={"Retry-After": "60000"},
    )

    response = api_client.post(url, {"start": "2026-10-15", "days": 7}, format="json")

    assert response.status_code == 503
    assert response.headers.get("Retry-After") == "60000"
    assert cache.get(f"{overview.MODE}:earnings_calendar") is None


@pytest.mark.django_db
def test_missing_start_is_rejected(api_client):
    response = api_client.post(url, {"days": 7}, format="json")

    assert response.status_code == 400


@pytest.mark.django_db
def test_days_above_the_maximum_is_rejected(api_client):
    response = api_client.post(url, {"start": "2026-10-15", "days": 43}, format="json")

    assert response.status_code == 400


@pytest.mark.django_db
def test_days_below_one_is_rejected(api_client):
    response = api_client.post(url, {"start": "2026-10-15", "days": 0}, format="json")

    assert response.status_code == 400


def test_ttl_is_six_hours():
    # Four upstream calls a day at worst, against the shared 25/day budget.
    assert overview.EARNINGS_CALENDAR_TTL_SECONDS == TTL_SECONDS


# --- the market-cap filter: the two fields stamped on each tile -------------


def _tiles(body):
    return {
        tile["symbol"]: tile
        for day in body["days"]
        for group in day["sessions"]
        for tile in group["tiles"]
    }


def test_window_payload_stamps_market_cap_and_popular_on_every_tile():
    payload = build_payload(CALENDAR_CSV, AS_OF)
    # AAPL resolved to null (unresolved is not the same as small), TSM resolved
    # to a number; ZZZ is absent from caps the way a failed lookup leaves it.
    caps = {"TSM": 812000000000, "AAPL": None}

    tiles = _tiles(window_payload(payload, date(2026, 10, 15), date(2026, 10, 16), caps=caps))

    assert tiles["TSM"]["marketCap"] == 812000000000
    assert tiles["AAPL"]["marketCap"] is None
    assert tiles["ZZZ"]["marketCap"] is None
    # popular is computed server-side from the curated set, not sent by the client
    assert tiles["AAPL"]["popular"] is True
    assert tiles["NFLX"]["popular"] is True
    assert tiles["SCHW"]["popular"] is False  # a real name, but not a household one
    assert tiles["TSM"]["popular"] is False
    assert tiles["ZZZ"]["popular"] is False


def test_window_payload_without_caps_stamps_null_but_still_flags_popular():
    payload = build_payload(CALENDAR_CSV, AS_OF)

    tiles = _tiles(window_payload(payload, date(2026, 10, 15), date(2026, 10, 16)))

    assert all(tile["marketCap"] is None for tile in tiles.values())
    assert tiles["AAPL"]["popular"] is True


def test_window_payload_never_mutates_the_cached_payload():
    # The payload is the cached unit, shared by every window. Stamping one
    # window's caps must not leak into it (or into another window's response).
    payload = build_payload(CALENDAR_CSV, AS_OF)

    window_payload(payload, date(2026, 10, 15), date(2026, 10, 16), caps={"TSM": 1.0})

    for day in payload["days"]:
        for group in day["sessions"]:
            for tile in group["tiles"]:
                assert set(tile) == {"symbol", "name", "estimate"}


def test_window_symbols_is_exactly_what_the_window_carries():
    payload = build_payload(CALENDAR_CSV, AS_OF)

    assert window_symbols(payload, date(2026, 10, 15), date(2026, 10, 15)) == {
        "TSM", "SCHW", "NFLX", "WAL",
    }
    assert window_symbols(payload, date(2026, 10, 17), date(2026, 10, 18)) == set()


@pytest.mark.django_db
@patch("pages.views.overview.get_market_caps")
@patch("pages.views.overview.financial_data_service.get_earnings_calendar")
def test_view_stamps_resolved_caps_and_resolves_only_the_window(mock_get, mock_caps, api_client):
    mock_get.return_value = _calendar_payload()
    mock_caps.return_value = {"TSM": 812000000000}

    response = api_client.post(url, {"start": "2026-10-15", "days": 1}, format="json")

    assert response.status_code == 200
    tiles = _tiles(response.json())
    assert tiles["TSM"]["marketCap"] == 812000000000
    assert tiles["NFLX"]["marketCap"] is None
    # Oct 16's symbols (AAPL, ZZZ) are outside the window and must not be
    # resolved: cost has to track the window, not the whole forward calendar.
    assert mock_caps.call_args.args[0] == {"TSM", "SCHW", "NFLX", "WAL"}


@pytest.mark.django_db
@patch("pages.views.overview.get_market_caps")
@patch("pages.views.overview.financial_data_service.get_earnings_calendar")
def test_cap_resolution_failure_degrades_to_null_not_an_error(mock_get, mock_caps, api_client):
    # Sizes are a nicety: the calendar must still render when resolution fails.
    mock_get.return_value = _calendar_payload()
    mock_caps.side_effect = RuntimeError("cache backend down")

    response = api_client.post(url, {"start": "2026-10-15", "days": 1}, format="json")

    assert response.status_code == 200
    assert all(tile["marketCap"] is None for tile in _tiles(response.json()).values())
