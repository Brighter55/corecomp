from rest_framework.response import Response
from rest_framework import status
from pages.utils import fetchAlphaVantage
from dotenv import load_dotenv
from pathlib import Path
import os
import json


load_dotenv()
api_key = os.getenv("ALPHAVANTAGE_API_KEY")

# Mock sample data lives next to this file — resolve relative to the file,
# not the working directory, so the server runs from anywhere.
SAMPLES_DIR = Path(__file__).resolve().parent / "statement_samples"


class FinancialDataService:
    def get_current_price(self, symbol):
        url = f'https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol={symbol}&apikey={api_key}'
        data = fetchAlphaVantage(url) # --> dict or Response object
        return data
    
    def get_overview(self, symbol):
        url = f'https://www.alphavantage.co/query?function=OVERVIEW&symbol={symbol}&apikey={api_key}'
        data = fetchAlphaVantage(url)
        return data
    
    def get_income_statement(self, symbol):
        url = f"https://www.alphavantage.co/query?function=INCOME_STATEMENT&symbol={symbol}&apikey={api_key}"
        data = fetchAlphaVantage(url)
        return data
    
    def get_cash_flow(self, symbol):
        url = f"https://www.alphavantage.co/query?function=CASH_FLOW&symbol={symbol}&apikey={api_key}"
        data = fetchAlphaVantage(url)
        return data
    
    def get_balance_sheet(self, symbol):
        url = f"https://www.alphavantage.co/query?function=BALANCE_SHEET&symbol={symbol}&apikey={api_key}"
        data = fetchAlphaVantage(url)
        return data
    
    def get_earnings(self, symbol):
        url = f"https://www.alphavantage.co/query?function=EARNINGS&symbol={symbol}&apikey={api_key}"
        data = fetchAlphaVantage(url)
        return data
    
    def get_dividends(self, symbol):
        url = f"https://www.alphavantage.co/query?function=DIVIDENDS&symbol={symbol}&apikey={api_key}"
        data = fetchAlphaVantage(url)
        return data
    
    def get_pricing(self, symbol):
        url = f"https://www.alphavantage.co/query?function=TIME_SERIES_MONTHLY_ADJUSTED&symbol={symbol}&apikey={api_key}"
        data = fetchAlphaVantage(url)
        return data
           
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