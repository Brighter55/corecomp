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

def annotate_free_cash_flow(data):
    annual_reports = data["annualReports"]
    quarterly_reports = data["quarterlyReports"]

    # freeCashFlow = operatingCashFlow - CapitalExpenditures
    for report in annual_reports:
        report["freeCashFlow"] = int(report["operatingCashflow"]) - int(report["capitalExpenditures"])
    for report in quarterly_reports:
        report["freeCashFlow"] = int(report["operatingCashflow"]) - int(report["capitalExpenditures"])
    
    return data

def transform_pricing(data):
    records = data["Monthly Adjusted Time Series"]
    transformed_data = []
    for date in records:
        transformed_data.append({"date": date, "adjustedClose": round(float(records[date]["5. adjusted close"]), 2)})

    return transformed_data

