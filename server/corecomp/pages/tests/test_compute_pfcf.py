from pages.utils import compute_pfcf


def test_compute_pfcf():
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
            {
                "fiscalDateEnding": "2024-03-31",
                "commonStockSharesOutstanding": "96",
            },
            {
                "fiscalDateEnding": "2023-12-31",
                "commonStockSharesOutstanding": "98",
            },
        ],
    }

    cash_flow = {
        "annualReports": [
            {
                "fiscalDateEnding": "2024-12-31",
                "freeCashFlow": "3000",
            },
            {
                "fiscalDateEnding": "2023-12-31",
                "freeCashFlow": "2500",
            },
        ],
        "quarterlyReports": [
            {
                "fiscalDateEnding": "2024-09-30",
                "freeCashFlow": "1200",
            },
            {
                "fiscalDateEnding": "2024-06-30",
                "freeCashFlow": "1000",
            },
            {
                "fiscalDateEnding": "2024-03-31",
                "freeCashFlow": "900",
            },
            {
                "fiscalDateEnding": "2023-12-31",
                "freeCashFlow": "800",
            },
        ],
    }

    pricing = [
        {"date": "2024-12-20", "close": "245.58"},
        {"date": "2024-09-30", "close": "230.00"},
        {"date": "2024-06-15", "close": "220.00"},
        {"date": "2024-03-31", "close": "215.00"},
        {"date": "2023-12-15", "close": "200.00"},
    ]

    expected = {
        "annualReports": [
            {
                "fiscalDateEnding": "2024-12-31",
                "PFCFRatio": "8.19",
            },
            {
                "fiscalDateEnding": "2023-12-31",
                "PFCFRatio": "10.0",
            },
        ],
        "quarterlyReports": [
            {
                "fiscalDateEnding": "2024-09-30",
                "PFCFRatio": "5.31",
            },
        ],
    }

    assert compute_pfcf(pricing, cash_flow, balance_sheet) == expected


def test_missing_data_and_non_positive_fcf_returns_none():
    pricing = [
        {"date": "2024-12-31", "close": "245.58"},
        {"date": "2024-09-30", "close": "230.00"},
        {"date": "2024-06-30", "close": "220.00"},
        {"date": "2024-03-31", "close": "210.00"},
        {"date": "2023-12-31", "close": "200.00"},
    ]

    balance_sheet = {
        "annualReports": [
            {
                "fiscalDateEnding": "2024-12-31",
                "commonStockSharesOutstanding": "None",
            }
        ],
        "quarterlyReports": [
            {
                "fiscalDateEnding": "2024-12-31",
                "commonStockSharesOutstanding": "100",
            },
            {
                "fiscalDateEnding": "2024-09-30",
                "commonStockSharesOutstanding": "100",
            },
            {
                "fiscalDateEnding": "2024-06-30",
                "commonStockSharesOutstanding": "100",
            },
            {
                "fiscalDateEnding": "2024-03-31",
                "commonStockSharesOutstanding": "100",
            },
            {
                "fiscalDateEnding": "2023-12-31",
                "commonStockSharesOutstanding": "100",
            },
        ],
    }

    cash_flow = {
        "annualReports": [
            {
                "fiscalDateEnding": "2024-12-31",
                "freeCashFlow": "1000",
            }
        ],
        "quarterlyReports": [
            {
                "fiscalDateEnding": "2024-12-31",
                "freeCashFlow": "0",
            },
            {
                "fiscalDateEnding": "2024-09-30",
                "freeCashFlow": "-10",
            },
            {
                "fiscalDateEnding": "2024-06-30",
                "freeCashFlow": "200",
            },
            {
                "fiscalDateEnding": "2024-03-31",
                "freeCashFlow": "100",
            },
            {
                "fiscalDateEnding": "2023-12-31",
                "freeCashFlow": "-1000",
            },
        ],
    }

    result = compute_pfcf(pricing, cash_flow, balance_sheet)

    assert result == {
        "annualReports": [{"fiscalDateEnding": "2024-12-31", "PFCFRatio": None}],
        "quarterlyReports": [
            {"fiscalDateEnding": "2024-12-31", "PFCFRatio": "84.68"},
            {"fiscalDateEnding": "2024-09-30", "PFCFRatio": None}
        ],
    }


