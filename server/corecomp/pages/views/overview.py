from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework import status
from django.contrib.auth import get_user_model
import json
from dotenv import load_dotenv
import os
import requests
from pages.utils import fetchAlphaVantage, annotate_profit_margin, annotate_free_cash_flow
from django.core.cache import cache
from django_redis import get_redis_connection
# permission
from accounts.permissions import IsSubscribed
# serializer
from pages.serializers import SymbolSerializer
# model
from pages.models import Symbol


load_dotenv()
User = get_user_model() # Get model listed in settings.py: AUTH_USER_MODEL = 'api.CustomUser'
api_key = os.getenv("ALPHAVANTAGE_API_KEY")


@api_view(["POST"])
@permission_classes([IsSubscribed])
def current_price(request):
    """
    serializer = SymbolSerializer(data=request.data)
    if serializer.is_valid():
        symbol = serializer.validated_data["symbol"]

        key = f"current_price_{symbol}"
        cached_data = cache.get(key)
        if cached_data:
            return Response(cached_data, status=status.HTTP_200_OK)

        url = f'https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol={symbol}&apikey={api_key}'
        data = fetchAlphaVantage(url)

        if isinstance(data, Response):
            return data

        # check if alphavantage returns {} for invalid symbol or symbol with no data
        if not data["Global Quote"]:
            return Response({"error": "invalid symbol"}, status=status.HTTP_400_BAD_REQUEST)

        price = str(round(float(data["Global Quote"]["05. price"]), 2))
        company = Symbol.objects.get(symbol=symbol)
        name = company.name

        report = {"price": price, "name": name}

        cache.set(key, report, timeout=600)
        return Response(report, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    """


    # valid case
    return Response({"price": "302.47", "name": "International Business Machines Corp"}, status=status.HTTP_200_OK)
    """
    # invalid case 400
    return Response({"symbol": ["symbol not in Symbol model"]}, status=status.HTTP_400_BAD_REQUEST)

    # invalid case 503 rate limit
    return Response(
        {"error": "rate limit issue"},
        status=status.HTTP_503_SERVICE_UNAVAILABLE,
        headers={"Retry-After":  "10000"}
    )
    """
