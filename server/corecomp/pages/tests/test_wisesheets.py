"""Unit tests for the WiseSheets -> Alpha Vantage shape mappers.

Pure function tests: no network, no DB. `wisesheets.fetch_wisesheets` is
monkeypatched to return canned payloads, so the endpoint functions and
mappers are exercised end to end.
"""

import json

import pytest
import requests
from rest_framework import status
from rest_framework.response import Response

from pages import wisesheets


@pytest.fixture(autouse=True)
def clear_upstream_cache():
    wisesheets._UPSTREAM_CACHE.clear()
    yield
    wisesheets._UPSTREAM_CACHE.clear()


def _line(metric, value, unit="USD"):
    return {"metric": metric, "label": metric, "value": value, "unit": unit}


def _statement_entry(period_end, statements):
    return {
        "period": {"label": period_end, "end": period_end},
        "filing": {"accessionNumber": "x", "filingDate": "2026-01-01"},
        "statements": statements,
    }


def _statements_payload(entries):
    return {
        "company": {"ticker": "TEST", "cik": "0000000001", "name": "Test Inc."},
        "frequency": "annual",
        "data": entries,
    }


def _income_lines(**overrides):
    lines = {
        "revenue": "1000",
        "gross_profit": "600",
        "cost_of_revenue": "400",
        "operating_income": "250",
        "research_and_development": "100",
        "operating_expenses": "350",
        "ebitda": "300",
        "net_income": "150",
        "net_income_continuing_operations": "140",
        "income_before_tax": "180",
        "income_tax_expense": "30",
        "interest_expense": "10",
        "depreciation_and_amortization": "50",
    }
    lines.update(overrides)
    return [_line(k, v) for k, v in lines.items()]


def _balance_lines(**overrides):
    lines = {
        "total_assets": "5000",
        "total_current_assets": "2000",
        "cash_and_cash_equivalents": "800",
        "short_term_investments": "100",
        "inventory": "300",
        "net_receivables": "400",
        "total_liabilities": "2500",
        "total_current_liabilities": "1000",
        "short_term_debt": "200",
        "long_term_debt": "600",
        "total_debt": "800",
        "shareholders_equity": "2500",
        "retained_earnings": "900",
        "common_stock": "100",
        "common_stock_shares_outstanding": "1000",
        "property_plant_equipment": "1500",
        "goodwill": "300",
    }
    lines.update(overrides)
    return [_line(k, v) for k, v in lines.items()]


def _cash_flow_lines(**overrides):
    lines = {
        "operating_cash_flow": "400",
        "capital_expenditures": "100",
        "depreciation_and_amortization": "50",
        "dividends_paid": "30",
        "net_income": "150",
        "cash_from_investing": "-150",
        "cash_from_financing": "-200",
        "change_in_inventory": "-20",
        "change_in_receivables": "-10",
    }
    lines.update(overrides)
    return [_line(k, v) for k, v in lines.items()]


# ---------------------------------------------------------------------------
# fetch_wisesheets error mapping
# ---------------------------------------------------------------------------


def _mock_response(status_code, payload=None):
    response = requests.Response()
    response.status_code = status_code
    response._content = json.dumps(payload if payload is not None else {}).encode()
    return response


