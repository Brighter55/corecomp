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
    if value is None:
        return None

    if value.strip().lower() in ("none", ""):
        return None
    
    return int(value)

def safe_float(value):
    # return None if value is "None"
    if value is None:
        return None
    
    if value.strip().lower() in ("none", ""):
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
            report["profitMarginPercent"] = str(round((net_income / total_revenue) * 100, 2))
    
    for report in quarterly_reports:
        net_income = safe_int(report["netIncome"])
        total_revenue = safe_int(report["totalRevenue"])

        if net_income is None or total_revenue is None:
            report["profitMarginPercent"] = None
        else:
            report["profitMarginPercent"] = str(round((net_income / total_revenue) * 100, 2))
    
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
            report["freeCashFlow"] = str(operating - capex)

    for report in quarterly_reports:
        operating = safe_int(report.get("operatingCashflow"))
        capex = safe_int(report.get("capitalExpenditures"))

        if operating is None or capex is None:
            report["freeCashFlow"] = None
        else:
            report["freeCashFlow"] = str(operating - capex)
    
    return data


def annotate_current_ratio(data):
    annual_reports = data["annualReports"]
    quarterly_reports = data["quarterlyReports"]

    # CurrentRatio = totalCurrentAssets / totalCurrentLiabilities
    for report in annual_reports:
        total_current_assets = safe_int(report.get("totalCurrentAssets"))
        total_current_liabilities = safe_int(report.get("totalCurrentLiabilities"))

        if total_current_assets is None or total_current_liabilities in (None, 0):
            report["CurrentRatio"] = None
        else:
            report["CurrentRatio"] = str(round(total_current_assets / total_current_liabilities, 2))

    for report in quarterly_reports:
        total_current_assets = safe_int(report.get("totalCurrentAssets"))
        total_current_liabilities = safe_int(report.get("totalCurrentLiabilities"))

        if total_current_assets is None or total_current_liabilities in (None, 0):
            report["CurrentRatio"] = None
        else:
            report["CurrentRatio"] = str(round(total_current_assets / total_current_liabilities, 2))

    return data


def annotate_quick_ratio(data):
    annual_reports = data["annualReports"]
    quarterly_reports = data["quarterlyReports"]

    # QuickRatio = (cashAndCashEquivalentsAtCarryingValue + shortTermInvestments + currentNetReceivables) / totalCurrentLiabilities
    for report in annual_reports:
        cash = safe_int(report.get("cashAndCashEquivalentsAtCarryingValue"))
        short_term_investments = safe_int(report.get("shortTermInvestments"))
        receivables = safe_int(report.get("currentNetReceivables"))
        total_current_liabilities = safe_int(report.get("totalCurrentLiabilities"))

        if (
            cash is None
            or short_term_investments is None
            or receivables is None
            or total_current_liabilities in (None, 0)
        ):
            report["QuickRatio"] = None
        else:
            quick_ratio = (cash + short_term_investments + receivables) / total_current_liabilities
            report["QuickRatio"] = str(round(quick_ratio, 2))

    for report in quarterly_reports:
        cash = safe_int(report.get("cashAndCashEquivalentsAtCarryingValue"))
        short_term_investments = safe_int(report.get("shortTermInvestments"))
        receivables = safe_int(report.get("currentNetReceivables"))
        total_current_liabilities = safe_int(report.get("totalCurrentLiabilities"))

        if (
            cash is None
            or short_term_investments is None
            or receivables is None
            or total_current_liabilities in (None, 0)
        ):
            report["QuickRatio"] = None
        else:
            quick_ratio = (cash + short_term_investments + receivables) / total_current_liabilities
            report["QuickRatio"] = str(round(quick_ratio, 2))

    return data

def transform_pricing(data):
    records = data["Monthly Adjusted Time Series"]
    transformed_data = []
    for date in records:
        transformed_data.append(
            {
                "date": date,
                "adjustedClose": str(round(float(records[date]["5. adjusted close"]), 2)),
                "close": str(round(float(records[date]["4. close"]), 2)),
            }
        )

    return transformed_data