@api_view(["POST"])
@permission_classes([IsSubscribed])
def info(request):
    """ prod.
    serializer = SymbolSerializer(data=request.data)
    if serializer.is_valid():
        symbol = serializer.validated_data["symbol"]

        key = f"info_{symbol}"
        cached_data = cache.get(key)
        if cached_data:
            return Response(cached_data, status=status.HTTP_200_OK)

        url = f'https://www.alphavantage.co/query?function=OVERVIEW&symbol={symbol}&apikey={api_key}'

        data = fetchAlphaVantage(url)
        # if "data" is a Response object, then return the error
        if isinstance(data, Response):
            return data

        # check if alphavantage returns {} for invalid symbol or symbol with no data
        if not data:
            return Response({"error": "invalid symbol"}, status=status.HTTP_400_BAD_REQUEST)

        report = {
            "description": data["Description"],
            "sector": data["Sector"],
            "industry": data["Industry"],
            "country": data["Country"],
            "exchange": data["Exchange"],
            "website": data["OfficialSite"],
            "address": data["Address"],
            "fiscalYearEnd": data["FiscalYearEnd"],
            "marketCapitalization": data["MarketCapitalization"],
            "peRatio": data["PERatio"],
            "pegRatio": data["PEGRatio"],
            "priceToSalesRatioTtm": data["PriceToSalesRatioTTM"],
            "priceToBookRatio": data["PriceToBookRatio"],
            "evToRevenue": data["EVToRevenue"],
            "evToEbitda": data["EVToEBITDA"],
            "beta": data["Beta"],
            "sharesOutstanding": data["SharesOutstanding"],
            "ebitda": data["EBITDA"],
            "eps": data["EPS"],
            "dilutedEpsTtm": data["DilutedEPSTTM"],
            "profitMargin": data["ProfitMargin"],
            "operatingMarginTtm": data["OperatingMarginTTM"],
            "returnOnAssetsTtm": data["ReturnOnAssetsTTM"],
            "returnOnEquityTtm": data["ReturnOnEquityTTM"],
            "quarterlyEarningsGrowthYoy": data["QuarterlyEarningsGrowthYOY"],
            "quarterlyRevenueGrowthYoy": data["QuarterlyRevenueGrowthYOY"],
            "revenueTtm": data["RevenueTTM"],
            "grossProfitTtm": data["GrossProfitTTM"],
            "revenuePerShareTtm": data["RevenuePerShareTTM"],
            "fiftyTwoWeekHigh": data["52WeekHigh"],
            "fiftyTwoWeekLow": data["52WeekLow"],
            "fiftyDayMovingAverage": data["50DayMovingAverage"],
            "twoHundredDayMovingAverage": data["200DayMovingAverage"],
            "dividendPerShare": data["DividendPerShare"],
            "dividendYield": data["DividendYield"],
            "dividendDate": data["DividendDate"],
            "exDividendDate": data["ExDividendDate"],
            "analystTargetPrice": data["AnalystTargetPrice"],
            "analystRatingStrongBuy": data["AnalystRatingStrongBuy"],
            "analystRatingBuy": data["AnalystRatingBuy"],
            "analystRatingHold": data["AnalystRatingHold"],
            "analystRatingSell": data["AnalystRatingSell"],
            "analystRatingStrongSell": data["AnalystRatingStrongSell"],
        }
        cache.set(key, report, timeout=604800)
        return Response(report, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    """
    # valid case
    report = {
        "description": "International Business Machines Corporation (IBM) is a leading multinational technology company based in Armonk, New York, with a robust global presence in over 170 countries. Founded in 1911, IBM has consistently been at the forefront of technological innovation, focusing on areas such as artificial intelligence, quantum computing, and cloud computing services. The company is renowned for its strong commitment to research and development, holding the record for the most U.S. patents granted for 28 consecutive years, which underscores its role as a pioneer in the tech industry. With a rich history of impactful inventions including the ATM and relational database systems, IBM continues to adapt and evolve, providing advanced technological solutions that cater to the dynamic needs of multiple sectors in today's fast-paced digital economy.",
        "exchange": "NYSE",
        "country": "USA",
        "sector": "TECHNOLOGY",
        "industry": "INFORMATION TECHNOLOGY SERVICES",
        "address": "ONE NEW ORCHARD ROAD, ARMONK, NY, UNITED STATES, 10504",
        "website": "https://www.ibm.com",
        "fiscalYearEnd": "December",
        "marketCapitalization": "284365160000",
        "ebitda": "15042000000",
        "peRatio": "36.22",
        "pegRatio": "2.082",
        "bookValue": "29.85",
        "dividendPerShare": "6.7",
        "dividendYield": "0.0221",
        "eps": "8.4",
        "revenuePerShareTtm": "70.35",
        "profitMargin": "0.121",
        "operatingMarginTtm": "0.172",
        "returnOnAssetsTtm": "0.0514",
        "returnOnEquityTtm": "0.302",
        "revenueTtm": "65401999000",
        "grossProfitTtm": "37808001000",
        "dilutedEpsTtm": "8.4",
        "quarterlyEarningsGrowthYoy": "0.177",
        "quarterlyRevenueGrowthYoy": "0.091",
        "analystTargetPrice": "301.0",
        "analystRatingStrongBuy": "1",
        "analystRatingBuy": "8",
        "analystRatingHold": "8",
        "analystRatingSell": "2",
        "analystRatingStrongSell": "2",
        "priceToSalesRatioTtm": "4.348",
        "priceToBookRatio": "10.19",
        "evToRevenue": "5.14",
        "evToEbitda": "20.73",
        "beta": "0.698",
        "fiftyTwoWeekHigh": "324.9",
        "fiftyTwoWeekLow": "209.2",
        "fiftyDayMovingAverage": "303.94",
        "twoHundredDayMovingAverage": "273.37",
        "sharesOutstanding": "934735000",
        "dividendDate": "2025-12-10",
        "exDividendDate": "2025-11-10"
    }
    return Response(report, status=status.HTTP_200_OK)
    """
    # invalid case 400
    return Response({"symbol": ["symbol not in Symbol model"]}, status=status.HTTP_400_BAD_REQUEST)

    # invalid case 503 rate limit
    return Response(
        {"error": "rate limit issue"},
        status=status.HTTP_503_SERVICE_UNAVAILABLE,
        headers={"Retry-After":  "10000"}
    )
    """
