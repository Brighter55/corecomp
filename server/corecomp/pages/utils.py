import requests
from rest_framework.response import Response
from rest_framework import status


def fetchAlphaVantage(url):
    response = requests.get(url)
    data = response.json()

    # check if alphavatage api returns an error
    if "Note" in data or "Information" in data:
        return Response(
            {"error": "rate limit issue"},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
            headers={"Retry-After":  "60000"}
        )
    if "Error Message" in data:
        return Response(
            {"error": "invalid api call issue"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    return data

def annotate_profit_margin(data):
    annual_reports = data["annualReports"]
    quarterly_reports = data["quarterlyReports"]
    
    # profitMarginPercent = (net income / revenue) * 100
    for report in annual_reports:
        report["profitMarginPercent"] = round((int(report["netIncome"]) / int(report["totalRevenue"])) * 100, 2)
    
    for report in quarterly_reports:
        report["profitMarginPercent"] = round((int(report["netIncome"]) / int(report["totalRevenue"])) * 100, 2)
    
    return data



