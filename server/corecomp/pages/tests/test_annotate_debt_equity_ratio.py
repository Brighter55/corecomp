from pages.utils import annotate_debt_equity_ratio


def test_annotate_debt_equity_ratio():
    data = {
        "annualReports": [
            {
                "shortLongTermDebtTotal": "400",
                "totalShareholderEquity": "200",
            },
            {
                "shortLongTermDebtTotal": "None",
                "totalShareholderEquity": "150",
            },
            {
                "shortLongTermDebtTotal": "300",
                "totalShareholderEquity": "0",
            },
        ],
        "quarterlyReports": [
            {
                "shortLongTermDebtTotal": "375",
                "totalShareholderEquity": "125",
            },
            {
                "shortLongTermDebtTotal": "375",
                "totalShareholderEquity": "",
            },
            {
                "shortLongTermDebtTotal": "375",
                "totalShareholderEquity": "None",
            },
        ],
    }

    tested_data = annotate_debt_equity_ratio(data)
    assert tested_data["annualReports"][0]["DebtEquityRatio"] == "2.0"
    assert tested_data["annualReports"][1]["DebtEquityRatio"] is None
    assert tested_data["annualReports"][2]["DebtEquityRatio"] is None

    assert tested_data["quarterlyReports"][0]["DebtEquityRatio"] == "3.0"
    assert tested_data["quarterlyReports"][1]["DebtEquityRatio"] is None
    assert tested_data["quarterlyReports"][2]["DebtEquityRatio"] is None
