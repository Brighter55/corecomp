from pages.utils import annotate_free_cash_flow

data = {
    "annualReports": [
        {
            "operatingCashflow": "62753000000",
            "capitalExpenditures": "6023000000"
        },
    ],
    "quarterlyReports": [
        {
            "operatingCashflow": "62753000000",
            "capitalExpenditures": "6023000000"
        },
    ]
}

def test_annotate_free_cash_flow():
    tested_data = annotate_free_cash_flow(data)
    assert tested_data["annualReports"][0]["freeCashFlow"] == 56730000000
    assert tested_data["quarterlyReports"][0]["freeCashFlow"] == 56730000000