def test_quarterly_excludes_last_three_points_without_ttm_window():
    pricing = [
        {"date": "2024-12-31", "close": "245.58"},
        {"date": "2024-09-30", "close": "230.00"},
        {"date": "2024-06-30", "close": "220.00"},
        {"date": "2024-03-31", "close": "210.00"},
    ]

    balance_sheet = {
        "annualReports": [],
        "quarterlyReports": [
            {
                "fiscalDateEnding": "2024-12-31",
                "commonStockSharesOutstanding": "100",
            },
            {
                "fiscalDateEnding": "2024-09-30",
                "commonStockSharesOutstanding": "100",
            },
            {
                "fiscalDateEnding": "2024-06-30",
                "commonStockSharesOutstanding": "100",
            },
        ],
    }

    cash_flow = {
        "annualReports": [],
        "quarterlyReports": [
            {
                "fiscalDateEnding": "2024-12-31",
                "freeCashFlow": "300",
            },
            {
                "fiscalDateEnding": "2024-09-30",
                "freeCashFlow": "250",
            },
            {
                "fiscalDateEnding": "2024-06-30",
                "freeCashFlow": "200",
            },
        ],
    }

    result = compute_pfcf(pricing, cash_flow, balance_sheet)

    assert result == {
        "annualReports": [],
        "quarterlyReports": [],
    }


def test_alignment_pricing():
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

    cash_flow = {
        "annualReports": [
            {
                "fiscalDateEnding": "2024-12-31",
                "freeCashFlow": "1000",
            },
        ],
        "quarterlyReports": [
            {
                "fiscalDateEnding": "2024-09-30",
                "freeCashFlow": "500",
            },
        ],
    }

    pricing = [
        {"date": "2026-01-16", "close": "300.00"},
        {"date": "2025-12-31", "close": "280.00"},
    ]

    expected = {
        "annualReports": [],
        "quarterlyReports": [],
    }

    assert compute_pfcf(pricing, cash_flow, balance_sheet) == expected

def test_alignment_balance_sheet():
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
                "commonStockSharesOutstanding": "90",
            },
            {
                "fiscalDateEnding": "2024-06-30",
                "commonStockSharesOutstanding": "95",
            },
            {
                "fiscalDateEnding": "2024-03-31",
                "commonStockSharesOutstanding": "96",
            },
        ],
    }

    cash_flow = {
        "annualReports": [
            {
                "fiscalDateEnding": "2024-12-31",
                "freeCashFlow": "3000",
            },
            {
                "fiscalDateEnding": "2023-12-31",
                "freeCashFlow": "2500",
            },
        ],
        "quarterlyReports": [
            {
                "fiscalDateEnding": "2024-09-30",
                "freeCashFlow": "1200",
            },
            {
                "fiscalDateEnding": "2024-06-30",
                "freeCashFlow": "1000",
            },
            {
                "fiscalDateEnding": "2024-03-31",
                "freeCashFlow": "900",
            },
            {
                "fiscalDateEnding": "2023-12-31",
                "freeCashFlow": "800",
            },
        ],
    }

    pricing = [
        {"date": "2024-12-20", "close": "245.58"},
        {"date": "2024-09-30", "close": "230.00"},
        {"date": "2024-06-15", "close": "220.00"},
        {"date": "2024-03-31", "close": "215.00"},
        {"date": "2023-12-15", "close": "200.00"},
    ]

    expected = {
        "annualReports": [
            {
                "fiscalDateEnding": "2024-12-31",
                "PFCFRatio": "8.19",
            },
        ],
        "quarterlyReports": [
            {
                "fiscalDateEnding": "2024-09-30",
                "PFCFRatio": "5.31",
            },
        ],
    }

    assert compute_pfcf(pricing, cash_flow, balance_sheet) == expected

def test_alignment_cash_flow():
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
            {
                "fiscalDateEnding": "2024-03-31",
                "commonStockSharesOutstanding": "96",
            },
            {
                "fiscalDateEnding": "2023-12-31",
                "commonStockSharesOutstanding": "98",
            },
        ],
    }

    cash_flow = {
        "annualReports": [
            {
                "fiscalDateEnding": "2024-12-31",
                "freeCashFlow": "3000",
            },
        ],
        "quarterlyReports": [
            {
                "fiscalDateEnding": "2024-09-30",
                "freeCashFlow": "1200",
            },
            {
                "fiscalDateEnding": "2024-06-30",
                "freeCashFlow": "1000",
            },
            {
                "fiscalDateEnding": "2024-03-31",
                "freeCashFlow": "900",
            },
        ],
    }

    pricing = [
        {"date": "2024-12-20", "close": "245.58"},
        {"date": "2024-09-30", "close": "230.00"},
        {"date": "2024-06-15", "close": "220.00"},
        {"date": "2024-03-31", "close": "215.00"},
        {"date": "2023-12-15", "close": "200.00"},
    ]

    expected = {
        "annualReports": [
            {
                "fiscalDateEnding": "2024-12-31",
                "PFCFRatio": "8.19",
            },
            {
                "fiscalDateEnding": "2023-12-31",
                "PFCFRatio": None,
            },
        ],
        "quarterlyReports": [],
    }

    assert compute_pfcf(pricing, cash_flow, balance_sheet) == expected

def test_empty_data():
    pricing = []
    cash_flow = {}
    balance_sheet = {}

    expected = {
        "annualReports": [],
        "quarterlyReports": [],
    }

    assert compute_pfcf(pricing, cash_flow, balance_sheet) == expected
