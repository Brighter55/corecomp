"""Tests for market cap resolution and the curated POPULAR set.

No live request is ever made: `wisesheets.get_live_rows` is patched in every
test that resolves anything, because the WiseSheets account is a shared
5,000/month budget that production spends from too.
"""

from unittest.mock import patch

import pytest
from pages import market_caps
from pages.market_caps import POPULAR, get_market_caps, is_popular
from pages.views import overview
from rest_framework import status
from rest_framework.response import Response


def _rows(symbols_with_caps):
    return {
        symbol: {"symbol": symbol, "marketCap": cap}
        for symbol, cap in symbols_with_caps.items()
    }


class _RecordingCache:
    """Minimal stand-in for the Django cache.

    Keeps every test off the shared Redis DB -- a dev server writing it cannot
    make a result depend on run order -- and lets the TTL each write carries be
    asserted directly instead of inferred from a sleep.
    """

    def __init__(self):
        self.values = {}
        self.writes = []

    def get(self, key, default=None):
        return self.values.get(key, default)

    def set(self, key, value, timeout=None):
        self.values[key] = value
        self.writes.append((key, value, timeout))


@pytest.fixture(autouse=True)
def fake_cache(monkeypatch):
    """A fresh cache per test. Request it by name to inspect the writes."""
    fake = _RecordingCache()
    monkeypatch.setattr(market_caps, "cache", fake)
    return fake


# --- is_popular and the curated set -----------------------------------------


def test_is_popular_is_case_insensitive_membership():
    assert is_popular("AAPL") is True
    assert is_popular("aapl") is True
    assert is_popular("ZZZ") is False
    assert is_popular("") is False
    assert is_popular(None) is False


def test_popular_is_the_fixed_recognition_set():
    # The recognition bar, not a size bar -- pinned so a change to the list is
    # deliberate, and kept narrow so it does not collapse into the cap100b
    # option where nearly every member is already over 100 billion.
    assert POPULAR == frozenset({
        "AAPL", "MSFT", "NVDA", "GOOGL", "AMZN", "META", "TSLA", "AVGO",
        "ORCL", "AMD", "NFLX", "INTC", "IBM", "JPM", "V", "MA", "BAC",
        "WFC", "GS", "UNH", "JNJ", "LLY", "PFE", "MRK", "WMT", "PG", "KO",
        "PEP", "COST", "HD", "MCD", "NKE", "DIS", "SBUX", "XOM", "CVX",
        "CAT", "BA", "GE", "VZ", "T",
    })
    assert len(POPULAR) == 41


def test_market_cap_mode_matches_the_view_namespace():
    # market_caps repeats the {MODE} expression the views build. This pins the
    # two equal, so a change to how MOCK is read cannot drift them apart.
    assert market_caps.MODE == overview.MODE
    assert market_caps.MODE in ("live", "mock")


# --- get_market_caps: resolution --------------------------------------------


@patch("pages.wisesheets.get_live_rows")
def test_resolved_caps_come_back_as_floats(mock_rows):
    mock_rows.return_value = _rows({"AAPL": "3440000000000", "JPM": "830000000000"})

    assert get_market_caps(["AAPL", "JPM"]) == {
        "AAPL": 3440000000000.0,
        "JPM": 830000000000.0,
    }


@patch("pages.wisesheets.get_live_rows")
def test_a_symbol_absent_upstream_resolves_to_none(mock_rows):
    mock_rows.return_value = _rows({"AAPL": "3440000000000"})  # JPM missing

    assert get_market_caps(["AAPL", "JPM"]) == {
        "AAPL": 3440000000000.0,
        "JPM": None,
    }


@patch("pages.wisesheets.get_live_rows")
def test_a_row_without_a_market_cap_resolves_to_none(mock_rows):
    mock_rows.return_value = {"ZZZ": {"symbol": "ZZZ"}}  # no marketCap field

    assert get_market_caps(["ZZZ"]) == {"ZZZ": None}


@patch("pages.wisesheets.get_live_rows")
def test_keys_come_back_as_the_caller_spelled_them(mock_rows):
    mock_rows.return_value = _rows({"AAPL": "3440000000000"})

    assert get_market_caps(["aapl"]) == {"aapl": 3440000000000.0}


