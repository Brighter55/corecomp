from pages.utils import annotate_quick_ratio


def test_annotate_quick_ratio():
    data = {
        "annualReports": [
            {
                "cashAndCashEquivalentsAtCarryingValue": "100",
                "shortTermInvestments": "50",
                "currentNetReceivables": "75",
                "totalCurrentLiabilities": "100",
            },
            {
                "cashAndCashEquivalentsAtCarryingValue": "None",
                "shortTermInvestments": "50",
                "currentNetReceivables": "75",
                "totalCurrentLiabilities": "100",
            },
            {
                "cashAndCashEquivalentsAtCarryingValue": "100",
                "shortTermInvestments": "50",
                "currentNetReceivables": "75",
                "totalCurrentLiabilities": "0",
            },
        ],
        "quarterlyReports": [
            {
                "cashAndCashEquivalentsAtCarryingValue": "200",
                "shortTermInvestments": "100",
                "currentNetReceivables": "150",
                "totalCurrentLiabilities": "175",
            },
            {
                "cashAndCashEquivalentsAtCarryingValue": "200",
                "shortTermInvestments": "",
                "currentNetReceivables": "150",
                "totalCurrentLiabilities": "175",
            },
            {
                "cashAndCashEquivalentsAtCarryingValue": "200",
                "shortTermInvestments": "100",
                "currentNetReceivables": "150",
                "totalCurrentLiabilities": "None",
            },
        ],
    }

    tested_data = annotate_quick_ratio(data)
    assert tested_data["annualReports"][0]["QuickRatio"] == "2.25"
    assert tested_data["annualReports"][1]["QuickRatio"] is None
    assert tested_data["annualReports"][2]["QuickRatio"] is None

    assert tested_data["quarterlyReports"][0]["QuickRatio"] == "2.57"
    assert tested_data["quarterlyReports"][1]["QuickRatio"] is None
    assert tested_data["quarterlyReports"][2]["QuickRatio"] is None
