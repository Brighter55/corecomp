import pytest

from portfolio import analysis


def _buy(symbol, day, amount, shares=None, price=None):
    return {
        "symbol": symbol,
        "trade_date": day,
        "kind": "BUY",
        "amount": amount,
        "shares": shares,
        "price": price,
    }


def _sell(symbol, day, amount, shares=None):
    return {
        "symbol": symbol,
        "trade_date": day,
        "kind": "SELL",
        "amount": amount,
        "shares": shares,
        "price": None,
    }


def test_units_are_correct_across_a_ten_to_one_split():
    prices = {
        "NVDA": [
            ("2024-06-06", 121.00, 120.66),
            ("2024-06-10", 121.79, 121.45),
            ("2026-10-13", 228.52, 228.52),
        ]
    }
    # $12,100 at the real pre-split price of $1,210 for 10 shares. The provider
    # stores the same day as a split-adjusted 121.00, so units must come out 100.
    transactions = [_buy("NVDA", "2024-06-06", 12100.0, shares=10.0, price=1210.0)]

    positions = analysis.build_positions(transactions, prices)

    assert positions[0]["units"] == pytest.approx(100.0)
    assert positions[0]["market_value"] == pytest.approx(22852.0)
    assert positions[0]["cost_basis"] == pytest.approx(12100.0)
    assert positions[0]["return_pct"] == pytest.approx(88.8595, abs=1e-4)
    assert positions[0]["split_factor"] == 10.0


def test_a_weekend_purchase_uses_the_prior_session():
    prices = {"AAPL": [("2024-06-07", 100.0, 100.0), ("2024-06-10", 110.0, 110.0)]}

    positions = analysis.build_positions(
        [_buy("AAPL", "2024-06-08", 500.0)], prices
    )

    assert positions[0]["units"] == pytest.approx(5.0)


def test_a_sale_reduces_units_and_net_invested():
    prices = {"AAPL": [("2024-01-02", 100.0, 100.0), ("2024-06-03", 200.0, 200.0)]}
    transactions = [
        _buy("AAPL", "2024-01-02", 1000.0),
        _sell("AAPL", "2024-06-03", 400.0),
    ]

    positions = analysis.build_positions(transactions, prices)

    assert positions[0]["units"] == pytest.approx(8.0)
    assert positions[0]["market_value"] == pytest.approx(1600.0)
    assert positions[0]["cost_basis"] == pytest.approx(600.0)
    assert positions[0]["return_pct"] == pytest.approx(166.6667, abs=1e-4)


def test_fractional_units_survive():
    prices = {"AAPL": [("2024-01-02", 100.0, 100.0)]}

    positions = analysis.build_positions([_buy("AAPL", "2024-01-02", 50.0)], prices)

    assert positions[0]["units"] == pytest.approx(0.5)


def test_a_purchase_before_the_window_uses_the_first_row():
    prices = {"AAPL": [("2024-06-03", 100.0, 100.0)]}

    positions = analysis.build_positions([_buy("AAPL", "2024-01-02", 500.0)], prices)

    assert positions[0]["units"] == pytest.approx(5.0)
    assert positions[0]["first_date"] == "2024-01-02"


def test_an_ambiguous_split_ratio_is_reported_as_unknown():
    assert analysis.split_factor(100.0, 11.0) is None
    assert analysis.split_factor(100.0, 0.0) is None
    assert analysis.split_factor(100.0, None) is None


def test_series_and_summary_match_hand_computed_values():
    prices = {
        "AAPL": [("2024-01-02", 100.0, 100.0), ("2024-06-03", 120.0, 120.0)],
        "VOO": [("2024-01-02", 200.0, 200.0), ("2024-06-03", 260.0, 260.0)],
    }
    transactions = [_buy("AAPL", "2024-01-02", 1000.0)]

    series = analysis.build_series(
        transactions, prices, {"AAPL": [], "VOO": []}, "VOO", prices, {"VOO": []}
    )
    summary = analysis.summarize(series)

    assert series["dates"] == ["2024-01-02", "2024-06-03"]
    assert series["value"] == [1000.0, 1200.0]
    assert series["invested"] == [1000.0, 1000.0]
    assert series["benchmark_value"] == [1000.0, 1300.0]
    assert summary == {
        "value": 1200.0,
        "invested": 1000.0,
        "dividends": 0.0,
        "profit": 200.0,
        "return_pct": 20.0,
        "benchmark_value": 1300.0,
        "benchmark_profit": 300.0,
        "benchmark_return_pct": 30.0,
    }


def test_cash_dividends_add_to_profit_and_use_current_units():
    prices = {
        "AAPL": [("2024-01-02", 100.0, 100.0), ("2024-06-03", 120.0, 120.0)],
        "VOO": [("2024-01-02", 200.0, 200.0), ("2024-06-03", 260.0, 260.0)],
    }
    transactions = [_buy("AAPL", "2024-01-02", 1000.0)]
    dividends = {"AAPL": [("2024-03-15", 2.0)], "VOO": []}

    series = analysis.build_series(
        transactions, prices, dividends, "VOO", prices, dividends
    )
    summary = analysis.summarize(series)

    # 10 units held on the ex-date, so 20 dollars of cash.
    assert summary["dividends"] == pytest.approx(20.0)
    assert summary["profit"] == pytest.approx(220.0)
    assert summary["return_pct"] == pytest.approx(22.0)


def test_series_respects_the_requested_window():
    prices = {
        "AAPL": [
            ("2024-01-02", 100.0, 100.0),
            ("2024-03-01", 110.0, 110.0),
            ("2024-06-03", 120.0, 120.0),
        ],
        "VOO": [("2024-01-02", 200.0, 200.0), ("2024-06-03", 260.0, 260.0)],
    }
    transactions = [_buy("AAPL", "2024-01-02", 1000.0)]

    series = analysis.build_series(
        transactions,
        prices,
        {"AAPL": [], "VOO": []},
        "VOO",
        prices,
        {"VOO": []},
        start="2024-02-01",
        end="2024-05-01",
    )

    assert series["dates"] == ["2024-03-01"]


def test_positions_carry_a_return_for_each_period_tab():
    prices = {
        "AAPL": [
            ("2024-01-02", 100.0, 100.0),
            ("2024-10-11", 110.0, 110.0),
            ("2024-11-08", 120.0, 120.0),
            ("2024-11-11", 121.0, 121.0),
        ]
    }
    transactions = [_buy("AAPL", "2024-01-02", 1000.0)]

    returns = analysis.build_positions(transactions, prices)[0]["period_returns"]

    assert returns["1d"] == pytest.approx(0.8333, abs=1e-3)
    assert returns["1m"] == pytest.approx(10.0)
    assert returns["ytd"] == pytest.approx(21.0)
    # No data before the first row, so a long period falls back to it.
    assert returns["5y"] == pytest.approx(21.0)
    # 'all' is the cost-basis lifetime return, not a price change.
    assert returns["all"] == pytest.approx(21.0)


def test_an_empty_ledger_summarizes_to_zeros():
    empty = {
        "dates": [],
        "value": [],
        "invested": [],
        "dividends": [],
        "benchmark_value": [],
        "benchmark_dividends": [],
    }

    assert analysis.summarize(empty) == {
        "value": 0.0,
        "invested": 0.0,
        "dividends": 0.0,
        "profit": 0.0,
        "return_pct": None,
        "benchmark_value": 0.0,
        "benchmark_profit": 0.0,
        "benchmark_return_pct": None,
    }