@patch("pages.wisesheets.get_live_rows")
def test_a_provider_row_keyed_in_any_case_still_matches(mock_rows):
    mock_rows.return_value = {"aapl": {"symbol": "aapl", "marketCap": "3440000000000"}}

    assert get_market_caps(["AAPL"]) == {"AAPL": 3440000000000.0}


# --- get_market_caps: the per-symbol cache ----------------------------------


@patch("pages.wisesheets.get_live_rows")
def test_the_per_symbol_cache_serves_a_second_call_without_refetching(mock_rows):
    mock_rows.return_value = _rows({"AAPL": "3440000000000"})

    first = get_market_caps(["AAPL"])
    second = get_market_caps(["AAPL"])

    assert first == second == {"AAPL": 3440000000000.0}
    assert mock_rows.call_count == 1


@patch("pages.wisesheets.get_live_rows")
def test_a_symbol_cached_as_none_is_not_refetched_inside_the_retry_window(mock_rows, fake_cache):
    # A cached None must read as "unresolved this period", not as a cache miss,
    # or one upstream failure would re-hit the provider on every request.
    fake_cache.set(f"{market_caps.MODE}:market_cap_ZZZ", None, timeout=99999)

    assert get_market_caps(["ZZZ"]) == {"ZZZ": None}
    assert mock_rows.call_count == 0


@patch("pages.wisesheets.get_live_rows")
def test_a_resolved_cap_is_cached_for_a_week(mock_rows, fake_cache):
    mock_rows.return_value = _rows({"AAPL": "3440000000000"})

    get_market_caps(["AAPL"])

    assert fake_cache.writes == [
        (f"{market_caps.MODE}:market_cap_AAPL", 3440000000000.0, market_caps.CAP_TTL_SECONDS)
    ]


@patch("pages.wisesheets.get_live_rows")
def test_an_unresolved_symbol_is_cached_for_the_short_retry_window(mock_rows, fake_cache):
    mock_rows.return_value = {}  # symbol absent upstream

    get_market_caps(["ZZZ"])

    assert fake_cache.writes == [
        (f"{market_caps.MODE}:market_cap_ZZZ", None, market_caps.CAP_RETRY_TTL_SECONDS)
    ]


def test_the_retry_window_is_far_shorter_than_the_resolved_ttl():
    assert market_caps.CAP_TTL_SECONDS == 604800
    assert market_caps.CAP_RETRY_TTL_SECONDS < market_caps.CAP_TTL_SECONDS


# --- get_market_caps: upstream errors and batching --------------------------


@patch("pages.wisesheets.get_live_rows")
def test_an_upstream_error_degrades_every_batched_symbol_to_null(mock_rows):
    mock_rows.return_value = Response(
        {"error": "rate limit issue"}, status=status.HTTP_503_SERVICE_UNAVAILABLE
    )

    assert get_market_caps(["AAPL", "MSFT"]) == {"AAPL": None, "MSFT": None}


@patch("pages.wisesheets.get_live_rows")
def test_a_batch_error_is_retried_soon_not_pinned_for_a_week(mock_rows, fake_cache):
    mock_rows.return_value = Response(
        {"error": "rate limit issue"}, status=status.HTTP_503_SERVICE_UNAVAILABLE
    )

    get_market_caps(["AAPL"])

    assert fake_cache.writes == [
        (f"{market_caps.MODE}:market_cap_AAPL", None, market_caps.CAP_RETRY_TTL_SECONDS)
    ]


@patch("pages.wisesheets.get_live_rows")
def test_batches_never_exceed_the_provider_ticker_ceiling(mock_rows):
    mock_rows.return_value = {}
    symbols = [f"S{i:03d}" for i in range(60)]

    get_market_caps(symbols)

    assert [len(call.args[0]) for call in mock_rows.call_args_list] == [25, 25, 10]


@patch("pages.wisesheets.get_live_rows")
def test_no_call_is_made_for_an_empty_batch(mock_rows):
    assert get_market_caps([]) == {}
    assert mock_rows.call_count == 0


@patch("pages.wisesheets.get_live_rows")
def test_mock_mode_resolves_nothing_and_never_reaches_the_provider(mock_rows, monkeypatch):
    # The browser suite runs MOCK=True and must spend no WiseSheets quota, so
    # the mock calendar gets no live caps at all.
    monkeypatch.setattr(market_caps, "MODE", "mock")

    assert get_market_caps(["AAPL", "MSFT"]) == {}
    assert mock_rows.call_count == 0