class TestFetchWisesheets:
    def test_success(self, monkeypatch):
        monkeypatch.setenv("WISESHEETS_API_KEY", "wsh_live_test")
        monkeypatch.setattr(
            wisesheets.requests, "get",
            lambda *a, **k: _mock_response(200, {"data": [1]}),
        )
        result = wisesheets.fetch_wisesheets("prices/live", {"tickers": "AAPL"})
        assert result == {"data": [1]}

    def test_missing_api_key(self, monkeypatch):
        monkeypatch.delenv("WISESHEETS_API_KEY", raising=False)
        result = wisesheets.fetch_wisesheets("prices/live", {})
        assert isinstance(result, Response)
        assert result.status_code == 500

    def test_http_429_maps_to_503_with_retry_after(self, monkeypatch):
        monkeypatch.setenv("WISESHEETS_API_KEY", "wsh_live_test")
        monkeypatch.setattr(wisesheets.requests, "get", lambda *a, **k: _mock_response(429))
        result = wisesheets.fetch_wisesheets("prices/live", {})
        assert isinstance(result, Response)
        assert result.status_code == 503
        assert result.data["error"] == "rate limit issue"
        assert result.headers["Retry-After"] == "60000"

    def test_http_401_maps_to_500(self, monkeypatch):
        monkeypatch.setenv("WISESHEETS_API_KEY", "wsh_live_test")
        monkeypatch.setattr(wisesheets.requests, "get", lambda *a, **k: _mock_response(401))
        result = wisesheets.fetch_wisesheets("prices/live", {})
        assert isinstance(result, Response)
        assert result.status_code == 500

    def test_http_404_maps_to_empty_dict(self, monkeypatch):
        monkeypatch.setenv("WISESHEETS_API_KEY", "wsh_live_test")
        monkeypatch.setattr(wisesheets.requests, "get", lambda *a, **k: _mock_response(404))
        assert wisesheets.fetch_wisesheets("companies/AAPL", {}) == {}

    def test_http_500_maps_to_500(self, monkeypatch):
        monkeypatch.setenv("WISESHEETS_API_KEY", "wsh_live_test")
        monkeypatch.setattr(wisesheets.requests, "get", lambda *a, **k: _mock_response(500))
        result = wisesheets.fetch_wisesheets("prices/live", {})
        assert isinstance(result, Response)
        assert result.status_code == 500

    def test_timeout_maps_to_503(self, monkeypatch):
        monkeypatch.setenv("WISESHEETS_API_KEY", "wsh_live_test")
        monkeypatch.setattr(
            wisesheets.requests, "get",
            lambda *a, **k: (_ for _ in ()).throw(requests.Timeout("timeout")),
        )
        result = wisesheets.fetch_wisesheets("prices/live", {})
        assert isinstance(result, Response)
        assert result.status_code == 503
        assert result.headers["Retry-After"] == "60000"


# ---------------------------------------------------------------------------
# Statement mapping
# ---------------------------------------------------------------------------


