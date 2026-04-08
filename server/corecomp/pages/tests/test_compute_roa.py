from pages.utils import compute_roa


def test_compute_roa():
    income_statement = {
        "annualReports": [
            {
                "fiscalDateEnding": "2024-12-31",
                "netIncome": "100",
            },
            {
                "fiscalDateEnding": "2023-12-31",
                "netIncome": "90",
            },
        ],
        "quarterlyReports": [
            {
                "fiscalDateEnding": "2024-12-31",
                "netIncome": "30",
            },
            {
                "fiscalDateEnding": "2024-09-30",
                "netIncome": "25",
            },
            {
                "fiscalDateEnding": "2024-06-30",
                "netIncome": "20",
            },
            {
                "fiscalDateEnding": "2024-03-31",
                "netIncome": "15",
            },
        ],
    }

    balance_sheet = {
        "annualReports": [
            {
                "fiscalDateEnding": "2024-12-31",
                "totalAssets": "1000",
            },
            {
                "fiscalDateEnding": "2023-12-31",
                "totalAssets": "900",
            },
        ],
        "quarterlyReports": [
            {
                "fiscalDateEnding": "2024-12-31",
                "totalAssets": "500",
            },
            {
                "fiscalDateEnding": "2024-09-30",
                "totalAssets": "450",
            },
            {
                "fiscalDateEnding": "2024-06-30",
                "totalAssets": "420",
            },
            {
                "fiscalDateEnding": "2024-03-31",
                "totalAssets": "400",
            },
        ],
    }

    result = {
        "annualReports": [
            {
                "fiscalDateEnding": "2024-12-31",
                "ROAPercentage": "10.0",
            },
            {
                "fiscalDateEnding": "2023-12-31",
                "ROAPercentage": "10.0",
            },
        ],
        "quarterlyReports": [
            {
                "fiscalDateEnding": "2024-12-31",
                "ROAPercentage": "18.0",
            },
        ],
    }

    assert compute_roa(income_statement, balance_sheet) == result


def test_compute_roa_missing_data_returns_none():
    income_statement = {
        "annualReports": [
            {
                "fiscalDateEnding": "2024-12-31",
                "netIncome": "None",
            },
            {
                "fiscalDateEnding": "2023-12-31",
                "netIncome": "80",
            },
        ],
        "quarterlyReports": [
            {
                "fiscalDateEnding": "2024-12-31",
                "netIncome": "10",
            },
            {
                "fiscalDateEnding": "2024-09-30",
                "netIncome": "None",
            },
            {
                "fiscalDateEnding": "2024-06-30",
                "netIncome": "8",
            },
            {
                "fiscalDateEnding": "2024-03-31",
                "netIncome": "7",
            },
        ],
    }

    balance_sheet = {
        "annualReports": [
            {
                "fiscalDateEnding": "2024-12-31",
                "totalAssets": "1000",
            },
            {
                "fiscalDateEnding": "2023-12-31",
                "totalAssets": "None",
            },
        ],
        "quarterlyReports": [
            {
                "fiscalDateEnding": "2024-12-31",
                "totalAssets": "500",
            },
            {
                "fiscalDateEnding": "2024-09-30",
                "totalAssets": "450",
            },
            {
                "fiscalDateEnding": "2024-06-30",
                "totalAssets": "420",
            },
            {
                "fiscalDateEnding": "2024-03-31",
                "totalAssets": "400",
            },
        ],
    }

    assert compute_roa(income_statement, balance_sheet) == {
        "annualReports": [
            {
                "fiscalDateEnding": "2024-12-31",
                "ROAPercentage": None,
            },
            {
                "fiscalDateEnding": "2023-12-31",
                "ROAPercentage": None,
            },
        ],
        "quarterlyReports": [
            {
                "fiscalDateEnding": "2024-12-31",
                "ROAPercentage": None,
            },
        ],
    }


def test_compute_roa_quarterly_requires_ttm_window():
    income_statement = {
        "annualReports": [],
        "quarterlyReports": [
            {
                "fiscalDateEnding": "2024-12-31",
                "netIncome": "10",
            },
            {
                "fiscalDateEnding": "2024-09-30",
                "netIncome": "9",
            },
            {
                "fiscalDateEnding": "2024-06-30",
                "netIncome": "8",
            },
        ],
    }

    balance_sheet = {
        "annualReports": [],
        "quarterlyReports": [
            {
                "fiscalDateEnding": "2024-12-31",
                "totalAssets": "500",
            },
            {
                "fiscalDateEnding": "2024-09-30",
                "totalAssets": "450",
            },
            {
                "fiscalDateEnding": "2024-06-30",
                "totalAssets": "420",
            },
        ],
    }

    assert compute_roa(income_statement, balance_sheet) == {
        "annualReports": [],
        "quarterlyReports": [],
    }


def test_compute_roa_alignment_mismatch():
    income_statement = {
        "annualReports": [
            {
                "fiscalDateEnding": "2024-12-31",
                "netIncome": "100",
            }
        ],
        "quarterlyReports": [
            {
                "fiscalDateEnding": "2024-12-31",
                "netIncome": "30",
            },
            {
                "fiscalDateEnding": "2024-09-30",
                "netIncome": "25",
            },
            {
                "fiscalDateEnding": "2024-06-30",
                "netIncome": "20",
            },
            {
                "fiscalDateEnding": "2024-03-31",
                "netIncome": "15",
            },
        ],
    }

    balance_sheet = {
        "annualReports": [
            {
                "fiscalDateEnding": "2023-12-31",
                "totalAssets": "1000",
            }
        ],
        "quarterlyReports": [
            {
                "fiscalDateEnding": "2024-09-30",
                "totalAssets": "450",
            }
        ],
    }

    assert compute_roa(income_statement, balance_sheet) == {
        "annualReports": [],
        "quarterlyReports": [],
    }


def test_compute_roa_zero_assets_returns_none():
    income_statement = {
        "annualReports": [
            {
                "fiscalDateEnding": "2024-12-31",
                "netIncome": "100",
            }
        ],
        "quarterlyReports": [
            {
                "fiscalDateEnding": "2024-12-31",
                "netIncome": "30",
            },
            {
                "fiscalDateEnding": "2024-09-30",
                "netIncome": "25",
            },
            {
                "fiscalDateEnding": "2024-06-30",
                "netIncome": "20",
            },
            {
                "fiscalDateEnding": "2024-03-31",
                "netIncome": "15",
            },
        ],
    }

    balance_sheet = {
        "annualReports": [
            {
                "fiscalDateEnding": "2024-12-31",
                "totalAssets": "0",
            }
        ],
        "quarterlyReports": [
            {
                "fiscalDateEnding": "2024-12-31",
                "totalAssets": "0",
            }
        ],
    }

    assert compute_roa(income_statement, balance_sheet) == {
        "annualReports": [
            {
                "fiscalDateEnding": "2024-12-31",
                "ROAPercentage": None,
            }
        ],
        "quarterlyReports": [
            {
                "fiscalDateEnding": "2024-12-31",
                "ROAPercentage": None,
            }
        ],
    }

def test_empty_data():
    income_statement = {}
    balance_sheet = {}

    expected = {
        "annualReports": [],
        "quarterlyReports": [],
    }

    data = compute_roa(income_statement, balance_sheet)
    assert data == expected