def compute_roe(income_statement, balance_sheet):

    def _equity_value_or_missing(lookup, fiscal_date):
        """
        A helper function to check if the 
        Returns (is_missing_date, parsed_equity_or_none).

        - Missing date/key => (True, None) and should be treated as statement misalignment.
        - Present date but value is "None"/empty => (False, None) and should produce ROEPercentage=None.
        """
        if fiscal_date not in lookup:
            return True, None
        report = lookup[fiscal_date]
        if "totalShareholderEquity" not in report:
            return True, None
        return False, safe_int(report.get("totalShareholderEquity"))

    # Create lookup dictionaries for balance sheet equity by date
    bs_annual = {report["fiscalDateEnding"]: report for report in balance_sheet.get("annualReports", [])}
    bs_quarterly = {report["fiscalDateEnding"]: report for report in balance_sheet.get("quarterlyReports", [])}
    
    annual_roe = []
    quarterly_roe = []
    
    # Process annual reports
    annual_reports = income_statement.get("annualReports", [])
    for i, income_report in enumerate(annual_reports):
        current_date = income_report["fiscalDateEnding"]

        if i + 1 >= len(annual_reports):
            continue
        previous_date = annual_reports[i + 1]["fiscalDateEnding"]

        current_missing, current_equity = _equity_value_or_missing(bs_annual, current_date)
        previous_missing, previous_equity = _equity_value_or_missing(bs_annual, previous_date)

        # If statements are misaligned (missing the date on the balance sheet), skip entirely.
        if current_missing or previous_missing:
            continue

        net_income = safe_int(income_report["netIncome"])

        # If any required input is explicitly missing (present but "None"), keep the datapoint as None.
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
            "ROEPercentage": str(round(roe, 2))
        })
    
    # Process quarterly reports
    quarterly_reports = income_statement.get("quarterlyReports", [])
    for i, income_report in enumerate(quarterly_reports):
        current_date = income_report["fiscalDateEnding"]

        if i + 1 >= len(quarterly_reports):
            continue
        previous_date = quarterly_reports[i + 1]["fiscalDateEnding"]

        current_missing, current_equity = _equity_value_or_missing(bs_quarterly, current_date)
        previous_missing, previous_equity = _equity_value_or_missing(bs_quarterly, previous_date)

        if current_missing or previous_missing:
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
            "ROEPercentage": str(round(roe, 2))
        })
    
    return {
        "annualReports": annual_roe,
        "quarterlyReports": quarterly_roe
    }

def compute_pe(pricing, earnings):
    # must return a dict of annualReports and quarterlyReports. each report must be a list of dict containing fiscalDateEnding and PERatio
    result = {
        "annualReports": [],
        "quarterlyReports": [],
    }

    def _month_key(date_str):
        key = date_str[:7]
        if len(key) != 7 or key[4] != "-":
            return None
        return key

    pricing_by_month = {}
    for point in pricing:
        date_str = point.get("date")
        close = safe_float(point.get("adjustedClose"))
        month = _month_key(date_str)
        if month is None or close is None:
            continue
        pricing_by_month[month] = close

    if not pricing_by_month:
        return result

    annual_earnings = earnings.get("annualEarnings", [])
    for report in annual_earnings:
        fiscal_date = report.get("fiscalDateEnding")
        price = pricing_by_month.get(_month_key(fiscal_date))

        if price is None:
            continue

        eps = safe_float(report.get("reportedEPS"))
        if eps is None or eps == 0:
            result["annualReports"].append({
                "fiscalDateEnding": fiscal_date,
                "PERatio": None,
            })
        else:
            result["annualReports"].append({
                "fiscalDateEnding": fiscal_date,
                "PERatio": str(round(price / eps, 2)),
            })

    quarterly_earnings = earnings.get("quarterlyEarnings", [])
    for i in range(len(quarterly_earnings) - 3):
        current_report = quarterly_earnings[i]
        fiscal_date = current_report.get("fiscalDateEnding")
        price = pricing_by_month.get(_month_key(fiscal_date))

        if price is None:
            continue

        ttm_reports = quarterly_earnings[i:i + 4]
        ttm_eps_values = [safe_float(report.get("reportedEPS")) for report in ttm_reports]

        if any(eps is None for eps in ttm_eps_values):
            result["quarterlyReports"].append({
                "fiscalDateEnding": fiscal_date,
                "PERatio": None,
            })
            continue

        ttm_eps = sum(ttm_eps_values)
        if ttm_eps == 0:
            result["quarterlyReports"].append({
                "fiscalDateEnding": fiscal_date,
                "PERatio": None,
            })
            continue

        result["quarterlyReports"].append({
            "fiscalDateEnding": fiscal_date,
            "PERatio": str(round(price / ttm_eps, 2)),
        })

    return result

