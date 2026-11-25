import pytest

from portfolio import analysis, holdings


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


def _states(transactions, splits, prices):
    events = holdings.normalise(
        transactions, splits, analysis.close_lookup(prices)
    )
    return holdings.replay(events)


def _positions(transactions, splits, prices, dividends=None):
    return analysis.build_positions(
        transactions,
        splits,
        prices,
        _states(transactions, splits, prices),
        dividends or {},
        "9999-12-31",
    )


def _series(transactions, splits, prices, dividends, benchmark_prices, benchmark_dividends):
    return analysis.build_series(
        transactions,
        prices,
        dividends,
        splits,
        _states(transactions, splits, prices),
        "VOO",
        benchmark_prices,
        benchmark_dividends,
    )


def test_units_are_correct_across_a_ten_to_one_split():
    prices = {
        "NVDA": [
            ("2024-06-06", 121.00, 120.66),
            ("2024-06-10", 121.79, 121.45),
            ("2026-10-13", 228.52, 228.52),
        ]
    }
    splits = [
        {
            "symbol": "NVDA",
            "effective_date": "2024-06-10",
            "numerator": 10,
            "denominator": 1,
        }
    ]
    # $12,100 at the real pre-split price of $1,210 for 10 shares. The provider
    # stores the same day as a split-adjusted 121.00, so the recorded split must
    # carry the units to 100 and leave the cost basis alone.
    transactions = [_buy("NVDA", "2024-06-06", 12100.0, shares=10.0, price=1210.0)]

    positions = _positions(transactions, splits, prices)

    assert positions[0]["units"] == pytest.approx(100.0)
    assert positions[0]["market_value"] == pytest.approx(22852.0)
    assert positions[0]["cost_basis"] == pytest.approx(12100.0)
    assert positions[0]["average_cost"] == pytest.approx(121.0)
    assert positions[0]["return_pct"] == pytest.approx(88.8595, abs=1e-4)
    assert positions[0]["split_factor"] == 10.0


def test_a_weekend_purchase_uses_the_prior_session():
    prices = {"AAPL": [("2024-06-07", 100.0, 100.0), ("2024-06-10", 110.0, 110.0)]}

    positions = _positions([_buy("AAPL", "2024-06-08", 500.0)], [], prices)

    assert positions[0]["units"] == pytest.approx(5.0)


def test_a_sale_removes_units_at_the_average_cost():
    # Cost basis is the remaining average cost, not net cash. The return
    # divides profit by what is still owned: 1,000 profit on 800 of cost.
    prices = {"AAPL": [("2024-01-02", 100.0, 100.0), ("2024-06-03", 200.0, 200.0)]}
    transactions = [
        _buy("AAPL", "2024-01-02", 1000.0),
        _sell("AAPL", "2024-06-03", 400.0),
    ]

    positions = _positions(transactions, [], prices)

    assert positions[0]["units"] == pytest.approx(8.0)
    assert positions[0]["market_value"] == pytest.approx(1600.0)
    assert positions[0]["cost_basis"] == pytest.approx(800.0)
    assert positions[0]["average_cost"] == pytest.approx(100.0)
    assert positions[0]["realized"] == pytest.approx(200.0)
    assert positions[0]["unrealized"] == pytest.approx(800.0)
    assert positions[0]["profit"] == pytest.approx(1000.0)
    assert positions[0]["return_pct"] == pytest.approx(125.0)


def test_fractional_units_survive():
    prices = {"AAPL": [("2024-01-02", 100.0, 100.0)]}

    positions = _positions([_buy("AAPL", "2024-01-02", 50.0)], [], prices)

    assert positions[0]["units"] == pytest.approx(0.5)


def test_a_purchase_before_the_window_uses_the_first_row():
    prices = {"AAPL": [("2024-06-03", 100.0, 100.0)]}

    positions = _positions([_buy("AAPL", "2024-01-02", 500.0)], [], prices)

    assert positions[0]["units"] == pytest.approx(5.0)
    assert positions[0]["first_date"] == "2024-01-02"


def test_split_factor_is_none_without_a_recorded_split():
    prices = {"AAPL": [("2024-01-02", 100.0, 100.0)]}

    positions = _positions(
        [_buy("AAPL", "2024-01-02", 1000.0, shares=10.0)], [], prices
    )

    assert positions[0]["split_factor"] is None