class TestStatementMapping:
    def test_maps_all_keys_and_sorts_most_recent_first(self, monkeypatch):
        monkeypatch.setenv("WISESHEETS_API_KEY", "wsh_live_test")

        def fake_fetch(endpoint, params):
            if "annual" in params.get("frequency", ""):
                return _statements_payload([
                    _statement_entry("2024-12-31", {
                        "income_statement": {"lines": _income_lines(revenue="1100")},
                    }),
                    _statement_entry("2023-12-31", {
                        "income_statement": {"lines": _income_lines(revenue="900")},
                    }),
                ])
            return _statements_payload([_statement_entry("2024-09-30", {
                "income_statement": {"lines": _income_lines()},
            })])

        monkeypatch.setattr(wisesheets, "fetch_wisesheets", fake_fetch)

        result = wisesheets.get_statements_av(
            "TEST", "income_statement",
            wisesheets.INCOME_STATEMENT_KEYS, wisesheets.INCOME_STATEMENT_SOURCES,
        )
        assert result["symbol"] == "TEST"
        annual = result["annualReports"]
        assert [r["fiscalDateEnding"] for r in annual] == ["2024-12-31", "2023-12-31"]
        assert annual[0]["totalRevenue"] == "1100"
        assert annual[0]["netIncome"] == "150"
        assert annual[0]["grossProfit"] == "600"
        assert annual[0]["ebitda"] == "300"
        assert annual[0]["reportedCurrency"] == "USD"
        # unsourced AV keys are emitted as "None" (annotators index directly)
        assert annual[0]["sellingGeneralAndAdministrative"] == "None"
        assert annual[0]["investmentIncomeNet"] == "None"
        assert all("fiscalDateEnding" in r and "netIncome" in r for r in result["quarterlyReports"])

    def test_camelcase_metric_names_are_matched(self, monkeypatch):
        monkeypatch.setenv("WISESHEETS_API_KEY", "wsh_live_test")
        lines = [_line("netIncome", "777"), _line("grossProfit", "444")]

        def fake_fetch(endpoint, params):
            payload = _statements_payload([_statement_entry("2024-12-31", {
                "income_statement": {"lines": lines},
            })])
            return payload

        monkeypatch.setattr(wisesheets, "fetch_wisesheets", fake_fetch)
        result = wisesheets.get_statements_av(
            "TEST", "income_statement",
            wisesheets.INCOME_STATEMENT_KEYS, wisesheets.INCOME_STATEMENT_SOURCES,
        )
        assert result["annualReports"][0]["netIncome"] == "777"
        assert result["annualReports"][0]["grossProfit"] == "444"

    def test_change_in_inventory_falls_back_to_balance_sheet_delta(self, monkeypatch):
        monkeypatch.setenv("WISESHEETS_API_KEY", "wsh_live_test")

        def fake_fetch(endpoint, params):
            if "annual" in params.get("frequency", ""):
                return _statements_payload([
                    _statement_entry("2024-12-31", {
                        "cash_flow": {"lines": _cash_flow_lines(change_in_inventory=None)},
                        "balance_sheet": {"lines": _balance_lines(inventory="400")},
                    }),
                    _statement_entry("2023-12-31", {
                        "cash_flow": {"lines": _cash_flow_lines(change_in_inventory=None)},
                        "balance_sheet": {"lines": _balance_lines(inventory="300")},
                    }),
                ])
            return _statements_payload([])

        monkeypatch.setattr(wisesheets, "fetch_wisesheets", fake_fetch)
        result = wisesheets.get_statements_av(
            "TEST", "cash_flow",
            wisesheets.CASH_FLOW_KEYS, wisesheets.CASH_FLOW_SOURCES,
        )
        annual = result["annualReports"]
        # sorted most recent first: 2024 row sees inventory 400 vs 300 prior
        assert annual[0]["changeInInventory"] == "100.0"
        assert annual[1]["changeInInventory"] == "None"  # no prior period
        # direct metric still wins when present
        assert annual[0]["operatingCashflow"] == "400"
        assert annual[0]["capitalExpenditures"] == "100"
        assert annual[0]["cashflowFromInvestment"] == "-150"
        assert annual[0]["dividendPayoutCommonStock"] == "30"

    def test_unknown_symbol_returns_empty(self, monkeypatch):
        monkeypatch.setenv("WISESHEETS_API_KEY", "wsh_live_test")
        monkeypatch.setattr(
            wisesheets, "fetch_wisesheets",
            lambda endpoint, params: {},
        )
        result = wisesheets.get_statements_av(
            "ZZZZ", "income_statement",
            wisesheets.INCOME_STATEMENT_KEYS, wisesheets.INCOME_STATEMENT_SOURCES,
        )
        assert result == {}


# ---------------------------------------------------------------------------
# Earnings
# ---------------------------------------------------------------------------


class TestEarnings:
    def test_eps_from_statement_lines(self, monkeypatch):
        monkeypatch.setenv("WISESHEETS_API_KEY", "wsh_live_test")

        def fake_fetch(endpoint, params):
            if "annual" in params.get("frequency", ""):
                return _statements_payload([
                    _statement_entry("2024-12-31", {
                        "income_statement": {"lines": _income_lines(**{"eps": "1.50"})},
                    }),
                ])
            return _statements_payload([
                _statement_entry("2024-09-30", {
                    "income_statement": {"lines": _income_lines(**{"eps": "0.40"})},
                }),
            ])

        monkeypatch.setattr(wisesheets, "fetch_wisesheets", fake_fetch)
        result = wisesheets.get_earnings_av("TEST")
        assert result["annualEarnings"][0]["reportedEPS"] == "1.50"
        assert result["quarterlyEarnings"][0]["reportedEPS"] == "0.40"
        # estimate fields are gone
        assert "estimatedEPS" not in result["quarterlyEarnings"][0]
        assert "surprisePercentage" not in result["quarterlyEarnings"][0]

    def test_eps_falls_back_to_net_income_over_shares(self, monkeypatch):
        monkeypatch.setenv("WISESHEETS_API_KEY", "wsh_live_test")

        def fake_fetch(endpoint, params):
            if "annual" in params.get("frequency", ""):
                return _statements_payload([
                    _statement_entry("2024-12-31", {
                        "income_statement": {"lines": _income_lines()},  # no eps key
                        "balance_sheet": {"lines": _balance_lines()},    # shares 1000
                    }),
                ])
            return _statements_payload([])

        monkeypatch.setattr(wisesheets, "fetch_wisesheets", fake_fetch)
        result = wisesheets.get_earnings_av("TEST")
        # net_income 150 / 1000 shares
        assert result["annualEarnings"][0]["reportedEPS"] == "0.15"


