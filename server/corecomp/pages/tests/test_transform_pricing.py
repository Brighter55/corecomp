from pages.utils import transform_pricing


def test_transform_pricing():
    data = {
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
        }
    }
    transformed_data = [
        {"date": "2026-01-16", "adjustedClose": "305.67", "close": "305.67"},
        {"date": "2025-12-31", "adjustedClose": "296.21", "close": "296.21"},
    ]

    data = transform_pricing(data)
    assert data == transformed_data