def compute_pb(pricing, balance_sheet):
    result = {
        "annualReports": [],
        "quarterlyReports": [],
    }

    def _month_key(date_str):
        key = date_str[:7]
        if len(key) != 7 or key[4] != "-":
            return None
        return key

    pricing_by_month = {}
    for point in pricing:
        date_str = point.get("date")
        month = _month_key(date_str)
        close_raw = point.get("adjustedClose")

        if month is None or close_raw is None:
            continue

        try:
            close = float(close_raw)
        except (TypeError, ValueError):
            continue

        pricing_by_month[month] = close

    if not pricing_by_month:
        return result

    def _append_pb(reports, bucket_name):
        for report in reports:
            fiscal_date = report.get("fiscalDateEnding")
            price = pricing_by_month.get(_month_key(fiscal_date))

            # Pricing is passive and may be misaligned; skip when no monthly match exists.
            if price is None:
                continue

            total_assets = safe_int(report.get("totalAssets"))
            total_liabilities = safe_int(report.get("totalLiabilities"))
            shares_outstanding = safe_int(report.get("commonStockSharesOutstanding"))

            if total_assets is None or total_liabilities is None or shares_outstanding is None or shares_outstanding == 0:
                result[bucket_name].append({
                    "fiscalDateEnding": fiscal_date,
                    "PBRatio": None,
                })
                continue

            bvps = (total_assets - total_liabilities) / shares_outstanding
            if bvps == 0:
                result[bucket_name].append({
                    "fiscalDateEnding": fiscal_date,
                    "PBRatio": None,
                })
                continue

            result[bucket_name].append({
                "fiscalDateEnding": fiscal_date,
                "PBRatio": str(round(price / bvps, 2)),
            })

    _append_pb(balance_sheet.get("annualReports", []), "annualReports")
    _append_pb(balance_sheet.get("quarterlyReports", []), "quarterlyReports")

    return result

def compute_market_cap(pricing, balance_sheet):
    result = {
        "annualReports": [],
        "quarterlyReports": [],
    }

    def _month_key(date_str):
        key = date_str[:7]
        if len(key) != 7 or key[4] != "-":
            return None
        return key

    pricing_by_month = {}
    for point in pricing:
        date_str = point.get("date")
        month = _month_key(date_str)
        close = safe_float(point.get("close"))

        if month is None or close is None:
            continue

        pricing_by_month[month] = close

    if not pricing_by_month:
        return result

    def _append_market_cap(reports, bucket_name):
        for report in reports:
            fiscal_date = report.get("fiscalDateEnding")
            price = pricing_by_month.get(_month_key(fiscal_date))

            # Pricing is passive and may be misaligned; skip when no monthly match exists.
            if price is None:
                continue

            shares_outstanding = safe_int(report.get("commonStockSharesOutstanding"))
            if shares_outstanding is None:
                result[bucket_name].append({
                    "fiscalDateEnding": fiscal_date,
                    "marketCap": None,
                })
                continue

            result[bucket_name].append({
                "fiscalDateEnding": fiscal_date,
                "marketCap": str(round(price * shares_outstanding)),
            })

    _append_market_cap(balance_sheet.get("annualReports", []), "annualReports")
    _append_market_cap(balance_sheet.get("quarterlyReports", []), "quarterlyReports")

    return result

def compute_ps(pricing, income_statement, balance_sheet):
    result = {
        "annualReports": [],
        "quarterlyReports": [],
    }

    def _month_key(date_str):
        key = date_str[:7]
        if len(key) != 7 or key[4] != "-":
            return None
        return key

    pricing_by_month = {}
    for point in pricing:
        date_str = point.get("date")
        month = _month_key(date_str)
        close = safe_float(point.get("close"))

        if month is None or close is None:
            continue

        pricing_by_month[month] = close

    if not pricing_by_month:
        return result

    annual_income = {report.get("fiscalDateEnding"): report for report in income_statement.get("annualReports", [])}

    def _append_ps_annual(balance_reports):
        for report in balance_reports:
            fiscal_date = report.get("fiscalDateEnding")
            price = pricing_by_month.get(_month_key(fiscal_date))

            # Pricing is passive and may be misaligned; skip when no monthly match exists.
            if price is None:
                continue

            shares_outstanding = safe_int(report.get("commonStockSharesOutstanding"))
            income_report = annual_income.get(fiscal_date)
            total_revenue = None if income_report is None else safe_int(income_report.get("totalRevenue"))

            if shares_outstanding is None or total_revenue is None or total_revenue == 0:
                result["annualReports"].append({
                    "fiscalDateEnding": fiscal_date,
                    "PSRatio": None,
                })
                continue

            market_cap = price * shares_outstanding
            result["annualReports"].append({
                "fiscalDateEnding": fiscal_date,
                "PSRatio": str(round(market_cap / total_revenue, 2)),
            })

    def _append_ps_quarterly(balance_reports):
        quarterly_income_reports = income_statement.get("quarterlyReports", [])
        income_index_by_date = {
            report.get("fiscalDateEnding"): i
            for i, report in enumerate(quarterly_income_reports)
        }

        for report in balance_reports:
            fiscal_date = report.get("fiscalDateEnding")
            price = pricing_by_month.get(_month_key(fiscal_date))

            # Pricing is passive and may be misaligned; skip when no monthly match exists.
            if price is None:
                continue

            shares_outstanding = safe_int(report.get("commonStockSharesOutstanding"))
            start_idx = income_index_by_date.get(fiscal_date)

            # skip points that cannot form a full TTM window.
            if start_idx is None or start_idx > len(quarterly_income_reports) - 4:
                continue

            ttm_revenue = None
            ttm_reports = quarterly_income_reports[start_idx:start_idx + 4]
            ttm_revenue_values = [safe_int(item.get("totalRevenue")) for item in ttm_reports]
            if all(value is not None for value in ttm_revenue_values):
                ttm_revenue = sum(ttm_revenue_values)

            if shares_outstanding is None or ttm_revenue is None or ttm_revenue == 0:
                result["quarterlyReports"].append({
                    "fiscalDateEnding": fiscal_date,
                    "PSRatio": None,
                })
                continue

            market_cap = price * shares_outstanding
            result["quarterlyReports"].append({
                "fiscalDateEnding": fiscal_date,
                "PSRatio": str(round(market_cap / ttm_revenue, 2)),
            })

    _append_ps_annual(balance_sheet.get("annualReports", []))
    _append_ps_quarterly(balance_sheet.get("quarterlyReports", []))

    return result


