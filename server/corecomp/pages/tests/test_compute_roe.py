from pages.utils import compute_roe

def test_compute_roe():
    income_statement = {
        "annualReports": [
            {
                "fiscalDateEnding": "2024-12-31",
                "netIncome": "100"
            },
            {
                "fiscalDateEnding": "2023-12-31",
                "netIncome": "-90"
            },
            {
                "fiscalDateEnding": "2022-12-31",
                "netIncome": "80"
            },
            {
                "fiscalDateEnding": "2021-12-31",
                "netIncome": "70"
            }
        ],
        "quarterlyReports": [
            {
                "fiscalDateEnding": "2024-12-31",
                "netIncome": "28"
            },
            {
                "fiscalDateEnding": "2024-09-30",
                "netIncome": "-24"
            },
            {
                "fiscalDateEnding": "2024-06-30",
                "netIncome": "25"
            },
            {
                "fiscalDateEnding": "2024-03-30",
                "netIncome": "20"
            }
        ]
    }
    
    balance_sheet = {
        "annualReports": [
            {
                "fiscalDateEnding": "2024-12-31",
                "totalShareholderEquity": "500"
            },
            {
                "fiscalDateEnding": "2023-12-31",
                "totalShareholderEquity": "450"
            },
            {
                "fiscalDateEnding": "2022-12-31",
                "totalShareholderEquity": "-400"
            },
            {
                "fiscalDateEnding": "2021-12-31",
                "totalShareholderEquity": "350"
            }
        ],
        "quarterlyReports": [
            {
                "fiscalDateEnding": "2024-12-31",
                "totalShareholderEquity": "510"
            },
            {
                "fiscalDateEnding": "2024-09-30",
                "totalShareholderEquity": "500"
            },
            {
                "fiscalDateEnding": "2024-06-30",
                "totalShareholderEquity": "-490"
            },
            {
                "fiscalDateEnding": "2024-03-30",
                "totalShareholderEquity": "480"
            }
        ]
    }
    
    result = {
        "annualReports": [
            {
                "fiscalDateEnding": "2024-12-31",
                "ROEPercentage": 21.05
            },
            {
                "fiscalDateEnding": "2023-12-31",
                "ROEPercentage": -360.0
            },
            {
                "fiscalDateEnding": "2022-12-31",
                "ROEPercentage": -320.0
            }
        ],
        "quarterlyReports": [
            {
                "fiscalDateEnding": "2024-12-31",
                "ROEPercentage": 5.54
            },
            {
                "fiscalDateEnding": "2024-09-30",
                "ROEPercentage": -480.0
            },
            {
                "fiscalDateEnding": "2024-06-30",
                "ROEPercentage": -500.0
            }
        ],
    }

    data = compute_roe(income_statement, balance_sheet)
    assert data == result

def test_missing_data():
    # test for when the report has "None" in netIncome or totalShareholderEquity
    income_statement = {
        "annualReports": [
            {
                "fiscalDateEnding": "2024-12-31",
                "netIncome": "None"
            },
            {
                "fiscalDateEnding": "2023-12-31",
                "netIncome": "100"
            },
            {
                "fiscalDateEnding": "2022-12-31",
                "netIncome": "50"
            },
        ],
        "quarterlyReports": [
            {
                "fiscalDateEnding": "2024-12-31",
                "netIncome": "None"
            },
            {
                "fiscalDateEnding": "2024-09-30",
                "netIncome": "25"
            },
            {
                "fiscalDateEnding": "2024-06-30",
                "netIncome": "15"
            },
        ]
    }
    
    balance_sheet = {
        "annualReports": [
            {
                "fiscalDateEnding": "2024-12-31",
                "totalShareholderEquity": "500"
            },
            {
                "fiscalDateEnding": "2023-12-31",
                "totalShareholderEquity": "None"
            },
            {
                "fiscalDateEnding": "2022-12-31",
                "totalShareholderEquity": "400"
            },
        ],
        "quarterlyReports": [
            {
                "fiscalDateEnding": "2024-12-31",
                "totalShareholderEquity": "510"
            },
            {
                "fiscalDateEnding": "2024-09-30",
                "totalShareholderEquity": "None"
            },
            {
                "fiscalDateEnding": "2024-06-30",
                "totalShareholderEquity": "490"
            },
        ]
    }
    
    result = {
        "annualReports": [
            {
                "fiscalDateEnding": "2024-12-31",
                "ROEPercentage": None
            },
            {
                "fiscalDateEnding": "2023-12-31",
                "ROEPercentage": None
            },
        ],
        "quarterlyReports": [
            {
                "fiscalDateEnding": "2024-12-31",
                "ROEPercentage": None
            },
            {
                "fiscalDateEnding": "2024-09-30",
                "ROEPercentage": None
            },
        ],
    }

    data = compute_roe(income_statement, balance_sheet)
    assert data == result

