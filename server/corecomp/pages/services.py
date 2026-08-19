from rest_framework.response import Response
from rest_framework import status
from dotenv import load_dotenv
from pathlib import Path
import json
from pages import wisesheets


load_dotenv()

# Mock sample data lives next to this file — resolve relative to the file,
# not the working directory, so the server runs from anywhere.
SAMPLES_DIR = Path(__file__).resolve().parent / "statement_samples"


class FinancialDataService:
    """Live data provider backed by the WiseSheets API.

    Every method returns an Alpha Vantage-shaped dict (the contract the views,
    annotators and computators in pages/utils.py consume) or a DRF Response for
    errors. The mapping from WiseSheets responses lives in pages/wisesheets.py.
    """

    def get_current_price(self, symbol):
        live = wisesheets.get_live_row(symbol)
        if isinstance(live, Response):
            return live
        price = live.get("price")
        if not price:
            return {"Global Quote": {}}  # invalid symbol -> view 400
        return {"Global Quote": {"05. price": price}}

    def get_overview(self, symbol):
        return wisesheets.get_overview_av(symbol)

    def get_income_statement(self, symbol):
        return wisesheets.get_statements_av(
            symbol, "income_statement",
            wisesheets.INCOME_STATEMENT_KEYS, wisesheets.INCOME_STATEMENT_SOURCES,
            computed={"ebitda": wisesheets._computed_ebitda},
        )

    def get_cash_flow(self, symbol):
        return wisesheets.get_statements_av(
            symbol, "cash_flow",
            wisesheets.CASH_FLOW_KEYS, wisesheets.CASH_FLOW_SOURCES,
        )

    def get_balance_sheet(self, symbol):
        return wisesheets.get_statements_av(
            symbol, "balance_sheet",
            wisesheets.BALANCE_SHEET_KEYS, wisesheets.BALANCE_SHEET_SOURCES,
            computed={"shortLongTermDebtTotal": wisesheets._computed_total_debt},
        )

    def get_earnings(self, symbol):
        return wisesheets.get_earnings_av(symbol)

    def get_dividends(self, symbol):
        return wisesheets.get_dividends_av(symbol)

    def get_pricing(self, symbol):
        return wisesheets.get_pricing_av(symbol)

class MockFinancialDataService:
    def get_current_price(self, symbol):
        path = SAMPLES_DIR / "global_quote.json"
        with open(path, 'r') as file:
            data = json.load(file)
        return data

    def get_overview(self, symbol):
        path = SAMPLES_DIR / "overview.json"
        with open(path, 'r') as file:
            data = json.load(file)
        return data

    def get_income_statement(self, symbol):
        path = SAMPLES_DIR / "income_statement.json"
        with open(path, 'r') as file:
            data = json.load(file)
        return data

    def get_cash_flow(self, symbol):
        path = SAMPLES_DIR / "cashflow.json"
        with open(path, 'r') as file:
            data = json.load(file)
        return data

    def get_balance_sheet(self, symbol):
        path = SAMPLES_DIR / "balance_sheet.json"
        with open(path, 'r') as file:
            data = json.load(file)
        return data

    def get_earnings(self, symbol):
        path = SAMPLES_DIR / "earnings.json"
        with open(path, 'r') as file:
            data = json.load(file)
        return data

    def get_dividends(self, symbol):
        path = SAMPLES_DIR / "dividends.json"
        with open(path, 'r') as file:
            data = json.load(file)
        return data

    def get_pricing(self, symbol):
        path = SAMPLES_DIR / "pricing.json"
        with open(path, 'r') as file:
            data = json.load(file)
        return data

    def get_rate_limit_error(self):
        # invalid case 503 rate limit
        return Response(
            {"error": "rate limit issue"},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
            headers={"Retry-After":  "10000"}
        )

    def get_invalid_request(self):
        return Response(
            {"error": "invalid api call issue"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
