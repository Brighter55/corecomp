"""WiseSheets API client that maps responses to Alpha Vantage-shaped dicts.

FinancialDataService (pages/services.py) delegates every method here. Each
public function returns either an AV-shaped dict -- the exact contract the
views, annotators and computators in pages/utils.py consume -- or a DRF
Response for errors (views branch on isinstance(data, Response), same as the
old fetchAlphaVantage).

WiseSheets sources SEC EDGAR XBRL filings and normalizes ~231 standardized
metric keys. Statement "lines" arrive as [{metric, label, value, unit}]; metric
names may use snake_case, camelCase or AV-style spellings, so every AV field is
resolved against a list of candidate keys with underscore/case-insensitive
matching (see _value). Unmatched AV fields are emitted as the string "None",
matching the AV fixtures' own convention (annotators index keys directly and
would KeyError otherwise).
"""

import os
import time
from datetime import date, timedelta

import requests
from dotenv import load_dotenv
from rest_framework import status
from rest_framework.response import Response

load_dotenv()

BASE_URL = "https://api.wisesheets.io/v1"
REQUEST_TIMEOUT = 10

# ---------------------------------------------------------------------------
# HTTP layer
# ---------------------------------------------------------------------------


def fetch_wisesheets(endpoint, params):
    """GET {BASE_URL}/{endpoint}/ with Bearer auth.

    Returns the parsed JSON dict, {} for a 404 (unknown symbol), or a DRF
    Response for rate-limit / auth / server errors.
    """
    api_key = os.getenv("WISESHEETS_API_KEY")
    if not api_key:
        return Response(
            {"error": "invalid api call issue"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )
    try:
        response = requests.get(
            f"{BASE_URL}/{endpoint}/",
            params=params,
            headers={"Authorization": f"Bearer {api_key}"},
            timeout=REQUEST_TIMEOUT,
        )
    except (requests.Timeout, requests.ConnectionError):
        # transient -- map to the same 503 + Retry-After the frontend retries
        return Response(
            {"error": "rate limit issue"},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
            headers={"Retry-After": "60000"},
        )

    if response.status_code == 429:
        return Response(
            {"error": "rate limit issue"},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
            headers={"Retry-After": "60000"},
        )
    if response.status_code in (401, 403):
        return Response(
            {"error": "invalid api call issue"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )
    if response.status_code == 404:
        return {}
    if response.status_code >= 500:
        return Response(
            {"error": "invalid api call issue"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )
    try:
        return response.json()
    except ValueError:
        return Response(
            {"error": "invalid api call issue"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


# ---------------------------------------------------------------------------
# Upstream dedupe + request counter
# ---------------------------------------------------------------------------

# In-process memo: key -> (expires_at, value). The view layer already caches
# 7d responses in Redis; this only collapses the burst of service calls a
# single page load makes (info + statements + pricing + dividends + composite
# all fetch the same upstream resources).
_UPSTREAM_CACHE = {}


def _record_request():
    """INCR a daily counter for quota observability. Never raises."""
    try:
        from django.core.cache import cache

        cache.incr("ws:requests", 1)
        cache.expire("ws:requests", 40 * 86400)
    except Exception:
        pass


def _upstream(key, fetch_fn, ttl_seconds=300):
    now = time.time()
    cached = _UPSTREAM_CACHE.get(key)
    if cached and cached[0] > now:
        return cached[1]
    value = fetch_fn()
    if isinstance(value, Response):
        return value  # errors are never cached
    _UPSTREAM_CACHE[key] = (now + ttl_seconds, value)
    _record_request()
    return value


# ---------------------------------------------------------------------------
# Metric-key resolution helpers
# ---------------------------------------------------------------------------


def _normalize(key):
    return str(key).replace("_", "").lower()


def _line_values_by_metric(statement):
    """{normalized_metric: value_string} from a statement's lines[]."""
    result = {}
    for line in statement.get("lines", []):
        result[_normalize(line.get("metric"))] = line.get("value")
    return result


def _value(values_by_metric, candidates):
    """First candidate present in the normalized metric map, else "None"."""
    for candidate in candidates:
        norm = _normalize(candidate)
        if norm in values_by_metric:
            value = values_by_metric[norm]
            return value if value is not None else "None"
    return "None"


def _safe_float(value):
    if value in (None, "", "None"):
        return None
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def _fmt(value, digits=2):
    """String formatting matching the AV fixtures; None/NaN -> "None"."""
    if value is None:
        return "None"
    try:
        return str(round(float(value), digits))
    except (TypeError, ValueError):
        return "None"


def _symbol_unknown(data, symbol):
    """True when the requested symbol is absent from the API universe."""
    meta = data.get("meta", {}) if isinstance(data, dict) else {}
    unknown = meta.get("unknownSymbols") or []
    return symbol.upper() in [str(s).upper() for s in unknown]


def _period_end(entry):
    return (entry.get("period") or {}).get("end")


# ---------------------------------------------------------------------------
# Statement mappers (income / cash flow / balance sheet, annual + quarterly)
# ---------------------------------------------------------------------------

# Every AV fixture key is emitted per report ("None" when unsourced) so the
# live service returns byte-identical shapes to MockFinancialDataService.

INCOME_STATEMENT_KEYS = [
    "fiscalDateEnding", "reportedCurrency", "grossProfit", "totalRevenue",
    "costOfRevenue", "costofGoodsAndServicesSold", "operatingIncome",
    "sellingGeneralAndAdministrative", "researchAndDevelopment",
    "operatingExpenses", "investmentIncomeNet", "netInterestIncome",
    "interestIncome", "interestExpense", "nonInterestIncome",
    "otherNonOperatingIncome", "depreciation", "depreciationAndAmortization",
    "incomeBeforeTax", "incomeTaxExpense", "interestAndDebtExpense",
    "netIncomeFromContinuingOperations", "comprehensiveIncomeNetOfTax",
    "ebit", "ebitda", "netIncome",
]

INCOME_STATEMENT_SOURCES = {
    "grossProfit": ["gross_profit", "grossprofit"],
    "totalRevenue": ["revenue", "total_revenue", "sales"],
    "costOfRevenue": ["cost_of_revenue", "costofrevenue"],
    "costofGoodsAndServicesSold": ["cost_of_goods_and_services_sold", "cost_of_revenue"],
    "operatingIncome": ["operating_income"],
    "sellingGeneralAndAdministrative": ["selling_general_and_administrative", "selling_general_and_admin"],
    "researchAndDevelopment": ["research_and_development"],
    "operatingExpenses": ["operating_expenses"],
    "interestIncome": ["interest_income"],
    "interestExpense": ["interest_expense"],
    "netInterestIncome": ["net_interest_income", "interest_income_net"],
    "depreciation": ["depreciation"],
    "depreciationAndAmortization": ["depreciation_and_amortization"],
    "incomeBeforeTax": ["income_before_tax", "pretax_income"],
    "incomeTaxExpense": ["income_tax_expense"],
    "netIncomeFromContinuingOperations": [
        "net_income_continuing_operations",
        "net_income_from_continuing_operations",
    ],
    "comprehensiveIncomeNetOfTax": ["comprehensive_income_net_of_tax", "comprehensive_income"],
    "ebit": ["ebit", "earnings_before_interest_and_taxes"],
    "ebitda": ["ebitda", "earnings_before_interest_taxes_depreciation_and_amortization"],
    "netIncome": ["net_income", "netincome"],
}

CASH_FLOW_KEYS = [
    "fiscalDateEnding", "reportedCurrency", "operatingCashflow",
    "paymentsForOperatingActivities", "proceedsFromOperatingActivities",
    "changeInOperatingLiabilities", "changeInOperatingAssets",
    "depreciationDepletionAndAmortization", "capitalExpenditures",
    "changeInReceivables", "changeInInventory", "profitLoss",
    "cashflowFromInvestment", "cashflowFromFinancing",
    "proceedsFromRepaymentsOfShortTermDebt", "paymentsForRepurchaseOfCommonStock",
    "paymentsForRepurchaseOfEquity", "paymentsForRepurchaseOfPreferredStock",
    "dividendPayout", "dividendPayoutCommonStock", "dividendPayoutPreferredStock",
    "proceedsFromIssuanceOfCommonStock",
    "proceedsFromIssuanceOfLongTermDebtAndCapitalSecuritiesNet",
    "proceedsFromIssuanceOfPreferredStock", "proceedsFromRepurchaseOfEquity",
    "proceedsFromSaleOfTreasuryStock", "changeInCashAndCashEquivalents",
    "changeInExchangeRate", "netIncome",
]

CASH_FLOW_SOURCES = {
    "operatingCashflow": [
        "operating_cash_flow",
        "net_cash_provided_by_operating_activities",
        "operating_cashflow",
    ],
    "paymentsForOperatingActivities": ["payments_for_operating_activities"],
    "proceedsFromOperatingActivities": ["proceeds_from_operating_activities"],
    "changeInOperatingLiabilities": ["change_in_operating_liabilities"],
    "changeInOperatingAssets": ["change_in_operating_assets"],
    "depreciationDepletionAndAmortization": [
        "depreciation_and_amortization",
        "depreciation_depletion_and_amortization",
    ],
    "capitalExpenditures": ["capital_expenditures", "capex"],
    "changeInReceivables": ["change_in_receivables", "change_in_accounts_receivable"],
    "changeInInventory": ["change_in_inventory", "inventory_change"],
    "profitLoss": ["profit_loss"],
    "cashflowFromInvestment": [
        "cash_from_investing",
        "cash_flow_from_investing_activities",
        "net_cash_used_for_investing_activities",
        "investing_cash_flow",
    ],
    "cashflowFromFinancing": [
        "cash_from_financing",
        "cash_flow_from_financing_activities",
        "net_cash_used_provided_by_financing_activities",
        "financing_cash_flow",
    ],
    "proceedsFromRepaymentsOfShortTermDebt": [
        "proceeds_from_repayments_of_short_term_debt",
        "short_term_debt_repayments",
    ],
    "paymentsForRepurchaseOfCommonStock": [
        "stock_repurchases",
        "payments_for_repurchase_of_common_stock",
        "common_stock_repurchased",
    ],
    "paymentsForRepurchaseOfEquity": [
        "stock_repurchases",
        "payments_for_repurchase_of_equity",
    ],
    "paymentsForRepurchaseOfPreferredStock": [
        "preferred_stock_repurchased",
        "payments_for_repurchase_of_preferred_stock",
    ],
    "dividendPayout": ["dividends_paid", "cash_dividends_paid", "dividend_payout"],
    "dividendPayoutCommonStock": [
        "dividends_paid",
        "common_stock_dividends_paid",
        "dividend_payout_common_stock",
    ],
    "dividendPayoutPreferredStock": [
        "preferred_stock_dividends_paid",
        "dividend_payout_preferred_stock",
    ],
    "proceedsFromIssuanceOfCommonStock": [
        "proceeds_from_issuance_of_common_stock",
        "common_stock_issued",
    ],
    "proceedsFromIssuanceOfLongTermDebtAndCapitalSecuritiesNet": [
        "proceeds_from_issuance_of_long_term_debt",
        "long_term_debt_issued",
    ],
    "proceedsFromIssuanceOfPreferredStock": [
        "proceeds_from_issuance_of_preferred_stock",
        "preferred_stock_issued",
    ],
    "proceedsFromRepurchaseOfEquity": [
        "stock_repurchases",
        "proceeds_from_repurchase_of_equity",
    ],
    "proceedsFromSaleOfTreasuryStock": ["proceeds_from_sale_of_treasury_stock"],
    "changeInCashAndCashEquivalents": [
        "change_in_cash_and_cash_equivalents",
        "net_change_in_cash",
    ],
    "changeInExchangeRate": [
        "change_in_exchange_rate",
        "effect_of_exchange_rate_changes_on_cash",
    ],
    "netIncome": ["net_income", "netincome"],
}

BALANCE_SHEET_KEYS = [
    "fiscalDateEnding", "reportedCurrency", "totalAssets", "totalCurrentAssets",
    "cashAndCashEquivalentsAtCarryingValue", "cashAndShortTermInvestments",
    "inventory", "currentNetReceivables", "totalNonCurrentAssets",
    "propertyPlantEquipment", "accumulatedDepreciationAmortizationPPE",
    "intangibleAssets", "intangibleAssetsExcludingGoodwill", "goodwill",
    "investments", "longTermInvestments", "shortTermInvestments",
    "otherCurrentAssets", "otherNonCurrentAssets", "totalLiabilities",
    "totalCurrentLiabilities", "currentAccountsPayable", "deferredRevenue",
    "currentDebt", "currentLongTermDebt", "shortTermDebt",
    "totalNonCurrentLiabilities", "capitalLeaseObligations", "longTermDebt",
    "longTermDebtNoncurrent", "otherCurrentLiabilities",
    "otherNonCurrentLiabilities", "shortLongTermDebtTotal",
    "totalShareholderEquity", "treasuryStock", "retainedEarnings", "commonStock",
    "commonStockSharesOutstanding",
]

BALANCE_SHEET_SOURCES = {
    "totalAssets": ["total_assets"],
    "totalCurrentAssets": ["total_current_assets"],
    "cashAndCashEquivalentsAtCarryingValue": ["cash_and_cash_equivalents", "cash_and_equivalents"],
    "cashAndShortTermInvestments": ["cash_and_short_term_investments"],
    "inventory": ["inventory"],
    "currentNetReceivables": ["net_receivables", "receivables", "current_net_receivables"],
    "totalNonCurrentAssets": ["total_non_current_assets"],
    "propertyPlantEquipment": ["property_plant_equipment", "net_ppe"],
    "accumulatedDepreciationAmortizationPPE": ["accumulated_depreciation"],
    "intangibleAssets": ["intangible_assets"],
    "intangibleAssetsExcludingGoodwill": ["intangible_assets_excluding_goodwill"],
    "goodwill": ["goodwill"],
    "investments": ["investments"],
    "longTermInvestments": ["long_term_investments"],
    "shortTermInvestments": ["short_term_investments"],
    "otherCurrentAssets": ["other_current_assets"],
    "otherNonCurrentAssets": ["other_non_current_assets"],
    "totalLiabilities": ["total_liabilities"],
    "totalCurrentLiabilities": ["total_current_liabilities"],
    "currentAccountsPayable": ["accounts_payable", "current_accounts_payable"],
    "deferredRevenue": ["deferred_revenue"],
    "currentDebt": ["current_debt"],
    "currentLongTermDebt": ["current_long_term_debt"],
    "shortTermDebt": ["short_term_debt"],
    "totalNonCurrentLiabilities": ["total_non_current_liabilities"],
    "capitalLeaseObligations": ["capital_lease_obligations"],
    "longTermDebt": ["long_term_debt"],
    "longTermDebtNoncurrent": ["long_term_debt_noncurrent", "long_term_debt"],
    "otherCurrentLiabilities": ["other_current_liabilities"],
    "otherNonCurrentLiabilities": ["other_non_current_liabilities"],
    "shortLongTermDebtTotal": ["total_debt", "short_long_term_debt_total"],
    "totalShareholderEquity": [
        "shareholders_equity",
        "total_shareholders_equity",
        "total_stockholders_equity",
    ],
    "treasuryStock": ["treasury_stock"],
    "retainedEarnings": ["retained_earnings"],
    "commonStock": ["common_stock"],
    "commonStockSharesOutstanding": [
        "common_stock_shares_outstanding",
        "shares_outstanding",
        "weighted_average_shares_outstanding",
        "shares",
    ],
}


def _build_delta_map(payload, candidates):
    """{period_end: change vs previous period} of a balance-sheet line.

    Fallback for changeInInventory / changeInReceivables when the cash flow
    statement doesn't report them directly.
    """
    values = {}
    for entry in payload.get("data", []):
        end = _period_end(entry)
        if not end:
            continue
        bs = _line_values_by_metric(entry.get("statements", {}).get("balance_sheet", {}))
        values[end] = _value(bs, candidates)
    deltas = {}
    for i, end in enumerate(sorted(values)):
        if i == 0:
            deltas[end] = None
            continue
        prev, curr = values[sorted(values)[i - 1]], values[end]
        prev_f, curr_f = _safe_float(prev), _safe_float(curr)
        if prev_f is None or curr_f is None:
            deltas[end] = None
        else:
            deltas[end] = str(curr_f - prev_f)
    return deltas


def _reports_from_statements(payload, statement_name, av_keys, av_sources):
    """AV-style report list from one /statements/ payload (one frequency).

    Sorted most-recent-first, matching the AV fixtures and the ordering the
    compute_* functions assume (index i+1 = previous period).
    """
    deltas = {}
    if statement_name == "cash_flow":
        deltas = {
            "changeInInventory": _build_delta_map(payload, ["inventory"]),
            "changeInReceivables": _build_delta_map(payload, ["net_receivables", "receivables"]),
        }

    reports = []
    for entry in payload.get("data", []):
        period_end = _period_end(entry)
        if not period_end:
            continue
        statement = entry.get("statements", {}).get(statement_name, {})
        values = _line_values_by_metric(statement)

        report = {"fiscalDateEnding": period_end, "reportedCurrency": "USD"}
        for av_key in av_keys:
            if av_key in ("fiscalDateEnding", "reportedCurrency"):
                continue
            candidates = av_sources.get(av_key)
            if candidates:
                report[av_key] = _value(values, candidates)
            else:
                report[av_key] = "None"

        for av_key, delta_map in deltas.items():
            if report.get(av_key) in (None, "None", "") and period_end in delta_map:
                report[av_key] = delta_map[period_end] or "None"

        reports.append(report)

    reports.sort(key=lambda r: r["fiscalDateEnding"], reverse=True)
    return reports


def _get_statements(symbol, frequency):
    params = {"frequency": frequency, "period": "last5y"}
    return fetch_wisesheets(f"statements/{symbol}", params)


def get_statements_av(symbol, statement_name, av_keys, av_sources):
    """AV-shaped {symbol, annualReports, quarterlyReports} for one statement."""
    annual = _upstream(f"statements:{symbol}:annual", lambda: _get_statements(symbol, "annual"))
    quarterly = _upstream(f"statements:{symbol}:quarterly", lambda: _get_statements(symbol, "quarterly"))
    if isinstance(annual, Response):
        return annual
    if isinstance(quarterly, Response):
        return quarterly
    if not annual or not quarterly:
        return {}
    return {
        "symbol": symbol.upper(),
        "annualReports": _reports_from_statements(annual, statement_name, av_keys, av_sources),
        "quarterlyReports": _reports_from_statements(quarterly, statement_name, av_keys, av_sources),
    }


# ---------------------------------------------------------------------------
# Earnings (reported EPS only -- estimates were removed from the product)
# ---------------------------------------------------------------------------


def _eps_for_period(entry):
    statements = entry.get("statements", {})
    income = _line_values_by_metric(statements.get("income_statement", {}))
    eps = _value(income, ["eps", "eps_basic", "basic_eps", "earnings_per_share_basic", "earnings_per_share"])
    if eps != "None":
        return eps
    net_income = _value(income, ["net_income", "netincome"])
    bs = _line_values_by_metric(statements.get("balance_sheet", {}))
    shares = _value(bs, [
        "common_stock_shares_outstanding",
        "shares_outstanding",
        "weighted_average_shares_outstanding",
        "shares",
    ])
    ni, sh = _safe_float(net_income), _safe_float(shares)
    if ni is not None and sh not in (None, 0):
        return str(round(ni / sh, 2))
    return "None"


def _earnings_reports(payload):
    reports = []
    for entry in payload.get("data", []):
        period_end = _period_end(entry)
        if not period_end:
            continue
        reports.append({"fiscalDateEnding": period_end, "reportedEPS": _eps_for_period(entry)})
    reports.sort(key=lambda r: r["fiscalDateEnding"], reverse=True)
    return reports


def get_earnings_av(symbol):
    """AV-shaped {symbol, annualEarnings, quarterlyEarnings} (reportedEPS only)."""
    annual = _upstream(f"statements:{symbol}:annual", lambda: _get_statements(symbol, "annual"))
    quarterly = _upstream(f"statements:{symbol}:quarterly", lambda: _get_statements(symbol, "quarterly"))
    if isinstance(annual, Response):
        return annual
    if isinstance(quarterly, Response):
        return quarterly
    if not annual or not quarterly:
        return {}
    return {
        "symbol": symbol.upper(),
        "annualEarnings": _earnings_reports(annual),
        "quarterlyEarnings": _earnings_reports(quarterly),
    }


# ---------------------------------------------------------------------------
# Pricing (EOD daily -> AV monthly series)
# ---------------------------------------------------------------------------


def _eod_params(symbol, cursor=None):
    five_years_ago = (date.today() - timedelta(days=5 * 365)).isoformat()
    params = {
        "tickers": symbol,
        "period": f"{five_years_ago}..{date.today().isoformat()}",
        "fields": "close,adjClose",
        "limit": 10000,
    }
    if cursor:
        params["cursor"] = cursor
    return params


def get_pricing_av(symbol):
    data = _upstream(f"eod:{symbol}", lambda: fetch_wisesheets("prices/eod", _eod_params(symbol)), ttl_seconds=600)
    if isinstance(data, Response):
        return data
    if _symbol_unknown(data, symbol) or not data.get("data"):
        return {}

    rows = list(data["data"])
    # Defensive: follow cursor pagination if a response ever exceeds the limit.
    cursor = (data.get("meta") or {}).get("nextCursor")
    while cursor:
        page = fetch_wisesheets("prices/eod", _eod_params(symbol, cursor))
        if isinstance(page, Response) or not page.get("data"):
            break
        rows.extend(page["data"])
        cursor = (page.get("meta") or {}).get("nextCursor")

    # Last row per calendar month, ascending by date (AV series convention).
    last_by_month = {}
    for row in rows:
        day = row.get("date")
        if day:
            last_by_month[day[:7]] = row
    series = {}
    for month in sorted(last_by_month):
        row = last_by_month[month]
        series[row["date"]] = {
            "4. close": row.get("close") or "None",
            "5. adjusted close": row.get("adjClose") or "None",
        }
    return {"Monthly Adjusted Time Series": series}


# ---------------------------------------------------------------------------
# Live price -> AV Global Quote
# ---------------------------------------------------------------------------

LIVE_FIELDS = (
    "price,marketCap,pe,eps,sharesOutstanding,yearHigh,yearLow,"
    "priceAvg50,priceAvg200,name,exchange"
)


def _fetch_live(symbol):
    return fetch_wisesheets("prices/live", {"tickers": symbol, "fields": LIVE_FIELDS})


def get_live_row(symbol):
    """WiseSheets live row (dict) or Response; {} for unknown symbol."""
    data = _upstream(f"live:{symbol}", lambda: _fetch_live(symbol), ttl_seconds=60)
    if isinstance(data, Response):
        return data
    if _symbol_unknown(data, symbol):
        return {}
    rows = data.get("data") or []
    return rows[0] if rows else {}


# ---------------------------------------------------------------------------
# Dividends
# ---------------------------------------------------------------------------


def _fetch_dividends(symbol):
    five_years_ago = (date.today() - timedelta(days=5 * 365)).isoformat()
    return fetch_wisesheets("dividends", {
        "tickers": symbol,
        "fields": "dividend,recordDate,paymentDate,declarationDate",
        "from": five_years_ago,
        "to": date.today().isoformat(),
    })


def get_dividends_av(symbol):
    data = _upstream(f"dividends:{symbol}", lambda: _fetch_dividends(symbol), ttl_seconds=600)
    if isinstance(data, Response):
        return data
    rows = data.get("data") or [] if isinstance(data, dict) else []
    if _symbol_unknown(data, symbol) or not rows:
        return {"symbol": symbol.upper(), "data": []}
    return {
        "symbol": symbol.upper(),
        "data": [
            {
                "ex_dividend_date": row.get("date") or "None",
                "declaration_date": row.get("declarationDate") or "None",
                "record_date": row.get("recordDate") or "None",
                "payment_date": row.get("paymentDate") or "None",
                "amount": row.get("dividend") or row.get("adjDividend") or "None",
            }
            for row in rows
        ],
    }


# ---------------------------------------------------------------------------
# Company profile + overview assembly (info endpoint)
# ---------------------------------------------------------------------------

SIC_TO_SECTOR = [
    # (sic_start, sic_end, sector) -- first match wins; AV-style uppercase names
    (100, 999, "CONSUMER STAPLES"),
    (1000, 1299, "MATERIALS"),
    (1300, 1399, "ENERGY"),
    (1400, 1499, "MATERIALS"),
    (1500, 1799, "INDUSTRIALS"),
    (2000, 2399, "CONSUMER STAPLES"),
    (2400, 2599, "CONSUMER DISCRETIONARY"),
    (2600, 2899, "MATERIALS"),
    (2900, 2999, "ENERGY"),
    (3000, 3399, "MATERIALS"),
    (3400, 3499, "INDUSTRIALS"),
    (3500, 3569, "INDUSTRIALS"),
    (3570, 3579, "TECHNOLOGY"),
    (3580, 3599, "INDUSTRIALS"),
    (3600, 3699, "TECHNOLOGY"),
    (3700, 3799, "INDUSTRIALS"),
    (3800, 3899, "TECHNOLOGY"),
    (3900, 3999, "CONSUMER DISCRETIONARY"),
    (4000, 4799, "INDUSTRIALS"),
    (4800, 4899, "COMMUNICATION SERVICES"),
    (4900, 4999, "UTILITIES"),
    (5000, 5099, "CONSUMER DISCRETIONARY"),
    (5100, 5199, "CONSUMER STAPLES"),
    (5200, 5799, "CONSUMER DISCRETIONARY"),
    (5800, 5999, "CONSUMER STAPLES"),
    (6000, 6499, "FINANCE"),
    (6500, 6599, "REAL ESTATE"),
    (6600, 6799, "FINANCE"),
    (7000, 7299, "CONSUMER DISCRETIONARY"),
    (7300, 7369, "INDUSTRIALS"),
    (7370, 7379, "TECHNOLOGY"),
    (7380, 7399, "INDUSTRIALS"),
    (7500, 7999, "CONSUMER DISCRETIONARY"),
    (8000, 8099, "HEALTHCARE"),
    (8100, 8999, "CONSUMER DISCRETIONARY"),
]


def _sector_for_sic(sic):
    if not sic:
        return "None"
    try:
        sic_int = int(str(sic).strip())
    except ValueError:
        return "None"
    for start, end, sector in SIC_TO_SECTOR:
        if start <= sic_int <= end:
            return sector
    return "None"


_MONTHS = {
    1: "January", 2: "February", 3: "March", 4: "April", 5: "May", 6: "June",
    7: "July", 8: "August", 9: "September", 10: "October", 11: "November",
    12: "December",
}


def _fiscal_year_end(value):
    """Profile fiscalYearEnd "0926" -> "September" (AV month-name style)."""
    if not value:
        return "None"
    month = str(value)[:2]
    if month.isdigit() and 1 <= int(month) <= 12:
        return _MONTHS[int(month)]
    return "None"


def _latest_quarterly(reports, field):
    for report in reports:
        if _safe_float(report.get(field)) is not None:
            return report.get(field)
    return None


def _ttm_sum(reports, field):
    """Sum of the last 4 quarters (reports are most-recent-first)."""
    values = [_safe_float(report.get(field)) for report in reports[:4]]
    if len(values) < 4 or any(v is None for v in values):
        return None
    return sum(values)


def _yoy_growth(reports, field):
    """Latest quarter vs the same quarter one year earlier (decimal ratio)."""
    if len(reports) < 5:
        return None
    current = _safe_float(reports[0].get(field))
    prior = _safe_float(reports[4].get(field))
    if current is None or prior is None or prior == 0:
        return None
    return round((current - prior) / prior, 3)


def _trailing_dividend_per_share(dividends_av):
    """Sum of dividend payments in the trailing 12 months."""
    one_year_ago = date.today() - timedelta(days=365)
    total = 0.0
    for row in dividends_av.get("data", []):
        ex_date = row.get("ex_dividend_date")
        if not ex_date:
            continue
        try:
            if date.fromisoformat(ex_date) < one_year_ago:
                break  # rows are descending by ex-date
        except ValueError:
            continue
        amount = _safe_float(row.get("amount"))
        if amount is not None:
            total += amount
    return total if total else None


def get_overview_av(symbol):
    """Assemble the AV-shaped overview dict (info view contract, 32 keys)."""
    profile = _upstream(
        f"profile:{symbol}",
        lambda: fetch_wisesheets(f"companies/{symbol}", {}),
        ttl_seconds=600,
    )
    if isinstance(profile, Response):
        return profile
    if not profile:
        return {}  # unknown symbol -> info view 400

    live = get_live_row(symbol)
    if isinstance(live, Response):
        return live

    quarterly_payload = _upstream(
        f"statements:{symbol}:quarterly",
        lambda: _get_statements(symbol, "quarterly"),
    )
    if isinstance(quarterly_payload, Response):
        return quarterly_payload
    quarterly = _reports_from_statements(
        quarterly_payload if quarterly_payload else {},
        "income_statement",
        INCOME_STATEMENT_KEYS,
        INCOME_STATEMENT_SOURCES,
    )
    balance = _reports_from_statements(
        quarterly_payload if quarterly_payload else {},
        "balance_sheet",
        BALANCE_SHEET_KEYS,
        BALANCE_SHEET_SOURCES,
    )

    dividends_av = get_dividends_av(symbol)
    if isinstance(dividends_av, Response):
        return dividends_av

    market_cap = _safe_float(live.get("marketCap"))
    shares_outstanding = _safe_float(live.get("sharesOutstanding"))
    price = _safe_float(live.get("price"))
    eps_live = _safe_float(live.get("eps"))
    pe_live = _safe_float(live.get("pe"))

    revenue_ttm = _ttm_sum(quarterly, "totalRevenue")
    gross_profit_ttm = _ttm_sum(quarterly, "grossProfit")
    net_income_ttm = _ttm_sum(quarterly, "netIncome")
    operating_income_ttm = _ttm_sum(quarterly, "operatingIncome")
    ebitda_ttm = _ttm_sum(quarterly, "ebitda")

    eps = eps_live
    if eps is None and net_income_ttm is not None and shares_outstanding not in (None, 0):
        eps = net_income_ttm / shares_outstanding
    diluted_eps = eps

    total_assets = _safe_float(_latest_quarterly(balance, "totalAssets"))
    total_equity = _safe_float(_latest_quarterly(balance, "totalShareholderEquity"))
    total_debt = _safe_float(_latest_quarterly(balance, "shortLongTermDebtTotal"))
    cash = _safe_float(_latest_quarterly(balance, "cashAndCashEquivalentsAtCarryingValue"))

    dividend_per_share = _trailing_dividend_per_share(dividends_av)
    dividend_yield = None
    if dividend_per_share is not None and price not in (None, 0):
        dividend_yield = dividend_per_share / price

    dividend_rows = dividends_av.get("data", [])
    dividend_date = dividend_rows[0].get("payment_date") if dividend_rows else None
    ex_dividend_date = dividend_rows[0].get("ex_dividend_date") if dividend_rows else None

    def _ratio(numerator, denominator):
        if numerator is None or denominator in (None, 0):
            return None
        return numerator / denominator

    def _key(value, digits=2):
        return _fmt(value, digits) if value is not None else "None"

    ev = None
    if market_cap is not None:
        ev = market_cap
        if total_debt is not None:
            ev += total_debt
        if cash is not None:
            ev -= cash

    earnings_yoy = _yoy_growth(quarterly, "netIncome")
    revenue_yoy = _yoy_growth(quarterly, "totalRevenue")

    overview = {
        "Symbol": symbol.upper(),
        "Name": profile.get("name") or "None",
        "Exchange": profile.get("exchange") or "None",
        "FiscalYearEnd": _fiscal_year_end(profile.get("fiscalYearEnd")),
        "Sector": _sector_for_sic(profile.get("sic")),
        "Industry": profile.get("sicDescription") or "None",
        "Country": "United States",
        # live-price strings pass through as-is (AV-style), computed values are
        # reformatted via _key
        "MarketCapitalization": live.get("marketCap") or "None",
        "SharesOutstanding": live.get("sharesOutstanding") or "None",
        "PERatio": live.get("pe") or "None",
        "EPS": live.get("eps") or (_key(eps) if eps is not None else "None"),
        "DilutedEPSTTM": live.get("eps") or (_key(diluted_eps) if diluted_eps is not None else "None"),
        "EBITDA": _key(ebitda_ttm),
        "RevenueTTM": _key(revenue_ttm),
        "GrossProfitTTM": _key(gross_profit_ttm),
        "RevenuePerShareTTM": _key(_ratio(revenue_ttm, shares_outstanding)),
        "ProfitMargin": _key(_ratio(net_income_ttm, revenue_ttm)),
        "OperatingMarginTTM": _key(_ratio(operating_income_ttm, revenue_ttm)),
        "ReturnOnAssetsTTM": _key(_ratio(net_income_ttm, total_assets)),
        "ReturnOnEquityTTM": _key(_ratio(net_income_ttm, total_equity)),
        "QuarterlyEarningsGrowthYOY": _key(earnings_yoy, 3),
        "QuarterlyRevenueGrowthYOY": _key(revenue_yoy, 3),
        "PriceToSalesRatioTTM": _key(_ratio(market_cap, revenue_ttm)),
        "PriceToBookRatio": _key(_ratio(market_cap, total_equity)),
        "EVToRevenue": _key(_ratio(ev, revenue_ttm)),
        "EVToEBITDA": _key(_ratio(ev, ebitda_ttm)),
        "52WeekHigh": live.get("yearHigh") or "None",
        "52WeekLow": live.get("yearLow") or "None",
        "50DayMovingAverage": live.get("priceAvg50") or "None",
        "200DayMovingAverage": live.get("priceAvg200") or "None",
        "DividendPerShare": _key(dividend_per_share),
        "DividendYield": _key(dividend_yield, 4),
        "DividendDate": dividend_date or "None",
        "ExDividendDate": ex_dividend_date or "None",
    }
    return overview
