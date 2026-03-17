from pages.utils import compute_pe

pricing = {
    "Meta Data": {
        "1. Information": "Monthly Adjusted Prices and Volumes",
        "2. Symbol": "IBM",
        "3. Last Refreshed": "2026-01-16",
        "4. Time Zone": "US/Eastern"
    },
    "Monthly Adjusted Time Series": {
        "2026-01-16": {
            "5. adjusted close": "300.0000",
        },
        "2025-12-31": {
        "5. adjusted close": "250.0000",
        },
        "2025-09-30": {
        "5. adjusted close": "200.0000",
        },
        "2025-06-30": {
        "5. adjusted close": "150.0000",
        },
        "2025-03-30": {
        "5. adjusted close": "100.0000",
        },
        "2024-12-31": {
        "5. adjusted close": "50.0000",
        },
    }
}

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
                "PERatio": 12.5
            },
            {
                "fiscalDateEnding": "2024-12-31",
                "PERatio": 5.0
            },
        ],
        "quarterlyReports": [
            {
                "fiscalDateEnding": "2025-12-31",
                "PERatio": 17.86
            },
            {
                "fiscalDateEnding": "2025-09-30",
                "PERatio": 20.0
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
                "PERatio": 20.0
            },
        ],
    }

    data = compute_pe(pricing, earnings)
    assert data == result

def test_alignment():
    # Test that earnings records with dates outside the pricing data range are filtered out
    local_pricing = {
        "Meta Data": {
            "1. Information": "Monthly Adjusted Prices and Volumes",
            "2. Symbol": "TEST",
            "3. Last Refreshed": "2026-01-16",
            "4. Time Zone": "US/Eastern"
        },
        "Monthly Adjusted Time Series": {
            "2026-01-16": {
                "5. adjusted close": "300.0000",
            },
            "2025-12-31": {
                "5. adjusted close": "250.0000",
            },
        }
    }
    
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

    result = compute_pe(local_pricing, earnings)
    
    assert len(result["annualReports"]) == 1
    assert result["annualReports"][0]["fiscalDateEnding"] == "2025-12-31"
    assert result["annualReports"][0]["PERatio"] == 50.0
    
    assert len(result["quarterlyReports"]) == 1
    assert result["quarterlyReports"][0]["fiscalDateEnding"] == "2025-12-31"
    assert result["quarterlyReports"][0]["PERatio"] == 67.57

def test_empty_data():
    pricing = {}
    
    earnings = {}
    
    result = {
        "annualReports": [],
        "quarterlyReports": [],
    }

    data = compute_pe(pricing, earnings)
    assert data == result