@api_view(["POST"])
@permission_classes([IsSubscribed])
def income_statement(request):
    """ prod.
    serializer = SymbolSerializer(data=request.data)
    if serializer.is_valid():
        symbol = serializer.validated_data["symbol"]
        redis = get_redis_connection("default")

        key = f"income_statement_{symbol}"
        cached_data = cache.get(key)
        if cached_data:
            return Response(cached_data, status=status.HTTP_200_OK)
        
        lock = redis.lock(f"lock:{key}", timeout=10)
        with lock:
            cached_data = cache.get(key)
            if cached_data:
                return Response(cached_data, status=status.HTTP_200_OK)
            
            url = f"https://www.alphavantage.co/query?function=INCOME_STATEMENT&symbol={symbol}&apikey={api_key}"
            data = fetchAlphaVantage(url)

            if isinstance(data, Response):
                return data
            
            if not data:
                return Response({"error": "invalid symbol"}, status=status.HTTP_400_BAD_REQUEST)
            
            data = annotate_profit_margin(data)
            
            cache.set(key, data, timeout=604800)

        return Response(data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    """
    path = "pages/statement_samples/income_statement.json"
    with open(path, 'r') as file:
        data = json.load(file)
    data = annotate_profit_margin(data)
    return Response(data, status=status.HTTP_200_OK)

@api_view(["POST"])
@permission_classes([IsSubscribed])
def cash_flow(request):
    """
    serializer = SymbolSerializer(data=request.data)
    if serializer.is_valid():
        symbol = serializer.validated_data["symbol"]
        redis = get_redis_connection("default")

        key = f"cash_flow_{symbol}"
        cached_data = cache.get(key)
        if cached_data:
            return Response(cached_data, status=status.HTTP_200_OK)
        
        lock = redis.lock(f"lock:{key}", timeout=10)
        with lock:
            cached_data = cache.get(key)
            if cached_data:
                return Response(cached_data, status=status.HTTP_200_OK)
            
            url = f"https://www.alphavantage.co/query?function=CASH_FLOW&symbol={symbol}&apikey={api_key}"
            data = fetchAlphaVantage(url)

            if isinstance(data, Response):
                return data
            
            if not data:
                return Response({"error": "invalid symbol"}, status=status.HTTP_400_BAD_REQUEST)

            data = annotate_free_cash_flow(data)
            
            cache.set(key, data, timeout=604800)

        return Response(data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    """
    path = "pages/statement_samples/cashflow.json"
    with open(path, 'r') as file:
        data = json.load(file)
    data = annotate_free_cash_flow(data)
    return Response(data, status=status.HTTP_200_OK)


@api_view(["POST"])
@permission_classes([IsSubscribed])
def balance_sheet(request):
    """
    serializer = SymbolSerializer(data=request.data)
    if serializer.is_valid():
        symbol = serializer.validated_data["symbol"]
        redis = get_redis_connection("default")

        key = f"balance_sheet_{symbol}"
        cached_data = cache.get(key)
        if cached_data:
            return Response(cached_data, status=status.HTTP_200_OK)
        
        lock = redis.lock(f"lock:{key}", timeout=10)
        with lock:
            cached_data = cache.get(key)
            if cached_data:
                return Response(cached_data, status=status.HTTP_200_OK)
            
            url = f"https://www.alphavantage.co/query?function=BALANCE_SHEET&symbol={symbol}&apikey={api_key}"
            data = fetchAlphaVantage(url)

            if isinstance(data, Response):
                return data
            
            if not data:
                return Response({"error": "invalid symbol"}, status=status.HTTP_400_BAD_REQUEST)
            
            cache.set(key, data, timeout=604800)

        return Response(data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    """
    path = "pages/statement_samples/balance_sheet.json"
    with open(path, 'r') as file:
        data = json.load(file)
    return Response(data, status=status.HTTP_200_OK)
