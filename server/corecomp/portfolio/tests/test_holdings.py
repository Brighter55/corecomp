import pytest

from portfolio import holdings


def _trade(symbol, day, kind, shares, amount):
    return {
        "symbol": symbol,
        "trade_date": day,
        "kind": kind,
        "shares": shares,
        "price": None,
        "amount": amount,
    }


def _legacy(symbol, day, kind, amount):
    return {
        "symbol": symbol,
        "trade_date": day,
        "kind": kind,
        "shares": None,
        "price": None,
        "amount": amount,
    }


def _split(symbol, day, numerator, denominator):
    return {
        "symbol": symbol,
        "effective_date": day,
        "numerator": numerator,
        "denominator": denominator,
    }


def _run(transactions, splits=(), prices=None):
    prices = prices or {}

    def close_for(symbol, day):
        return prices.get(symbol, {}).get(day)

    return holdings.replay(holdings.normalise(transactions, list(splits), close_for))


def test_ten_units_at_a_hundred_have_no_gain():
    state = _run([_trade("AAPL", "2024-01-02", "BUY", 10.0, 1000.0)])

    assert state["AAPL"] == {
        "units": 10.0,
        "cost_basis": 1000.0,
        "average_cost": 100.0,
        "realized": 0.0,
        "unit_steps": (["2024-01-02"], [10.0]),
    }


def test_a_ten_for_one_split_scales_units_and_cost_per_unit():
    state = _run(
        [_trade("NVDA", "2024-06-06", "BUY", 2.0, 1000.0)],
        [_split("NVDA", "2024-06-10", 10, 1)],
    )["NVDA"]

    assert state["units"] == 20.0
    assert state["cost_basis"] == 1000.0
    assert state["average_cost"] == 50.0
    assert state["realized"] == 0.0
    assert state["unit_steps"] == (["2024-06-06", "2024-06-10"], [2.0, 20.0])


def test_a_reverse_split_shrinks_units_and_keeps_cost_basis():
    state = _run(
        [_trade("XYZ", "2024-01-02", "BUY", 2.0, 200.0)],
        [_split("XYZ", "2024-02-01", 1, 10)],
    )["XYZ"]

    assert state["units"] == pytest.approx(0.2)
    assert state["cost_basis"] == 200.0
    assert state["average_cost"] == pytest.approx(1000.0)


def test_a_partial_sell_uses_the_average_cost_at_that_moment():
    state = _run(
        [
            _trade("AAPL", "2024-01-02", "BUY", 10.0, 1000.0),
            _trade("AAPL", "2024-02-01", "BUY", 10.0, 2000.0),
            _trade("AAPL", "2024-03-01", "SELL", 5.0, 1000.0),
        ]
    )["AAPL"]

    assert state["units"] == 15.0
    assert state["cost_basis"] == 2250.0
    assert state["average_cost"] == 150.0
    assert state["realized"] == 250.0
    assert state["unit_steps"] == (
        ["2024-01-02", "2024-02-01", "2024-03-01"],
        [10.0, 20.0, 15.0],
    )


def test_a_split_between_a_buy_and_a_sell_scales_the_sold_share_count():
    # The brief's stated cost figures assume a $200 average cost. On these
    # inputs the split leaves a $10 average, so five sold shares remove $50.
    state = _run(
        [
            _trade("XYZ", "2024-01-02", "BUY", 2.0, 200.0),
            _trade("XYZ", "2024-03-01", "SELL", 5.0, 1000.0),
        ],
        [_split("XYZ", "2024-02-01", 10, 1)],
    )["XYZ"]

    assert state["units"] == 15.0
    assert state["realized"] == 950.0
    assert state["cost_basis"] == 150.0
    assert state["average_cost"] == 10.0


def test_a_split_and_a_buy_on_the_same_date_apply_the_split_first():
    state = _run(
        [
            _trade("XYZ", "2024-01-02", "BUY", 2.0, 200.0),
            _trade("XYZ", "2024-02-01", "BUY", 3.0, 300.0),
        ],
        [_split("XYZ", "2024-02-01", 10, 1)],
    )["XYZ"]

    assert state["units"] == 23.0
    assert state["cost_basis"] == 500.0


def test_a_split_for_a_symbol_with_no_holding_is_a_no_op():
    state = _run([], [_split("AAPL", "2024-06-10", 10, 1)])

    assert state == {}


def test_empty_input_returns_an_empty_dict():
    assert _run([]) == {}


def test_a_legacy_row_derives_units_from_the_close():
    state = _run(
        [_legacy("AAPL", "2024-01-02", "BUY", 500.0)],
        prices={"AAPL": {"2024-01-02": 50.0}},
    )["AAPL"]

    assert state["units"] == 10.0
    assert state["cost_basis"] == 500.0
    assert state["average_cost"] == 50.0


def test_a_legacy_row_without_a_close_is_dropped():
    assert _run([_legacy("AAPL", "2024-01-02", "BUY", 500.0)]) == {}


def test_a_dividend_row_is_ignored():
    assert _run([_trade("AAPL", "2024-01-02", "DIVIDEND", 0.0, 25.0)]) == {}


def test_an_oversized_sell_clamps_units_at_zero_and_resets_cost():
    state = _run(
        [
            _trade("AAPL", "2024-01-02", "BUY", 10.0, 1000.0),
            _trade("AAPL", "2024-02-01", "SELL", 15.0, 1800.0),
        ]
    )["AAPL"]

    assert state["units"] == 0.0
    assert state["cost_basis"] == 0.0
    assert state["average_cost"] is None
    assert state["realized"] == 800.0
    assert state["unit_steps"] == (["2024-01-02", "2024-02-01"], [10.0, 0.0])


def test_split_product_defaults_to_one_and_multiplies_matching_splits():
    splits = [
        _split("AAPL", "2024-01-10", 2, 1),
        _split("AAPL", "2024-06-10", 3, 1),
        _split("MSFT", "2024-06-10", 5, 1),
        _split("AAPL", "2023-12-31", 10, 1),
    ]

    assert holdings.split_product([], "AAPL", "2024-01-01", "2024-12-31") == 1.0
    assert holdings.split_product(splits, "AAPL", "2024-01-01", "2024-12-31") == 6.0
    assert holdings.split_product(splits, "AAPL", "2023-12-31", "2024-01-10") == 2.0
