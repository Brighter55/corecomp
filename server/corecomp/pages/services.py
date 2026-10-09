import json
from datetime import date
from pathlib import Path

from dotenv import load_dotenv
from rest_framework import status
from rest_framework.response import Response

from pages import trending, wisesheets

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

    def get_dip_row(self, symbol):
        return wisesheets.get_dip_row(symbol)

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

    def get_trending(self):
        """Ranked movers for the landing page, or a Response on upstream error.

        Two batched upstream requests -- one prices/live, one prices/eod over a
        short window -- flat regardless of how many symbols UNIVERSE holds.
        """
        quotes = wisesheets.get_live_rows(trending.UNIVERSE)
        if isinstance(quotes, Response):
            return quotes

        history = wisesheets.get_eod_batch(trending.UNIVERSE, trending.HISTORY_DAYS)
        if isinstance(history, Response):
            return history

        today = date.today()
        return {
            "asOf": today.isoformat(),
            "movers": trending.rank_movers(quotes, history, today),
        }


class MockFinancialDataService:
    def get_dip_row(self, symbol):
        path = SAMPLES_DIR / "dip_rows.json"
        with open(path, 'r') as file:
            data = json.load(file)
        # Keyed by symbol, unlike the single-shape fixtures: a miss here stands
        # in for "symbol not in the API universe".
        return data.get(symbol.upper(), {})

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

    def get_trending(self):
        """Deterministic movers for MOCK=True.

        Built in code rather than read from statement_samples/*.json on purpose.
        Those fixtures are gitignored and generated locally, so a fixture-backed
        payload would 500 on a clean checkout -- and the e2e suite runs MOCK=True
        with routes-and-auth-provider.spec.ts already visiting /overview.
        """
        return {
            "asOf": date.today().isoformat(),
            "movers": [
                {
                    "symbol": "NVDA",
                    "name": "NVIDIA Corporation",
                    "price": 128.84,
                    "percentChange": 3.48,
                    "volume": 48200000,
                    "marketCap": 3160000000000,
                    "spark": [126.10, 126.85, 126.60, 127.90, 127.55, 128.84],
                },
                {
                    "symbol": "MSFT",
                    "name": "Microsoft Corporation",
                    "price": 448.90,
                    "percentChange": 1.85,
                    "volume": 22400000,
                    "marketCap": 3330000000000,
                    "spark": [440.20, 443.10, 441.50, 446.80, 445.20, 448.90],
                },
                {
                    "symbol": "AAPL",
                    "name": "Apple Inc.",
                    "price": 224.23,
                    "percentChange": 1.12,
                    "volume": 52800000,
                    "marketCap": 3440000000000,
                    "spark": [219.40, 218.10, 220.75, 220.10, 222.60, 224.23],
                },
                {
                    "symbol": "AMZN",
                    "name": "Amazon.com, Inc.",
                    "price": 258.29,
                    "percentChange": 0.94,
                    "volume": 34897703,
                    "marketCap": 2778451359000,
                    "spark": [254.10, 255.40, 254.80, 256.90, 257.30, 258.29],
                },
                {
                    "symbol": "META",
                    "name": "Meta Platforms, Inc.",
                    "price": 612.45,
                    "percentChange": 0.61,
                    "volume": 14203600,
                    "marketCap": 1553000000000,
                    "spark": [605.20, 607.80, 606.40, 609.10, 610.30, 612.45],
                },
                {
                    "symbol": "GOOGL",
                    "name": "Alphabet Inc.",
                    "price": 208.16,
                    "percentChange": 0.42,
                    "volume": 24118900,
                    "marketCap": 2530000000000,
                    "spark": [205.60, 206.20, 205.90, 207.10, 207.40, 208.16],
                },
                {
                    "symbol": "AVGO",
                    "name": "Broadcom Inc.",
                    "price": 372.88,
                    "percentChange": 0.18,
                    "volume": 19874500,
                    "marketCap": 1740000000000,
                    "spark": [370.10, 371.40, 370.80, 372.10, 371.90, 372.88],
                },
                {
                    "symbol": "JPM",
                    "name": "JPMorgan Chase & Co.",
                    "price": 298.42,
                    "percentChange": -0.25,
                    "volume": 9213400,
                    "marketCap": 830000000000,
                    "spark": [300.10, 299.40, 299.80, 298.90, 299.10, 298.42],
                },
                {
                    "symbol": "V",
                    "name": "Visa Inc.",
                    "price": 341.07,
                    "percentChange": -0.63,
                    "volume": 7452100,
                    "marketCap": 665000000000,
                    "spark": [344.50, 343.20, 343.80, 342.10, 342.60, 341.07],
                },
                {
                    "symbol": "UNH",
                    "name": "UnitedHealth Group Incorporated",
                    "price": 356.91,
                    "percentChange": -1.04,
                    "volume": 6120800,
                    "marketCap": 328000000000,
                    "spark": [362.40, 360.80, 361.50, 358.20, 359.10, 356.91],
                },
                {
                    "symbol": "XOM",
                    "name": "Exxon Mobil Corporation",
                    "price": 164.05,
                    "percentChange": -1.52,
                    "volume": 18923400,
                    "marketCap": 698000000000,
                    "spark": [168.20, 167.10, 167.60, 165.40, 166.10, 164.05],
                },
                {
                    "symbol": "TSLA",
                    "name": "Tesla, Inc.",
                    "price": 246.30,
                    "percentChange": -2.45,
                    "volume": 79100000,
                    "marketCap": 785400000000,
                    "spark": [252.80, 251.10, 252.30, 247.90, 249.20, 246.30],
                },
            ],
        }

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
