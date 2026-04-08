from pages.utils import annotate_current_ratio


def test_annotate_current_ratio():
    data = {
        "annualReports": [
            {
                "totalCurrentAssets": "200",
                "totalCurrentLiabilities": "100",
            },
            {
                "totalCurrentAssets": "150",
                "totalCurrentLiabilities": "0",
            },
            {
                "totalCurrentAssets": "None",
                "totalCurrentLiabilities": "100",
            },
        ],
        "quarterlyReports": [
            {
                "totalCurrentAssets": "330",
                "totalCurrentLiabilities": "120",
            },
            {
                "totalCurrentAssets": "100",
                "totalCurrentLiabilities": "",
            },
            {
                "totalCurrentAssets": "50",
                "totalCurrentLiabilities": "None",
            },
        ],
    }

    tested_data = annotate_current_ratio(data)
    assert tested_data["annualReports"][0]["CurrentRatio"] == "2.0"
    assert tested_data["annualReports"][1]["CurrentRatio"] is None
    assert tested_data["annualReports"][2]["CurrentRatio"] is None

    assert tested_data["quarterlyReports"][0]["CurrentRatio"] == "2.75"
    assert tested_data["quarterlyReports"][1]["CurrentRatio"] is None
    assert tested_data["quarterlyReports"][2]["CurrentRatio"] is None