from rest_framework.response import Response
from rest_framework import status
from pages.utils import fetchAlphaVantage, compute_roe, compute_pe
from dotenv import load_dotenv
import os
import json


load_dotenv()
api_key = os.getenv("ALPHAVANTAGE_API_KEY")


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
    
    def get_shares_outstanding(self, symbol):
        url = f"https://www.alphavantage.co/query?function=SHARES_OUTSTANDING&symbol={symbol}&apikey={api_key}"
        data = fetchAlphaVantage(url)
        return data
    
    def get_roe_percentage(self, symbol):
        income_statement = self.get_income_statement(symbol)
        balance_sheet = self.get_balance_sheet(symbol)

        if isinstance(income_statement, Response):
            return income_statement
        if isinstance(balance_sheet, Response):
            return balance_sheet

        return compute_roe(income_statement, balance_sheet) 
    
    def get_pe_ratio(self, symbol):
        pricing = self.get_pricing(symbol)
        earnings = self.get_earnings(symbol)

        if isinstance(pricing, Response):
            return pricing
        if isinstance(earnings, Response):
            return earnings
        
        return compute_pe(pricing, earnings)
           
class MockFinancialDataService:
    def get_current_price(self, symbol):
        path = "pages/statement_samples/global_quote.json"
        with open(path, 'r') as file:
            data = json.load(file)
        return data
    
    def get_overview(self, symbol):
        path = "pages/statement_samples/overview.json"
        with open(path, 'r') as file:
            data = json.load(file)
        return data
    
    def get_income_statement(self, symbol):
        path = "pages/statement_samples/income_statement.json"
        with open(path, 'r') as file:
            data = json.load(file)
        return data
    
    def get_cash_flow(self, symbol):
        path = "pages/statement_samples/cashflow.json"
        with open(path, 'r') as file:
            data = json.load(file)
        return data
        
    def get_balance_sheet(self, symbol):
        path = "pages/statement_samples/balance_sheet.json"
        with open(path, 'r') as file:
            data = json.load(file)
        return data
    
    def get_earnings(self, symbol):
        path = "pages/statement_samples/earnings.json"
        with open(path, 'r') as file:
            data = json.load(file)
        return data
    
    def get_dividends(self, symbol):
        path = "pages/statement_samples/dividends.json"
        with open(path, 'r') as file:
            data = json.load(file)
        return data
    
    def get_pricing(self, symbol):
        path = "pages/statement_samples/pricing.json"
        with open(path, 'r') as file:
            data = json.load(file)
        return data
    
    def get_shares_outstanding(self, symbol):
        path = "pages/statement_samples/shares_outstanding.json"
        with open(path, 'r') as file:
            data = json.load(file)
        return data
    
    def get_roe_percentage(self, symbol):
        income_statement = self.get_income_statement(symbol)
        balance_sheet = self.get_balance_sheet(symbol)

        if isinstance(income_statement, Response):
            return income_statement
        if isinstance(balance_sheet, Response):
            return balance_sheet

        return compute_roe(income_statement, balance_sheet)
    
    def get_pe_ratio(self, symbol):
        pricing = self.get_pricing(symbol)
        earnings = self.get_earnings(symbol)

        if isinstance(pricing, Response):
            return pricing
        if isinstance(earnings, Response):
            return earnings
        
        return compute_pe(pricing, earnings)
    
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