def compute_pfcf(pricing, cash_flow, balance_sheet):
    result = {
        "annualReports": [],
        "quarterlyReports": [],
    }

    def _month_key(date_str):
        key = date_str[:7]
        if len(key) != 7 or key[4] != "-":
            return None
        return key

    pricing_by_month = {}
    for point in pricing:
        date_str = point.get("date")
        month = _month_key(date_str)
        close = safe_float(point.get("close"))

        if month is None or close is None:
            continue

        pricing_by_month[month] = close

    if not pricing_by_month:
        return result

    annual_cash_flow = {
        report.get("fiscalDateEnding"): report
        for report in cash_flow.get("annualReports", [])
    }

    quarterly_cash_flow_reports = cash_flow.get("quarterlyReports", [])

    def _append_pfcf_annual(balance_reports):
        for report in balance_reports:
            fiscal_date = report.get("fiscalDateEnding")
            price = pricing_by_month.get(_month_key(fiscal_date))

            # Pricing is passive and may be misaligned; skip when no monthly match exists.
            if price is None:
                continue

            shares_outstanding = safe_int(report.get("commonStockSharesOutstanding"))
            cash_flow_report = annual_cash_flow.get(fiscal_date)
            free_cash_flow = None if cash_flow_report is None else safe_int(cash_flow_report.get("freeCashFlow"))

            if shares_outstanding is None or free_cash_flow is None or free_cash_flow <= 0:
                result["annualReports"].append({
                    "fiscalDateEnding": fiscal_date,
                    "PFCFRatio": None,
                })
                continue

            market_cap = price * shares_outstanding
            result["annualReports"].append({
                "fiscalDateEnding": fiscal_date,
                "PFCFRatio": str(round(market_cap / free_cash_flow, 2)),
            })

    def _append_pfcf_quarterly(balance_reports):
        cash_flow_index_by_date = {
            report.get("fiscalDateEnding"): i
            for i, report in enumerate(quarterly_cash_flow_reports)
        }

        for report in balance_reports:
            fiscal_date = report.get("fiscalDateEnding")
            price = pricing_by_month.get(_month_key(fiscal_date))

            # Pricing is passive and may be misaligned; skip when no monthly match exists.
            if price is None:
                continue

            shares_outstanding = safe_int(report.get("commonStockSharesOutstanding"))
            start_idx = cash_flow_index_by_date.get(fiscal_date)

            # skip points that cannot form a full TTM window.
            if start_idx is None or start_idx > len(quarterly_cash_flow_reports) - 4:
                continue

            ttm_reports = quarterly_cash_flow_reports[start_idx:start_idx + 4]
            ttm_fcf_values = [safe_int(item.get("freeCashFlow")) for item in ttm_reports]
            ttm_free_cash_flow = None
            if all(value is not None for value in ttm_fcf_values):
                ttm_free_cash_flow = sum(ttm_fcf_values)

            if shares_outstanding is None or ttm_free_cash_flow is None or ttm_free_cash_flow <= 0:
                result["quarterlyReports"].append({
                    "fiscalDateEnding": fiscal_date,
                    "PFCFRatio": None,
                })
                continue

            market_cap = price * shares_outstanding
            result["quarterlyReports"].append({
                "fiscalDateEnding": fiscal_date,
                "PFCFRatio": str(round(market_cap / ttm_free_cash_flow, 2)),
            })

    _append_pfcf_annual(balance_sheet.get("annualReports", []))
    _append_pfcf_quarterly(balance_sheet.get("quarterlyReports", []))

    return result
    