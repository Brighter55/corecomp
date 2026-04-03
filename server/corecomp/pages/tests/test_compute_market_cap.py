from pages.utils import compute_market_cap


def test_compute_market_cap():
    balance_sheet = {
        "annualReports": [
            {
                "fiscalDateEnding": "2024-12-31",
                "commonStockSharesOutstanding": "100",
            },
            {
                "fiscalDateEnding": "2023-12-31",
                "commonStockSharesOutstanding": "125",
            },
        ],
        "quarterlyReports": [
            {
                "fiscalDateEnding": "2024-09-30",
                "commonStockSharesOutstanding": "90",
            },
            {
                "fiscalDateEnding": "2024-06-30",
                "commonStockSharesOutstanding": "95",
            },
        ],
    }

    pricing = [
        {"date": "2024-12-20", "close": "245.58"},
        {"date": "2024-09-30", "close": "230.00"},
        {"date": "2024-06-15", "close": "220.00"},
        {"date": "2023-12-15", "close": "200.00"},
    ]

    result = {
        "annualReports": [
            {
                "fiscalDateEnding": "2024-12-31",
                "marketCap": "24558",
            },
            {
                "fiscalDateEnding": "2023-12-31",
                "marketCap": "25000",
            },
        ],
        "quarterlyReports": [
            {
                "fiscalDateEnding": "2024-09-30",
                "marketCap": "20700",
            },
            {
                "fiscalDateEnding": "2024-06-30",
                "marketCap": "20900",
            },
        ],
    }

    data = compute_market_cap(pricing, balance_sheet)
    assert data == result


def test_missing_data():
    pricing = [{"date": "2024-12-31", "close": "245.58"}]

    # Case 1: commonStockSharesOutstanding is missing
    balance_sheet_missing_shares = {
        "annualReports": [
            {
                "fiscalDateEnding": "2024-12-31",
                "commonStockSharesOutstanding": "None",
            }
        ],
        "quarterlyReports": [
            {
                "fiscalDateEnding": "2024-12-31",
                "commonStockSharesOutstanding": "None",
            }
        ],
    }
    result_missing_shares = {
        "annualReports": [{"fiscalDateEnding": "2024-12-31", "marketCap": None}],
        "quarterlyReports": [{"fiscalDateEnding": "2024-12-31", "marketCap": None}],
    }
    assert compute_market_cap(pricing, balance_sheet_missing_shares) == result_missing_shares


def test_alignment():
    # balance_sheet records are older than pricing months, so all records should be skipped.
    balance_sheet = {
        "annualReports": [
            {
                "fiscalDateEnding": "2024-12-31",
                "commonStockSharesOutstanding": "100",
            },
        ],
        "quarterlyReports": [
            {
                "fiscalDateEnding": "2024-09-30",
                "commonStockSharesOutstanding": "100",
            },
        ],
    }

    pricing = [
        {"date": "2026-01-16", "close": "300.00"},
        {"date": "2025-12-31", "close": "280.00"},
    ]

    result = {
        "annualReports": [],
        "quarterlyReports": [],
    }

    data = compute_market_cap(pricing, balance_sheet)
    assert data == result


def test_empty_data():
    pricing = []
    balance_sheet = {}

    result = {
        "annualReports": [],
        "quarterlyReports": [],
    }

    data = compute_market_cap(pricing, balance_sheet)
    assert data == result