# ---------------------------------------------------------------------------
# Pricing (EOD -> monthly AV series)
# ---------------------------------------------------------------------------


class TestPricing:
    def test_downsample_to_last_day_of_month(self, monkeypatch):
        monkeypatch.setenv("WISESHEETS_API_KEY", "wsh_live_test")

        def fake_fetch(endpoint, params):
            return {
                "data": [
                    {"symbol": "TEST", "date": "2026-01-05", "close": "100", "adjClose": "99"},
                    {"symbol": "TEST", "date": "2026-01-30", "close": "110", "adjClose": "109"},
                    {"symbol": "TEST", "date": "2026-02-27", "close": "120", "adjClose": "119"},
                ],
                "meta": {"requested": 1, "returned": 3},
            }

        monkeypatch.setattr(wisesheets, "fetch_wisesheets", fake_fetch)
        result = wisesheets.get_pricing_av("TEST")
        series = result["Monthly Adjusted Time Series"]
        assert list(series) == ["2026-01-30", "2026-02-27"]
        assert series["2026-01-30"] == {"4. close": "110", "5. adjusted close": "109"}

    def test_unknown_symbol_returns_empty(self, monkeypatch):
        monkeypatch.setenv("WISESHEETS_API_KEY", "wsh_live_test")
        monkeypatch.setattr(
            wisesheets, "fetch_wisesheets",
            lambda endpoint, params: {"data": [], "meta": {"unknownSymbols": ["ZZZZ"]}},
        )
        assert wisesheets.get_pricing_av("ZZZZ") == {}


# ---------------------------------------------------------------------------
# Live price / current price
# ---------------------------------------------------------------------------


class TestCurrentPrice:
    def test_live_row_maps_to_global_quote(self, monkeypatch):
        monkeypatch.setenv("WISESHEETS_API_KEY", "wsh_live_test")
        monkeypatch.setattr(
            wisesheets, "fetch_wisesheets",
            lambda endpoint, params: {"data": [{"symbol": "AAPL", "price": "190.12"}]},
        )
        from pages.services import FinancialDataService

        result = FinancialDataService().get_current_price("AAPL")
        assert result == {"Global Quote": {"05. price": "190.12"}}

    def test_unknown_symbol_returns_empty_global_quote(self, monkeypatch):
        monkeypatch.setenv("WISESHEETS_API_KEY", "wsh_live_test")
        monkeypatch.setattr(
            wisesheets, "fetch_wisesheets",
            lambda endpoint, params: {"data": [], "meta": {"unknownSymbols": ["ZZZZ"]}},
        )
        from pages.services import FinancialDataService

        assert FinancialDataService().get_current_price("ZZZZ") == {"Global Quote": {}}


# ---------------------------------------------------------------------------
# Dividends
# ---------------------------------------------------------------------------


