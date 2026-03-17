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

def safe_float(value):
    # return None if value is "None"
    if value is None or value.strip().lower() in ("none", ""):
        return None
    return float(value)

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
            continue
        
        net_income = safe_int(income_report["netIncome"])

        if net_income is None or current_equity is None or previous_equity is None:
            annual_roe.append({
                "fiscalDateEnding": current_date,
                "ROEPercentage": None
            })
            continue

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
            continue
        
        net_income = safe_int(income_report["netIncome"])
        
        if net_income is None or current_equity is None or previous_equity is None:
            quarterly_roe.append({
                "fiscalDateEnding": current_date,
                "ROEPercentage": None
            })
            continue

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

def compute_pe(pricing, earnings):
    # must return a dict of annualReports and quarterlyReports. each report must be a list of dict containing fiscalDateEnding and PERatio
    
    from datetime import datetime
    from collections import deque
    
    # Build a lookup for pricing data by year-month
    pricing_data = pricing.get("Monthly Adjusted Time Series", {})
    pricing_by_year_month = {}
    
    for date_str in pricing_data:
        try:
            date_obj = datetime.strptime(date_str, "%Y-%m-%d")
            year_month = date_obj.strftime("%Y-%m")
            price = safe_float(pricing_data[date_str]["5. adjusted close"])
            
            if year_month not in pricing_by_year_month:
                pricing_by_year_month[year_month] = price
        except (ValueError, KeyError):
            continue
    
    annual_pe = []
    quarterly_pe = []

    pricing_months = set(pricing_by_year_month.keys())

    def in_pricing_range(fiscal_date_str):
        try:
            year_month = datetime.strptime(fiscal_date_str, "%Y-%m-%d").strftime("%Y-%m")
            return year_month in pricing_months
        except ValueError:
            return False
    
    # Process annual earnings
    annual_earnings = [r for r in earnings.get("annualEarnings", []) if in_pricing_range(r["fiscalDateEnding"])]
    for report in annual_earnings:
        fiscal_date = report["fiscalDateEnding"]
        eps = safe_float(report.get("reportedEPS"))
        # let the report has None value if the earning has None data
        if eps is None:
            annual_pe.append({
                "fiscalDateEnding": fiscal_date,
                "PERatio": None
            })
            continue
        
        try:
            date_obj = datetime.strptime(fiscal_date, "%Y-%m-%d")
            year_month = date_obj.strftime("%Y-%m")
            
            # only appends to pe_ratio if year_month from earnings statement matches year_month in pricing statement
            if year_month in pricing_by_year_month:
                price = pricing_by_year_month[year_month]
                pe_ratio = price / eps
                annual_pe.append({
                    "fiscalDateEnding": fiscal_date,
                    "PERatio": round(pe_ratio, 2)
                })
            else:
                annual_pe.append({
                    "fiscalDateEnding": fiscal_date,
                    "PERatio": None
                })
        except (ValueError, ZeroDivisionError):
            annual_pe.append({
                "fiscalDateEnding": fiscal_date,
                "PERatio": None
            })
    
    # Process quarterly earnings using TTM (trailing twelve months = sum of last 4 quarters)
    quarterly_earnings = earnings.get("quarterlyEarnings", [])
    
    # reverse data to prepare for rolling window procedure
    chronological = list(reversed(quarterly_earnings))
    ttm_window = deque(maxlen=4)
    
    # build ttm earnings statement
    ttm_by_date = {}
    for report in chronological:
        eps = safe_float(report.get("reportedEPS"))
        # Use 0 for None so the window keeps rolling, but flag if any quarter in window was None
        ttm_window.append(eps if eps is not None else 0) # will only append eps or 0
        
        if len(ttm_window) == 4: # [0,0,4, 5]
            # Only produce a TTM value if all 4 quarters had valid EPS
            if all(safe_float(q.get("reportedEPS")) is not None for q in chronological[chronological.index(report) - 3: chronological.index(report) + 1]):
                ttm_by_date[report["fiscalDateEnding"]] = sum(ttm_window)
            else:
                ttm_by_date[report["fiscalDateEnding"]] = None
    # build quarterly_pe
    for report in quarterly_earnings:
        fiscal_date = report["fiscalDateEnding"]

        if fiscal_date not in ttm_by_date:
            continue

        ttm_eps = ttm_by_date[fiscal_date]
        
        if ttm_eps is None:
            quarterly_pe.append({
                "fiscalDateEnding": fiscal_date,
                "PERatio": None
            })
            continue
        
        try:
            date_obj = datetime.strptime(fiscal_date, "%Y-%m-%d")
            year_month = date_obj.strftime("%Y-%m")
            
            if year_month in pricing_by_year_month:
                price = pricing_by_year_month[year_month]
                pe_ratio = price / ttm_eps
                quarterly_pe.append({
                    "fiscalDateEnding": fiscal_date,
                    "PERatio": round(pe_ratio, 2)
                })
            else:
                continue
        except (ValueError, ZeroDivisionError):
            quarterly_pe.append({
                "fiscalDateEnding": fiscal_date,
                "PERatio": None
            })
    
    return {
        "annualReports": annual_pe,
        "quarterlyReports": quarterly_pe
    }


