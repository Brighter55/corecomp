from pages.utils import compute_pe

pricing = [
    {"date": "2026-01-16", "adjustedClose": "300.0"},
    {"date": "2025-12-31", "adjustedClose": "250.0"},
    {"date": "2025-09-30", "adjustedClose": "200.0"},
    {"date": "2025-06-30", "adjustedClose": "150.0"},
    {"date": "2025-03-30", "adjustedClose": "100.0"},
    {"date": "2024-12-31", "adjustedClose": "50.0"},
]

def test_compute_pe():
    earnings = {
        "symbol": "IBM",
        "annualEarnings": [
            {
                "fiscalDateEnding": "2025-12-31",
                "reportedEPS": "20.00"
            },
            {
                "fiscalDateEnding": "2024-12-31",
                "reportedEPS": "10.00"
            },
        ],
        "quarterlyEarnings": [
            {
                "fiscalDateEnding": "2025-12-31",
                "reportedEPS": "5.00"
            },
            {
                "fiscalDateEnding": "2025-09-30",
                "reportedEPS": "4.00"
            },
            {
                "fiscalDateEnding": "2025-06-30",
                "reportedEPS": "3.00"
            },
            {
                "fiscalDateEnding": "2025-03-30",
                "reportedEPS": "2.00"
            },
            {
                "fiscalDateEnding": "2024-12-30",
                "reportedEPS": "1.00"
            },
        ]
    }

    result = {
        "annualReports": [
            {
                "fiscalDateEnding": "2025-12-31",
                "PERatio": "12.5"
            },
            {
                "fiscalDateEnding": "2024-12-31",
                "PERatio": "5.0"
            },
        ],
        "quarterlyReports": [
            {
                "fiscalDateEnding": "2025-12-31",
                "PERatio": "17.86"
            },
            {
                "fiscalDateEnding": "2025-09-30",
                "PERatio": "20.0"
            },
        ],
    }

    data = compute_pe(pricing, earnings)
    assert data == result

def test_missing_data_and_skip_reports_not_in_window():
    # test for when the report has "None" in reportedEPS
    earnings = {
        "symbol": "IBM",
        "annualEarnings": [
            {
                "fiscalDateEnding": "2025-12-31",
                "reportedEPS": "None"
            },
        ],
        "quarterlyEarnings": [
            {
                "fiscalDateEnding": "2025-09-30",
                "reportedEPS": "None"
            },
            {
                "fiscalDateEnding": "2025-06-30",
                "reportedEPS": "None"
            },
            {
                "fiscalDateEnding": "2025-03-30",
                "reportedEPS": "None"
            },
            {
                "fiscalDateEnding": "2024-12-30",
                "reportedEPS": "None"
            },

        ]
    }

    result = {
        "annualReports": [
            {
                "fiscalDateEnding": "2025-12-31",
                "PERatio": None
            },
        ],
        "quarterlyReports": [
            {
                "fiscalDateEnding": "2025-09-30",
                "PERatio": None
            },
        ],
    }

    data = compute_pe(pricing, earnings)
    assert data == result

def test_report_has_value_none():
    # test for when the report has "None" in reportedEPS
    
    earnings = {
        "symbol": "IBM",
        "annualEarnings": [
            {
                "fiscalDateEnding": "2025-12-31",
                "reportedEPS": None
            },
        ],
        "quarterlyEarnings": [
            {
                "fiscalDateEnding": "2025-12-30",
                "reportedEPS": "None"
            },
            {
                "fiscalDateEnding": "2025-09-30",
                "reportedEPS": "4.00"
            },
            {
                "fiscalDateEnding": "2025-06-30",
                "reportedEPS": "3.00"
            },
            {
                "fiscalDateEnding": "2025-03-30",
                "reportedEPS": "2.00"
            },
            {
                "fiscalDateEnding": "2024-12-30",
                "reportedEPS": "1.00"
            },
        ]
    }

    result = {
        "annualReports": [
            {
                "fiscalDateEnding": "2025-12-31",
                "PERatio": None
            },
        ],
        "quarterlyReports": [
            {
                "fiscalDateEnding": "2025-12-30",
                "PERatio": None
            },
            {
                "fiscalDateEnding": "2025-09-30",
                "PERatio": "20.0"
            },
        ],
    }

    data = compute_pe(pricing, earnings)
    assert data == result

def test_alignment():
    # Test that earnings records with dates outside the pricing data range are filtered out
    local_pricing = [
        {"date": "2026-01-16", "close": "300.0"},
        {"date": "2025-12-31", "close": "250.0"},
    ]
    
    earnings = {
        "symbol": "TEST",
        "annualEarnings": [
            {
                "fiscalDateEnding": "2025-12-31",
                "reportedEPS": "5.00"
            },
            {
                "fiscalDateEnding": "2024-12-31",  # filtered out
                "reportedEPS": "4.00"
            },
            {
                "fiscalDateEnding": "2023-12-31",  # filtered out
                "reportedEPS": "3.00"
            },
        ],
        "quarterlyEarnings": [
            {
                "fiscalDateEnding": "2025-12-31",
                "reportedEPS": "1.30"
            },
            {
                "fiscalDateEnding": "2025-09-30",  # filtered out
                "reportedEPS": "0.90"
            },
            {
                "fiscalDateEnding": "2025-06-30",  # filtered out
                "reportedEPS": "0.80"
            },
            {
                "fiscalDateEnding": "2025-03-30",  # filtered out
                "reportedEPS": "0.70"
            },
            {
                "fiscalDateEnding": "2024-12-30",   # filtered out
                "reportedEPS": "0.60"
            },
        ]
    }

    result = {
        "annualReports": [
            {
                "fiscalDateEnding": "2025-12-31",
                "PERatio": "50.0",
            },
        ],
        "quarterlyReports": [
            {
                "fiscalDateEnding": "2025-12-31",
                "PERatio": "67.57",
            },
        ],
    }
    
    data = compute_pe(local_pricing, earnings)

    assert data == result

def test_empty_data():
    pricing = {}
    
    earnings = {}
    
    result = {
        "annualReports": [],
        "quarterlyReports": [],
    }

    data = compute_pe(pricing, earnings)
    assert data == result


