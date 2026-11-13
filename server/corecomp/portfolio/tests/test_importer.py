from decimal import Decimal
from pathlib import Path

from portfolio.importer import parse_activity

FIXTURE = Path(__file__).resolve().parent / "fixtures" / "robinhood_activity.csv"
HEADER = (
    "Activity Date,Process Date,Settle Date,Instrument,Description,"
    "Trans Code,Quantity,Price,Amount\n"
)


def fixture_result():
    return parse_activity(FIXTURE.read_text(encoding="utf-8"))


def test_fixture_maps_to_per_kind_counts_and_skips_noise():
    result = fixture_result()

    assert result.counts == {
        "BUY": 5,
        "SELL": 1,
        "DIVIDEND": 1,
        "DTAX": 1,
        "REC": 1,
        "SPL": 1,
    }
    assert result.skipped == 4
    assert len(result.rows) == 9


def test_split_on_two_shares_adding_eighteen_becomes_ten_to_one():
    result = fixture_result()

    assert result.splits == [
        {
            "symbol": "SPLT",
            "effective_date": "2024-01-20",
            "numerator": 10,
            "denominator": 1,
        }
    ]
    assert result.unresolved_splits == []


def test_receipt_is_a_zero_cost_buy():
    result = fixture_result()

    receipts = [
        row
        for row in result.rows
        if row["symbol"] == "ACME" and row["trade_date"] == "2024-02-01"
    ]

    assert receipts == [
        {
            "symbol": "ACME",
            "trade_date": "2024-02-01",
            "kind": "BUY",
            "amount": Decimal("0"),
            "shares": Decimal("1.25"),
            "price": Decimal("0"),
        }
    ]


def test_preview_positions_apply_the_split_and_close_the_sold_symbol():
    result = fixture_result()

    assert result.positions == {
        "ACME": 13.75,
        "FICT": 0.0,
        "SPLT": 20.0,
        "MULTI": 3.0,
    }


def test_fractional_buy_keeps_its_shares_and_dollar_amount():
    result = fixture_result()

    buy = result.rows[0]

    assert buy == {
        "symbol": "ACME",
        "trade_date": "2024-01-02",
        "kind": "BUY",
        "amount": Decimal("1050.00"),
        "shares": Decimal("10.5"),
        "price": Decimal("100.00"),
    }


def test_amount_is_taken_verbatim_even_when_it_differs_by_a_cent():
    result = fixture_result()

    buy = result.rows[1]

    assert buy["shares"] == Decimal("2")
    assert buy["price"] == Decimal("50.00")
    assert buy["amount"] == Decimal("100.01")


def test_multiline_instrument_reduces_to_its_first_line():
    result = fixture_result()

    multi = [row for row in result.rows if row["symbol"] == "MULTI"]

    assert len(multi) == 1
    assert multi[0]["shares"] == Decimal("3")


def test_parentheses_and_commas_are_parsed_and_negatives_are_made_positive():
    text = HEADER + (
        '1/2/2024,1/2/2024,1/2/2024,ACME,ACME CORP,Buy,10,"$1,000.00","($1,234.56)"\n'
    )

    result = parse_activity(text)

    assert result.rows == [
        {
            "symbol": "ACME",
            "trade_date": "2024-01-02",
            "kind": "BUY",
            "amount": Decimal("1234.56"),
            "shares": Decimal("10"),
            "price": Decimal("1000.00"),
        }
    ]


def test_a_split_with_no_held_position_is_reported_and_not_imported():
    text = HEADER + "1/5/2024,1/5/2024,1/5/2024,GHOST,GHOST CORP,SPL,18,,$0.00\n"

    result = parse_activity(text)

    assert result.splits == []
    assert result.counts["SPL"] == 0
    assert result.unresolved_splits == [
        {"symbol": "GHOST", "trade_date": "2024-01-05", "shares": Decimal("18")}
    ]
    assert result.rows == []


def test_a_split_uses_the_position_on_its_date_not_the_file_order():
    # Robinhood writes newest first, so the rows above the split are the ones
    # after it. Reading the held position from file order would see the sale
    # and find nothing to split.
    text = HEADER + (
        '"3/1/2024","3/1/2024","3/1/2024","XYZ","XYZ Corp","Sell","5","$40.00","$200.00"\n'
        '"2/15/2024","2/15/2024","2/15/2024","XYZ","XYZ Corp Stock Split",'
        '"SPL","18","",""\n'
        '"1/2/2024","1/2/2024","1/2/2024","XYZ","XYZ Corp","Buy","2","$100.00",'
        '"($200.00)"\n'
    )

    result = parse_activity(text)

    assert result.unresolved_splits == []
    assert result.splits == [
        {
            "symbol": "XYZ",
            "effective_date": "2024-02-15",
            "numerator": 10,
            "denominator": 1,
        }
    ]
    assert result.positions == {"XYZ": 15.0}