class TestDividends:
    def test_rows_map_to_av_shape(self, monkeypatch):
        monkeypatch.setenv("WISESHEETS_API_KEY", "wsh_live_test")
        monkeypatch.setattr(
            wisesheets, "fetch_wisesheets",
            lambda endpoint, params: {
                "data": [
                    {"symbol": "IBM", "date": "2026-02-10", "dividend": "0.24",
                     "recordDate": "2026-02-11", "paymentDate": "2026-03-10",
                     "declarationDate": "2026-01-30"},
                ],
                "meta": {},
            },
        )
        result = wisesheets.get_dividends_av("IBM")
        row = result["data"][0]
        assert row == {
            "ex_dividend_date": "2026-02-10",
            "declaration_date": "2026-01-30",
            "record_date": "2026-02-11",
            "payment_date": "2026-03-10",
            "amount": "0.24",
        }

    def test_non_payer_returns_empty_data(self, monkeypatch):
        monkeypatch.setenv("WISESHEETS_API_KEY", "wsh_live_test")
        monkeypatch.setattr(
            wisesheets, "fetch_wisesheets",
            lambda endpoint, params: {"data": [], "meta": {"missingSymbols": ["TSLA"]}},
        )
        assert wisesheets.get_dividends_av("TSLA") == {"symbol": "TSLA", "data": []}


# ---------------------------------------------------------------------------
# Overview assembly
# ---------------------------------------------------------------------------


def _quarterly_payload():
    quarters = [
        ("2026-06-30", 100, 40),  # netIncome, revenue
        ("2026-03-31", 80, 35),
        ("2025-12-31", 90, 38),
        ("2025-09-30", 70, 30),
        ("2025-06-30", 50, 25),
    ]
    entries = []
    for period_end, net_income, revenue in quarters:
        income_lines = _income_lines(net_income=str(net_income), revenue=str(revenue))
        income_lines.append(_line("gross_profit", str(int(revenue * 0.6))))
        income_lines.append(_line("operating_income", str(int(revenue * 0.3))))
        income_lines.append(_line("ebitda", str(int(revenue * 0.35))))
        entries.append(_statement_entry(period_end, {
            "income_statement": {"lines": income_lines},
            "balance_sheet": {"lines": _balance_lines(
                total_assets="5000",
                shareholders_equity="2500",
            )},
        }))
    return _statements_payload(entries)


def _overview_fake_fetch(endpoint, params):
    if endpoint.startswith("companies/"):
        return {
            "ticker": "TEST", "cik": "0000000001", "name": "Test Corp",
            "exchange": "NYSE", "sic": "3571", "sicDescription": "Electronic Computers",
            "fiscalYearEnd": "0926",
        }
    if endpoint == "prices/live":
        return {"data": [{
            "symbol": "TEST", "price": "100", "marketCap": "1000000",
            "pe": "20", "eps": "5", "sharesOutstanding": "10000",
            "yearHigh": "120", "yearLow": "80",
            "priceAvg50": "105", "priceAvg200": "100",
        }]}
    if endpoint == "dividends":
        return {"data": [
            {"symbol": "TEST", "date": "2026-07-01", "dividend": "0.25",
             "recordDate": "2026-07-02", "paymentDate": "2026-07-20", "declarationDate": "2026-06-01"},
            {"symbol": "TEST", "date": "2026-04-01", "dividend": "0.25",
             "recordDate": "2026-04-02", "paymentDate": "2026-04-20", "declarationDate": "2026-03-01"},
            {"symbol": "TEST", "date": "2026-01-02", "dividend": "0.25",
             "recordDate": "2026-01-03", "paymentDate": "2026-01-20", "declarationDate": "2025-12-01"},
            {"symbol": "TEST", "date": "2025-10-01", "dividend": "0.25",
             "recordDate": "2025-10-02", "paymentDate": "2025-10-20", "declarationDate": "2025-09-01"},
            {"symbol": "TEST", "date": "2025-01-05", "dividend": "0.25",
             "recordDate": "2025-01-06", "paymentDate": "2025-01-20", "declarationDate": "2024-12-01"},
        ]}
    if endpoint.startswith("statements/"):
        return _quarterly_payload()
    return {"data": [], "meta": {}}


