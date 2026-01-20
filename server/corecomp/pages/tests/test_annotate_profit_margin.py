from pages.utils import annotate_profit_margin

data = {
    "annualReports": [
        {
            "totalRevenue": "62753000000",
            "netIncome": "6023000000"
        },
    ],
    "quarterlyReports": [
        {
            "totalRevenue": "62753000000",
            "netIncome": "6023000000"
        },
    ]
}

def test_annotate_profit_margin():
    tested_data = annotate_profit_margin(data)
    assert tested_data["annualReports"][0]["profitMarginPercent"] == 9.60
    assert tested_data["quarterlyReports"][0]["profitMarginPercent"] == 9.60