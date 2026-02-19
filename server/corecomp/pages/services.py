from rest_framework.response import Response
from rest_framework import status
import requests
from pages.utils import fetchAlphaVantage
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