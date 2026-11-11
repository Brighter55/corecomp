from unittest.mock import patch

import pytest
from pages import wisesheets
from rest_framework.response import Response


@pytest.fixture(autouse=True)
def clear_upstream_memo():
    wisesheets._UPSTREAM_CACHE.clear()
    yield
    wisesheets._UPSTREAM_CACHE.clear()


def _page(rows, cursor=None, truncated=False):
    return {
        "data": rows,
        "meta": {"nextCursor": cursor, "truncated": truncated},
    }


def _row(symbol, day, close, adj=None):
    return {
        "symbol": symbol,
        "date": day,
        "close": close,
        "adjClose": close if adj is None else adj,
    }


@patch("pages.wisesheets.fetch_wisesheets")
def test_returns_daily_rows_per_symbol_oldest_first(mock_fetch):
    mock_fetch.return_value = _page([
        _row("AAPL", "2024-01-03", "101"),
        _row("AAPL", "2024-01-02", "100"),
        _row("VOO", "2024-01-02", "400"),
    ])

    result = wisesheets.get_eod_daily_batch(
        ["aapl", "VOO"], "2024-01-02", "2024-01-03"
    )

    assert result["AAPL"] == [
        ("2024-01-02", 100.0, 100.0),
        ("2024-01-03", 101.0, 101.0),
    ]
    assert result["VOO"] == [("2024-01-02", 400.0, 400.0)]


@patch("pages.wisesheets.fetch_wisesheets")
def test_requests_the_inclusive_period_and_both_price_columns(mock_fetch):
    mock_fetch.return_value = _page([])

    wisesheets.get_eod_daily_batch(["aapl"], "2024-01-02", "2024-01-03")

    endpoint, params = mock_fetch.call_args.args
    assert endpoint == "prices/eod"
    assert params["tickers"] == "AAPL"
    assert params["period"] == "2024-01-02..2024-01-03"
    assert params["fields"] == "close,adjClose"
    assert params["limit"] == 10000
    assert params["order"] == "asc"


@patch("pages.wisesheets.fetch_wisesheets")
def test_follows_next_cursor_even_when_truncated_is_false(mock_fetch):
    mock_fetch.side_effect = [
        _page([_row("AAPL", "2024-01-02", "100")], cursor="c1"),
        _page([_row("AAPL", "2024-01-03", "101")]),
    ]

    result = wisesheets.get_eod_daily_batch(["AAPL"], "2024-01-02", "2024-01-03")

    assert [row[0] for row in result["AAPL"]] == ["2024-01-02", "2024-01-03"]
    assert mock_fetch.call_count == 2
    assert mock_fetch.call_args_list[1].args[1]["cursor"] == "c1"


@patch("pages.wisesheets.fetch_wisesheets")
def test_a_repeating_cursor_does_not_loop_forever(mock_fetch):
    mock_fetch.return_value = _page([], cursor="same")

    result = wisesheets.get_eod_daily_batch(["AAPL"], "2024-01-02", "2024-01-02")

    assert result == {"AAPL": []}
    assert mock_fetch.call_count == 2


@patch("pages.wisesheets.fetch_wisesheets")
def test_missing_symbol_is_present_as_an_empty_list(mock_fetch):
    mock_fetch.return_value = _page([_row("AAPL", "2024-01-02", "100")])

    result = wisesheets.get_eod_daily_batch(
        ["AAPL", "VOO"], "2024-01-02", "2024-01-02"
    )

    assert result["VOO"] == []


@patch("pages.wisesheets.fetch_wisesheets")
def test_rows_without_a_close_are_skipped(mock_fetch):
    mock_fetch.return_value = _page([
        {"symbol": "AAPL", "date": "2024-01-02", "close": None, "adjClose": None},
        _row("AAPL", "2024-01-03", "101"),
    ])

    result = wisesheets.get_eod_daily_batch(["AAPL"], "2024-01-02", "2024-01-03")

    assert result["AAPL"] == [("2024-01-03", 101.0, 101.0)]


@patch("pages.wisesheets.fetch_wisesheets")
def test_twenty_six_symbols_use_two_requests(mock_fetch):
    mock_fetch.return_value = _page([])
    symbols = [f"S{index:02d}" for index in range(26)]

    wisesheets.get_eod_daily_batch(symbols, "2024-01-02", "2024-01-02")

    assert mock_fetch.call_count == 2


@patch("pages.wisesheets.fetch_wisesheets")
def test_upstream_error_propagates(mock_fetch):
    error = Response({"error": "rate limit issue"}, status=503)
    mock_fetch.return_value = error

    result = wisesheets.get_eod_daily_batch(["AAPL"], "2024-01-02", "2024-01-03")

    assert result is error


@patch("pages.wisesheets.fetch_wisesheets")
def test_empty_symbol_list_makes_no_request(mock_fetch):
    assert wisesheets.get_eod_daily_batch([], "2024-01-02", "2024-01-03") == {}
    assert mock_fetch.call_count == 0
