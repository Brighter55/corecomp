from unittest.mock import patch

import pytest
from pages import wisesheets
from rest_framework.response import Response


@pytest.fixture(autouse=True)
def clear_upstream_memo():
    wisesheets._UPSTREAM_CACHE.clear()
    yield
    wisesheets._UPSTREAM_CACHE.clear()


@patch("pages.wisesheets.fetch_wisesheets")
def test_uses_the_split_adjusted_amount(mock_fetch):
    mock_fetch.return_value = {
        "data": [
            {
                "symbol": "NVDA",
                "date": "2022-03-02",
                "adjDividend": "0.004",
                "dividend": "0.04",
            }
        ],
        "meta": {},
    }

    result = wisesheets.get_dividends_batch(["NVDA"], "2022-01-01", "2022-12-31")

    assert result["NVDA"] == [("2022-03-02", 0.004)]


@patch("pages.wisesheets.fetch_wisesheets")
def test_requests_adj_dividend_over_the_range(mock_fetch):
    mock_fetch.return_value = {"data": [], "meta": {}}

    wisesheets.get_dividends_batch(["aapl"], "2022-01-01", "2022-12-31")

    endpoint, params = mock_fetch.call_args.args
    assert endpoint == "dividends"
    assert params["tickers"] == "AAPL"
    assert params["fields"].startswith("adjDividend")
    assert params["from"] == "2022-01-01"
    assert params["to"] == "2022-12-31"
    assert params["order"] == "asc"


@patch("pages.wisesheets.fetch_wisesheets")
def test_symbols_that_pay_nothing_are_present_as_empty_lists(mock_fetch):
    mock_fetch.return_value = {"data": [], "meta": {}}

    result = wisesheets.get_dividends_batch(
        ["KO", "BRK.B"], "2024-01-01", "2024-12-31"
    )

    assert result == {"BRK.B": [], "KO": []}


@patch("pages.wisesheets.fetch_wisesheets")
def test_rows_are_sorted_oldest_first(mock_fetch):
    mock_fetch.return_value = {
        "data": [
            {"symbol": "KO", "date": "2024-09-13", "adjDividend": "0.485"},
            {"symbol": "KO", "date": "2024-03-14", "adjDividend": "0.485"},
        ],
        "meta": {},
    }

    result = wisesheets.get_dividends_batch(["KO"], "2024-01-01", "2024-12-31")

    assert [row[0] for row in result["KO"]] == ["2024-03-14", "2024-09-13"]


@patch("pages.wisesheets.fetch_wisesheets")
def test_upstream_error_propagates(mock_fetch):
    error = Response({"error": "rate limit issue"}, status=503)
    mock_fetch.return_value = error

    result = wisesheets.get_dividends_batch(["AAPL"], "2022-01-01", "2022-12-31")

    assert result is error


@patch("pages.wisesheets.fetch_wisesheets")
def test_single_symbol_dividends_prefer_the_adjusted_amount(mock_fetch):
    mock_fetch.return_value = {
        "data": [
            {
                "symbol": "NVDA",
                "date": "2022-03-02",
                "adjDividend": "0.004",
                "dividend": "0.04",
                "recordDate": "2022-03-02",
                "paymentDate": "2022-03-10",
                "declarationDate": "2022-02-10",
            }
        ],
        "meta": {},
    }

    result = wisesheets.get_dividends_av("NVDA")

    assert result["data"][0]["amount"] == "0.004"
