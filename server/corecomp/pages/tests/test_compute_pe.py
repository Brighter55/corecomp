from pages.utils import compute_pe

def test_compute_pe():
    pricing = {
        "Meta Data": {
            "1. Information": "Monthly Adjusted Prices and Volumes",
            "2. Symbol": "IBM",
            "3. Last Refreshed": "2026-01-16",
            "4. Time Zone": "US/Eastern"
        },
        "Monthly Adjusted Time Series": {
            "2026-01-16": {
                "1. open": "297.5600",
                "2. high": "312.8100",
                "3. low": "289.0000",
                "4. close": "305.6700",
                "5. adjusted close": "305.6700",
                "6. volume": "45209571",
                "7. dividend amount": "0.0000"
            },
            "2025-12-31": {
            "1. open": "306.5050",
            "2. high": "315.3454",
            "3. low": "295.7000",
            "4. close": "296.2100",
            "5. adjusted close": "296.2100",
            "6. volume": "78385471",
            "7. dividend amount": "0.0000"
            },
            "2025-09-30": {
            "1. open": "240.9000",
            "2. high": "288.8500",
            "3. low": "238.2500",
            "4. close": "282.1600",
            "5. adjusted close": "280.6349",
            "6. volume": "110277863",
            "7. dividend amount": "0.0000"
            },
            "2024-12-31": {
            "1. open": "240.9000",
            "2. high": "288.8500",
            "3. low": "238.2500",
            "4. close": "270.0000",
            "5. adjusted close": "270.6349",
            "6. volume": "110277863",
            "7. dividend amount": "0.0000"
            },
        }
    }
    
    earnings = {
        "symbol": "IBM",
        "annualEarnings": [
            {
                "fiscalDateEnding": "2025-12-31",
                "reportedEPS": "6.57"
            },
            {
                "fiscalDateEnding": "2024-12-31",
                "reportedEPS": "6.00"
            },
        ],
        "quarterlyEarnings": [
            {
                "fiscalDateEnding": "2025-12-31",
                "reportedEPS": "7.00"
            },
            {
                "fiscalDateEnding": "2025-09-30",
                "reportedEPS": "6.57"
            },
            {
                "fiscalDateEnding": "2025-06-30",
                "reportedEPS": "6.00"
            },
            {
                "fiscalDateEnding": "2025-03-30",
                "reportedEPS": "5.50"
            },
            {
                "fiscalDateEnding": "2024-12-30",
                "reportedEPS": "5.00"
            },
        ]
    }

    
    result = {
        "annualReports": [
            {
                "fiscalDateEnding": "2025-12-31",
                "PERatio": 45.09
            },
            {
                "fiscalDateEnding": "2024-12-31",
                "PERatio": 45.11
            },
        ],
        "quarterlyReports": [
            {
                "fiscalDateEnding": "2025-12-31",
                "PERatio": 11.82
            },
            {
                "fiscalDateEnding": "2025-09-30",
                "PERatio": 12.16
            },
        ],
    }

    data = compute_pe(pricing, earnings)
    assert data == result

def test_missing_data_and_skip_reports_not_in_window():
    # test for when the report has "None" in reportedEPS
    pricing = {
        "Meta Data": {
            "1. Information": "Monthly Adjusted Prices and Volumes",
            "2. Symbol": "IBM",
            "3. Last Refreshed": "2026-01-16",
            "4. Time Zone": "US/Eastern"
        },
        "Monthly Adjusted Time Series": {
            "2025-12-31": {
                "1. open": "306.5050",
                "2. high": "315.3454",
                "3. low": "295.7000",
                "4. close": "296.2100",
                "5. adjusted close": "296.2100",
                "6. volume": "78385471",
                "7. dividend amount": "0.0000"
            },
            "2025-09-30": {
                "1. open": "240.9000",
                "2. high": "288.8500",
                "3. low": "238.2500",
                "4. close": "282.1600",
                "5. adjusted close": "280.6349",
                "6. volume": "110277863",
                "7. dividend amount": "0.0000"
            },
        }
    }
    
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
    pricing = {
        "Meta Data": {
            "1. Information": "Monthly Adjusted Prices and Volumes",
            "2. Symbol": "IBM",
            "3. Last Refreshed": "2026-01-16",
            "4. Time Zone": "US/Eastern"
        },
        "Monthly Adjusted Time Series": {
            "2025-12-31": {
                "1. open": "306.5050",
                "2. high": "315.3454",
                "3. low": "295.7000",
                "4. close": "296.2100",
                "5. adjusted close": "296.2100",
                "6. volume": "78385471",
                "7. dividend amount": "0.0000"
            },
            "2025-09-30": {
                "1. open": "240.9000",
                "2. high": "288.8500",
                "3. low": "238.2500",
                "4. close": "282.1600",
                "5. adjusted close": "280.6349",
                "6. volume": "110277863",
                "7. dividend amount": "0.0000"
            },
        }
    }
    
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
                "reportedEPS": "6.57"
            },
            {
                "fiscalDateEnding": "2025-06-30",
                "reportedEPS": "6.00"
            },
            {
                "fiscalDateEnding": "2025-03-30",
                "reportedEPS": "5.50"
            },
            {
                "fiscalDateEnding": "2024-12-30",
                "reportedEPS": "5.00"
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
                "PERatio": 12.16
            },
        ],
    }

    data = compute_pe(pricing, earnings)
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


