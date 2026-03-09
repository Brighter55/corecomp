from pages.utils import annotate_profit_margin

data = {
    "annualReports": [
        {
            "totalRevenue": "62753000000",
            "netIncome": "6023000000"
        },
        {
            "totalRevenue": "None",
            "netIncome": "6023000000"
        },
        {
            "totalRevenue": "None",
            "netIncome": "None"
        }
    ],
    "quarterlyReports": [
        {
            "totalRevenue": "62753000000",
            "netIncome": "6023000000"
        },
        {
            "totalRevenue": "None",
            "netIncome": "6023000000"
        },
        {
            "totalRevenue": "None",
            "netIncome": "None"
        }
    ]
}

def test_annotate_profit_margin():
    tested_data = annotate_profit_margin(data)
    assert tested_data["annualReports"][0]["profitMarginPercent"] == 9.60
    assert tested_data["quarterlyReports"][0]["profitMarginPercent"] == 9.60
    assert tested_data["annualReports"][1]["profitMarginPercent"] == None
    assert tested_data["quarterlyReports"][1]["profitMarginPercent"] == None
    assert tested_data["annualReports"][2]["profitMarginPercent"] == None
    assert tested_data["quarterlyReports"][2]["profitMarginPercent"] == None