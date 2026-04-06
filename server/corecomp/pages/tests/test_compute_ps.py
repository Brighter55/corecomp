from pages.utils import compute_ps


def test_compute_ps():
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

    income_statement = {
        "annualReports": [
            {
                "fiscalDateEnding": "2024-12-31",
                "totalRevenue": "5000",
            },
            {
                "fiscalDateEnding": "2023-12-31",
                "totalRevenue": "4000",
            },
        ],
        "quarterlyReports": [
            {
                "fiscalDateEnding": "2024-09-30",
                "totalRevenue": "1200",
            },
            {
                "fiscalDateEnding": "2024-06-30",
                "totalRevenue": "1100",
            },
            {
                "fiscalDateEnding": "2024-03-31",
                "totalRevenue": "1000",
            },
            {
                "fiscalDateEnding": "2023-12-31",
                "totalRevenue": "900",
            },
        ],
    }

    pricing = [
        {"date": "2024-12-31", "close": "245.58"},
        {"date": "2024-09-30", "close": "230.00"},
        {"date": "2024-06-30", "close": "220.00"},
        {"date": "2024-03-31", "close": "215.00"},
        {"date": "2023-12-31", "close": "200.00"},
    ]

    expected = {
        "annualReports": [
            {
                "fiscalDateEnding": "2024-12-31",
                "PSRatio": "4.91",
            },
            {
                "fiscalDateEnding": "2023-12-31",
                "PSRatio": "6.25",
            },
        ],
        "quarterlyReports": [
            {
                "fiscalDateEnding": "2024-09-30",
                "PSRatio": "4.93",
            },
        ],
    }

    data = compute_ps(pricing, income_statement, balance_sheet)
    assert data == expected


def test_missing_data():
    pricing = [{"date": "2024-12-31", "close": "245.58"}]

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
                "commonStockSharesOutstanding": "None",
            }
        ],
    }

    income_statement = {
        "annualReports": [
            {
                "fiscalDateEnding": "2024-12-31",
                "totalRevenue": "1000",
            }
        ],
        "quarterlyReports": [
            {
                "fiscalDateEnding": "2024-12-31",
                "totalRevenue": "500",
            }
        ],
    }

    expected = {
        "annualReports": [{"fiscalDateEnding": "2024-12-31", "PSRatio": None}],
        "quarterlyReports": [],
    }

    assert compute_ps(pricing, income_statement, balance_sheet) == expected


def test_zero_revenue():
    pricing = [{"date": "2024-12-31", "close": "245.58"}]

    balance_sheet = {
        "annualReports": [
            {
                "fiscalDateEnding": "2024-12-31",
                "commonStockSharesOutstanding": "100",
            }
        ],
        "quarterlyReports": [],
    }

    income_statement = {
        "annualReports": [
            {
                "fiscalDateEnding": "2024-12-31",
                "totalRevenue": "0",
            }
        ],
        "quarterlyReports": [],
    }

    expected = {
        "annualReports": [{"fiscalDateEnding": "2024-12-31", "PSRatio": None}],
        "quarterlyReports": [],
    }

    assert compute_ps(pricing, income_statement, balance_sheet) == expected


def test_alignment():
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

    income_statement = {
        "annualReports": [
            {
                "fiscalDateEnding": "2024-12-31",
                "totalRevenue": "1000",
            },
        ],
        "quarterlyReports": [
            {
                "fiscalDateEnding": "2024-09-30",
                "totalRevenue": "500",
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

    data = compute_ps(pricing, income_statement, balance_sheet)
    assert data == expected


def test_quarterly_ttm_missing_revenue():
    pricing = [{"date": "2024-09-30", "close": "230.00"}]

    balance_sheet = {
        "annualReports": [],
        "quarterlyReports": [
            {
                "fiscalDateEnding": "2024-09-30",
                "commonStockSharesOutstanding": "90",
            }
        ],
    }

    income_statement = {
        "annualReports": [],
        "quarterlyReports": [
            {"fiscalDateEnding": "2024-09-30", "totalRevenue": "1200"},
            {"fiscalDateEnding": "2024-06-30", "totalRevenue": "1100"},
            {"fiscalDateEnding": "2024-03-31", "totalRevenue": "None"},
            {"fiscalDateEnding": "2023-12-31", "totalRevenue": "900"},
        ],
    }

    expected = {
        "annualReports": [],
        "quarterlyReports": [{"fiscalDateEnding": "2024-09-30", "PSRatio": None}],
    }

    assert compute_ps(pricing, income_statement, balance_sheet) == expected


def test_empty_data():
    pricing = []
    income_statement = {}
    balance_sheet = {}

    expected = {
        "annualReports": [],
        "quarterlyReports": [],
    }

    data = compute_ps(pricing, income_statement, balance_sheet)
    assert data == expected