def test_misaligned_data_income_statement_behind():
    # income_statement is one data point behind balance_sheet in annual and quarterly reports
    income_statement = {
        "annualReports": [
            {
                "fiscalDateEnding": "2023-12-31",
                "netIncome": "100"
            },
            {
                "fiscalDateEnding": "2022-12-31",
                "netIncome": "80"
            },
            {
                "fiscalDateEnding": "2021-12-31",
                "netIncome": "70"
            }
        ],
        "quarterlyReports": [
            {
                "fiscalDateEnding": "2024-09-30",
                "netIncome": "25"
            },
            {
                "fiscalDateEnding": "2024-06-30",
                "netIncome": "20"
            },
            {
                "fiscalDateEnding": "2024-03-30",
                "netIncome": "15"
            }
        ]
    }
    
    balance_sheet = {
        "annualReports": [
            {
                "fiscalDateEnding": "2024-12-31",
                "totalShareholderEquity": "550"
            },
            {
                "fiscalDateEnding": "2023-12-31",
                "totalShareholderEquity": "500"
            },
            {
                "fiscalDateEnding": "2022-12-31",
                "totalShareholderEquity": "450"
            },
            {
                "fiscalDateEnding": "2021-12-31",
                "totalShareholderEquity": "400"
            }
        ],
        "quarterlyReports": [
            {
                "fiscalDateEnding": "2024-12-31",
                "totalShareholderEquity": "530"
            },
            {
                "fiscalDateEnding": "2024-09-30",
                "totalShareholderEquity": "510"
            },
            {
                "fiscalDateEnding": "2024-06-30",
                "totalShareholderEquity": "500"
            },
            {
                "fiscalDateEnding": "2024-03-30",
                "totalShareholderEquity": "490"
            }
        ]
    }
    
    result = {
        "annualReports": [
            {
                "fiscalDateEnding": "2023-12-31",
                "ROEPercentage": 21.05
            },
            {
                "fiscalDateEnding": "2022-12-31",
                "ROEPercentage": 18.82
            },
        ],
        "quarterlyReports": [
            {
                "fiscalDateEnding": "2024-09-30",
                "ROEPercentage": 4.95
            },
            {
                "fiscalDateEnding": "2024-06-30",
                "ROEPercentage": 4.04
            }
        ],
    }

    data = compute_roe(income_statement, balance_sheet)
    assert data == result

def test_misaligned_data_balance_sheet_behind():
    # balance_sheet is one data point behind income_statement in annual and quarterly reports
    income_statement = {
        "annualReports": [
            {
                "fiscalDateEnding": "2024-12-31",
                "netIncome": "120"
            },
            {
                "fiscalDateEnding": "2023-12-31",
                "netIncome": "100"
            },
            {
                "fiscalDateEnding": "2022-12-31",
                "netIncome": "80"
            },
            {
                "fiscalDateEnding": "2021-12-31",
                "netIncome": "70"
            }
        ],
        "quarterlyReports": [
            {
                "fiscalDateEnding": "2024-12-31",
                "netIncome": "32"
            },
            {
                "fiscalDateEnding": "2024-09-30",
                "netIncome": "25"
            },
            {
                "fiscalDateEnding": "2024-06-30",
                "netIncome": "20"
            },
            {
                "fiscalDateEnding": "2024-03-30",
                "netIncome": "15"
            }
        ]
    }
    
    balance_sheet = {
        "annualReports": [
            {
                "fiscalDateEnding": "2023-12-31",
                "totalShareholderEquity": "500"
            },
            {
                "fiscalDateEnding": "2022-12-31",
                "totalShareholderEquity": "450"
            },
            {
                "fiscalDateEnding": "2021-12-31",
                "totalShareholderEquity": "400"
            }
        ],
        "quarterlyReports": [
            {
                "fiscalDateEnding": "2024-09-30",
                "totalShareholderEquity": "510"
            },
            {
                "fiscalDateEnding": "2024-06-30",
                "totalShareholderEquity": "500"
            },
            {
                "fiscalDateEnding": "2024-03-30",
                "totalShareholderEquity": "490"
            }
        ]
    }
    
    result = {
        "annualReports": [
            {
                "fiscalDateEnding": "2023-12-31",
                "ROEPercentage": 21.05
            },
            {
                "fiscalDateEnding": "2022-12-31",
                "ROEPercentage": 18.82
            },
        ],
        "quarterlyReports": [
            {
                "fiscalDateEnding": "2024-09-30",
                "ROEPercentage": 4.95
            },
            {
                "fiscalDateEnding": "2024-06-30",
                "ROEPercentage": 4.04
            }
        ],
    }

    data = compute_roe(income_statement, balance_sheet)
    assert data == result

def test_empty_data():
    income_statement= {}
    
    balance_sheet = {}
    
    result = {
        "annualReports": [],
        "quarterlyReports": [],
    }

    data = compute_roe(income_statement, balance_sheet)
    assert data == result