def test_split_factor_multiplies_splits_after_the_first_purchase_only():
    prices = {"AAPL": [("2024-01-02", 100.0, 100.0), ("2025-01-02", 10.0, 10.0)]}
    splits = [
        {"symbol": "AAPL", "effective_date": "2024-06-10", "numerator": 2, "denominator": 1},
        {"symbol": "AAPL", "effective_date": "2024-12-10", "numerator": 3, "denominator": 1},
        {"symbol": "AAPL", "effective_date": "2023-12-10", "numerator": 10, "denominator": 1},
    ]

    positions = _positions(
        [_buy("AAPL", "2024-01-02", 1000.0, shares=10.0)], splits, prices
    )

    assert positions[0]["split_factor"] == 6.0


def test_series_and_summary_match_hand_computed_values():
    prices = {
        "AAPL": [("2024-01-02", 100.0, 100.0), ("2024-06-03", 120.0, 120.0)],
        "VOO": [("2024-01-02", 200.0, 200.0), ("2024-06-03", 260.0, 260.0)],
    }
    transactions = [_buy("AAPL", "2024-01-02", 1000.0)]

    series = _series(
        transactions, [], prices, {"AAPL": [], "VOO": []}, prices, {"VOO": []}
    )
    summary = analysis.summarize(series, 1000.0)

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

    series = _series(transactions, [], prices, dividends, prices, dividends)
    summary = analysis.summarize(series, 1000.0)

    # 10 units held on the ex-date, so 20 dollars of cash.
    assert summary["dividends"] == pytest.approx(20.0)
    assert summary["profit"] == pytest.approx(220.0)
    assert summary["return_pct"] == pytest.approx(22.0)


def test_summary_return_divides_profit_by_cost_basis():
    prices = {
        "AAPL": [("2024-01-02", 100.0, 100.0), ("2024-06-03", 110.0, 110.0)],
        "VOO": [("2024-01-02", 200.0, 200.0), ("2024-06-03", 260.0, 260.0)],
    }
    transactions = [
        _buy("AAPL", "2024-01-02", 2000.0, shares=20.0),
        _sell("AAPL", "2024-06-03", 1000.0, shares=10.0),
    ]

    positions = _positions(transactions, [], prices)
    series = _series(
        transactions, [], prices, {"AAPL": [], "VOO": []}, prices, {"VOO": []}
    )
    summary = analysis.summarize(
        series, sum(position["cost_basis"] for position in positions)
    )

    # 10 units left at a 1,000 cost basis, worth 1,100. Dividing by every
    # dollar ever bought (2,000) would print 5%.
    assert positions[0]["cost_basis"] == pytest.approx(1000.0)
    assert summary["profit"] == pytest.approx(100.0)
    assert summary["return_pct"] == pytest.approx(10.0)


def test_a_fully_sold_summary_has_no_return():
    prices = {
        "AAPL": [("2024-01-02", 100.0, 100.0), ("2024-06-03", 98.0, 98.0)],
        "VOO": [("2024-01-02", 200.0, 200.0), ("2024-06-03", 260.0, 260.0)],
    }
    transactions = [
        _buy("AAPL", "2024-01-02", 1000.0, shares=10.0),
        _sell("AAPL", "2024-06-03", 980.0, shares=10.0),
    ]

    positions = _positions(transactions, [], prices)
    series = _series(
        transactions, [], prices, {"AAPL": [], "VOO": []}, prices, {"VOO": []}
    )
    summary = analysis.summarize(
        series, sum(position["cost_basis"] for position in positions)
    )

    assert positions[0]["cost_basis"] == 0.0
    assert summary["profit"] == pytest.approx(-20.0)
    assert summary["return_pct"] is None


def test_series_values_a_pre_split_point_in_today_share_units():
    prices = {
        "AAPL": [
            ("2024-01-02", 10.0, 10.0),
            ("2024-06-10", 10.5, 10.5),
        ],
        "VOO": [("2024-01-02", 200.0, 200.0), ("2024-06-10", 260.0, 260.0)],
    }
    splits = [
        {"symbol": "AAPL", "effective_date": "2024-06-10", "numerator": 10, "denominator": 1}
    ]
    # 10 shares at an actual $100 is $1,000; the provider stores that day as a
    # split-adjusted 10.00, so the 10:1 split must restate the units to 100 or
    # the first point would read $100.
    transactions = [_buy("AAPL", "2024-01-02", 1000.0, shares=10.0)]

    series = _series(transactions, splits, prices, {"AAPL": [], "VOO": []}, prices, {"VOO": []})

    assert series["value"][0] == 1000.0
    assert series["value"][1] == pytest.approx(1050.0)


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
        [],
        _states(transactions, [], prices),
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

    returns = _positions(transactions, [], prices)[0]["period_returns"]

    assert returns["1d"] == pytest.approx(0.8333, abs=1e-3)
    assert returns["1m"] == pytest.approx(10.0)
    assert returns["ytd"] == pytest.approx(21.0)
    # No data before the first row, so a long period falls back to it.
    assert returns["5y"] == pytest.approx(21.0)
    # 'all' is the profit return, not a price change.
    assert returns["all"] == pytest.approx(21.0)


