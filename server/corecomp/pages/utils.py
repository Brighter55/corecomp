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

def safe_int(value):
    # return None if value is "None"
    if value is None or value.strip().lower() in ("none", ""):
        return None
    return int(value)

def annotate_profit_margin(data):
    annual_reports = data["annualReports"]
    quarterly_reports = data["quarterlyReports"]
    
    # profitMarginPercent = (net income / revenue) * 100
    for report in annual_reports:
        net_income = safe_int(report["netIncome"])
        total_revenue = safe_int(report["totalRevenue"])
        
        if net_income is None or total_revenue is None:
            report["profitMarginPercent"] = None
        else:
            report["profitMarginPercent"] = round((net_income / total_revenue) * 100, 2)
    
    for report in quarterly_reports:
        net_income = safe_int(report["netIncome"])
        total_revenue = safe_int(report["totalRevenue"])

        if net_income is None or total_revenue is None:
            report["profitMarginPercent"] = None
        else:
            report["profitMarginPercent"] = round((net_income / total_revenue) * 100, 2)
    
    return data

def annotate_free_cash_flow(data):
    annual_reports = data["annualReports"]
    quarterly_reports = data["quarterlyReports"]

    # freeCashFlow = operatingCashFlow - CapitalExpenditures
    for report in annual_reports:
        operating = safe_int(report.get("operatingCashflow"))
        capex = safe_int(report.get("capitalExpenditures"))

        if operating is None or capex is None:
            report["freeCashFlow"] = None
        else:
            report["freeCashFlow"] = operating - capex

    for report in quarterly_reports:
        operating = safe_int(report.get("operatingCashflow"))
        capex = safe_int(report.get("capitalExpenditures"))

        if operating is None or capex is None:
            report["freeCashFlow"] = None
        else:
            report["freeCashFlow"] = operating - capex
    
    return data

def transform_pricing(data):
    records = data["Monthly Adjusted Time Series"]
    transformed_data = []
    for date in records:
        transformed_data.append({"date": date, "adjustedClose": round(float(records[date]["5. adjusted close"]), 2)})

    return transformed_data

def compute_roe(income_statement, balance_sheet):

    # Create lookup dictionaries for balance sheet equity by date
    bs_annual = {report["fiscalDateEnding"]: report for report in balance_sheet.get("annualReports", [])}
    bs_quarterly = {report["fiscalDateEnding"]: report for report in balance_sheet.get("quarterlyReports", [])}
    
    annual_roe = []
    quarterly_roe = []
    
    # Process annual reports
    annual_reports = income_statement.get("annualReports", [])
    for i, income_report in enumerate(annual_reports):
        current_date = income_report["fiscalDateEnding"]
        current_equity = safe_int(bs_annual.get(current_date, {}).get("totalShareholderEquity"))
        
        # Get previous year's equity
        if i + 1 < len(annual_reports):
            previous_date = annual_reports[i + 1]["fiscalDateEnding"]
            previous_equity = safe_int(bs_annual.get(previous_date, {}).get("totalShareholderEquity"))
        else:
            previous_equity = None
        
        net_income = safe_int(income_report["netIncome"])
        
        if net_income is not None and current_equity is not None and previous_equity is not None:
            avg_equity = (previous_equity + current_equity) / 2
            roe = (net_income / avg_equity) * 100
            annual_roe.append({
                "fiscalDateEnding": current_date,
                "ROEPercentage": round(roe, 2)
            })
    
    # Process quarterly reports
    quarterly_reports = income_statement.get("quarterlyReports", [])
    for i, income_report in enumerate(quarterly_reports):
        current_date = income_report["fiscalDateEnding"]
        current_equity = safe_int(bs_quarterly.get(current_date, {}).get("totalShareholderEquity"))
        
        # Get previous quarter's equity
        if i + 1 < len(quarterly_reports):
            previous_date = quarterly_reports[i + 1]["fiscalDateEnding"]
            previous_equity = safe_int(bs_quarterly.get(previous_date, {}).get("totalShareholderEquity"))
        else:
            previous_equity = None
        
        net_income = safe_int(income_report["netIncome"])
        
        if net_income is not None and current_equity is not None and previous_equity is not None:
            avg_equity = (previous_equity + current_equity) / 2
            roe = (net_income / avg_equity) * 100
            quarterly_roe.append({
                "fiscalDateEnding": current_date,
                "ROEPercentage": round(roe, 2)
            })
    
    return {
        "annualReports": annual_roe,
        "quarterlyReports": quarterly_roe
    }