class TestOverview:
    def test_assembles_all_32_kept_keys(self, monkeypatch):
        monkeypatch.setenv("WISESHEETS_API_KEY", "wsh_live_test")
        monkeypatch.setattr(wisesheets, "fetch_wisesheets", _overview_fake_fetch)

        overview = wisesheets.get_overview_av("TEST")
        assert overview["Symbol"] == "TEST"
        assert overview["Name"] == "Test Corp"
        assert overview["Exchange"] == "NYSE"
        assert overview["Sector"] == "TECHNOLOGY"          # SIC 3571
        assert overview["Industry"] == "Electronic Computers"
        assert overview["Country"] == "United States"
        assert overview["FiscalYearEnd"] == "September"    # "0926" -> month name

        # live price passthrough
        assert overview["MarketCapitalization"] == "1000000"
        assert overview["SharesOutstanding"] == "10000"
        assert overview["PERatio"] == "20"
        assert overview["EPS"] == "5"
        assert overview["52WeekHigh"] == "120"
        assert overview["50DayMovingAverage"] == "105"

        # TTM math: quarters net 100+80+90+70=340, revenue 40+35+38+30=143
        assert overview["RevenueTTM"] == "143.0"
        assert overview["EBITDA"] == "49.0"                # int-truncated 0.35 * revenue per quarter
        assert overview["ProfitMargin"] == "2.38"          # 340/143 -> %

        # YoY growth: latest quarter 100 vs same quarter prior year 50
        assert overview["QuarterlyEarningsGrowthYOY"] == "1.0"
        assert overview["QuarterlyRevenueGrowthYOY"] == "0.6"  # (40-25)/25

        # dividends: 4 payments in trailing 12 months
        assert overview["DividendPerShare"] == "1.0"
        assert overview["DividendYield"] == "0.01"          # 1.0 / 100
        assert overview["DividendDate"] == "2026-07-20"
        assert overview["ExDividendDate"] == "2026-07-01"

        # removed fields are never emitted
        for key in ("Description", "OfficialSite", "Address", "PEGRatio", "Beta",
                    "AnalystTargetPrice", "AnalystRatingStrongBuy", "AnalystRatingBuy",
                    "AnalystRatingHold", "AnalystRatingSell", "AnalystRatingStrongSell"):
            assert key not in overview

    def test_unknown_symbol_returns_empty(self, monkeypatch):
        monkeypatch.setenv("WISESHEETS_API_KEY", "wsh_live_test")
        monkeypatch.setattr(
            wisesheets, "fetch_wisesheets",
            lambda endpoint, params: {} if endpoint.startswith("companies/") else {"data": [], "meta": {}},
        )
        assert wisesheets.get_overview_av("ZZZZ") == {}

    def test_missing_inputs_yield_none_not_keyerror(self, monkeypatch):
        monkeypatch.setenv("WISESHEETS_API_KEY", "wsh_live_test")

        def sparse_fetch(endpoint, params):
            if endpoint.startswith("companies/"):
                return {"ticker": "TEST", "name": "Test Corp", "exchange": "NYSE"}
            if endpoint == "prices/live":
                return {"data": [{"symbol": "TEST", "price": "100"}]}  # no marketCap/pe
            if endpoint == "dividends":
                return {"data": [], "meta": {"missingSymbols": ["TEST"]}}
            return _quarterly_payload()

        monkeypatch.setattr(wisesheets, "fetch_wisesheets", sparse_fetch)
        overview = wisesheets.get_overview_av("TEST")
        assert overview["MarketCapitalization"] == "None"
        assert overview["PERatio"] == "None"
        assert overview["DividendYield"] == "None"
        assert overview["PriceToBookRatio"] == "None"
        assert overview["Sector"] == "None"  # no sic -> unmapped


# ---------------------------------------------------------------------------
# Import command helpers
# ---------------------------------------------------------------------------


class TestImportFilter:
    def test_name_denylist(self):
        from pages.management.commands.import_symbol_model import NAME_DENYLIST
        assert NAME_DENYLIST.search("Vanguard S&P 500 ETF")
        assert NAME_DENYLIST.search("Some Growth Fund")
        assert NAME_DENYLIST.search("Master Limited Partnership")
        assert NAME_DENYLIST.search("JPMorgan Chase & Co") is None
        assert NAME_DENYLIST.search("Realty Income Trust") is None  # REIT kept