def test_with_live_close_appends_a_row_for_the_window_end():
    prices = {"AAPL": [("2024-06-03", 120.0, 120.0)]}

    wrapped = analysis.with_live_close(prices, {"AAPL": 125.0}, "2024-06-04")

    assert wrapped["AAPL"] == [
        ("2024-06-03", 120.0, 120.0),
        ("2024-06-04", 125.0, 125.0),
    ]


def test_with_live_close_keeps_a_series_that_already_reaches_the_day():
    prices = {"AAPL": [("2024-06-04", 120.0, 120.0)]}

    wrapped = analysis.with_live_close(prices, {"AAPL": 125.0}, "2024-06-04")

    assert wrapped["AAPL"] == [("2024-06-04", 120.0, 120.0)]


def test_with_live_close_ignores_a_symbol_without_a_quote():
    prices = {"AAPL": [("2024-06-03", 120.0, 120.0)]}

    wrapped = analysis.with_live_close(prices, {"AAPL": None}, "2024-06-04")

    assert wrapped["AAPL"] == [("2024-06-03", 120.0, 120.0)]


def test_with_live_close_gives_an_empty_series_one_point():
    prices = {"AAPL": []}

    wrapped = analysis.with_live_close(prices, {"AAPL": 125.0}, "2024-06-04")

    assert wrapped["AAPL"] == [("2024-06-04", 125.0, 125.0)]


def test_with_live_close_returns_the_same_map_without_quotes():
    prices = {"AAPL": [("2024-06-03", 120.0, 120.0)]}

    assert analysis.with_live_close(prices, None, "2024-06-04") is prices


def test_with_live_close_does_not_mutate_the_input():
    prices = {"AAPL": [("2024-06-03", 120.0, 120.0)]}

    analysis.with_live_close(prices, {"AAPL": 125.0}, "2024-06-04")

    assert prices == {"AAPL": [("2024-06-03", 120.0, 120.0)]}


def test_income_projection_sums_the_trailing_year_for_held_symbols():
    states = {
        "AAPL": {"units": 10.0},
        "MSFT": {"units": 5.0},
        "OLD": {"units": 0.0},
    }
    dividends = {
        "AAPL": [("2025-03-01", 0.25), ("2025-09-01", 0.25)],
        "MSFT": [],
        "OLD": [("2025-06-01", 2.0)],
    }

    projection = analysis.income_projection(states, dividends, "2026-01-01", 1000.0)

    # Two 0.25 payments on 10 units. MSFT pays nothing and OLD is fully sold.
    assert projection["forward_income"] == 5.0
    assert projection["forward_yield_pct"] == 0.5
    assert projection["dividend_growth_pct"] is None


def test_income_projection_compares_the_trailing_year_with_the_prior_one():
    states = {"AAPL": {"units": 10.0}}
    dividends = {
        "AAPL": [
            ("2024-03-01", 0.20),
            ("2024-09-01", 0.20),
            ("2025-03-01", 0.25),
            ("2025-09-01", 0.25),
        ]
    }

    projection = analysis.income_projection(states, dividends, "2026-01-01", 2000.0)

    # 0.50 per share this year against 0.40 last year, times 10 units.
    assert projection["forward_income"] == 5.0
    assert projection["forward_yield_pct"] == 0.25
    assert projection["dividend_growth_pct"] == 25.0


def test_an_empty_ledger_summarizes_to_zeros():
    empty = {
        "dates": [],
        "value": [],
        "invested": [],
        "dividends": [],
        "benchmark_value": [],
        "benchmark_dividends": [],
    }

    assert analysis.summarize(empty, 0.0) == {
        "value": 0.0,
        "invested": 0.0,
        "dividends": 0.0,
        "profit": 0.0,
        "return_pct": None,
        "benchmark_value": 0.0,
        "benchmark_profit": 0.0,
        "benchmark_return_pct": None,
    }
