from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework import status
from django.contrib.auth import get_user_model
import json
from dotenv import load_dotenv
import os
import requests
from pages.utils import fetchAlphaVantage
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
    """ prod.
    serializer = SymbolSerializer(data=request.data)
    if serializer.is_valid():
        symbol = serializer.validated_data["symbol"]
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
        return Response({"price": price, "name": name}, status=status.HTTP_200_OK)
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
    """
    serializer = SymbolSerializer(data=request.data)
    if serializer.is_valid():
        symbol = serializer.validated_data["symbol"]
        url = f'https://www.alphavantage.co/query?function=OVERVIEW&symbol={symbol}&apikey={api_key}'

        data = fetchAlphaVantage(url)
        # if "data" is a Response object, then return the error
        if isinstance(data, Response):
            return data

        # check if alphavantage returns {} for invalid symbol or symbol with no data
        if not data:
            return Response({"error": "invalid symbol"}, status=status.HTTP_400_BAD_REQUEST)

        description = data["Description"]
        sector = data["Sector"]
        industry = data["Industry"]
        country = data["Country"]
        exchange = data["Exchange"]
        website = data["OfficialSite"]
        address = data["Address"]
        fiscalYearEnd = data["FiscalYearEnd"]

        return (
            Response({
                "description": description,
                "sector": sector,
                "industry": industry,
                "country": country,
                "exchange": exchange,
                "website": website,
                "address": address,
                "fiscalYearEnd": fiscalYearEnd,
            }, status=status.HTTP_200_OK))
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    """
    # development phase
    # valid case
    return (
        Response({
                "description": "International Business Machines Corporation (IBM) is a leading multinational technology company based in Armonk, New York, with a robust global presence in over 170 countries. Founded in 1911, IBM has consistently been at the forefront of technological innovation, focusing on areas such as artificial intelligence, quantum computing, and cloud computing services. The company is renowned for its strong commitment to research and development, holding the record for the most U.S. patents granted for 28 consecutive years, which underscores its role as a pioneer in the tech industry. With a rich history of impactful inventions including the ATM and relational database systems, IBM continues to adapt and evolve, providing advanced technological solutions that cater to the dynamic needs of multiple sectors in today's fast-paced digital economy.",
                "sector": "TECHNOLOGY",
                "industry": "INFORMATION TECHNOLOGY SERVICES",
                "country": "USA",
                "exchange": "NYSE",
                "website": "https://www.ibm.com",
                "address": "ONE NEW ORCHARD ROAD, ARMONK, NY, UNITED STATES, 10504",
                "fiscalYearEnd": "December",
            }, status=status.HTTP_200_OK)
    )
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

# requests to AlphaVantage and return reports according to period
def get_reports(symbol, period):

    # request for INCOME_STATEMENT
    # Development phase: url = f"https://www.alphavantage.co/query?function=INCOME_STATEMENT&symbol={symbol}&apikey={api_key}"
    url = "https://www.alphavantage.co/query?function=INCOME_STATEMENT&symbol=IBM&apikey=demo"
    response = requests.get(url)
    data = response.json()

    INCOME_STATEMENT = {"annualReports": [], "quarterlyReports": []}
    # get data for annualReports
    for report in data["annualReports"]:
        date = report["fiscalDateEnding"]  # "year-month-day"
        year = date.split("-")[0]
        INCOME_STATEMENT["annualReports"].append({"date": year, "totalRevenue": report["totalRevenue"], "netIncome": report["netIncome"]})
    #get data for quarterlyReports
    for report in data["quarterlyReports"]:
        INCOME_STATEMENT["quarterlyReports"].append({"date": report["fiscalDateEnding"], "totalRevenue": report["totalRevenue"], "netIncome": report["netIncome"]})

    # prepare the data for Recharts by reversing the data
    INCOME_STATEMENT["annualReports"] = list(reversed(INCOME_STATEMENT["annualReports"]))
    INCOME_STATEMENT["quarterlyReports"] = list(reversed(INCOME_STATEMENT["quarterlyReports"]))


    # request for CASH_FLOW
    # Development Phase: url = f"https://www.alphavantage.co/query?function=CASH_FLOW&symbol={symbol}&apikey={api_key}"
    url = "https://www.alphavantage.co/query?function=CASH_FLOW&symbol=IBM&apikey=demo"
    response = requests.get(url)
    data = response.json()

    CASH_FLOW = {"annualReports": [], "quarterlyReports": []}
    for report in data["annualReports"]:
        date = report["fiscalDateEnding"]  # "year-month-day"
        year = date.split("-")[0]
        freeCashflow = int(report["operatingCashflow"]) - int(report["capitalExpenditures"])
        CASH_FLOW["annualReports"].append({"date": year, "operatingCashflow": report["operatingCashflow"], "capitalExpenditures": report["capitalExpenditures"], "freeCashflow": freeCashflow})
    for report in data["quarterlyReports"]:
        freeCashflow = int(report["operatingCashflow"]) - int(report["capitalExpenditures"])
        CASH_FLOW["quarterlyReports"].append({"date": report["fiscalDateEnding"], "operatingCashflow": report["operatingCashflow"], "capitalExpenditures": report["capitalExpenditures"], "freeCashflow": freeCashflow})

    # prepare the data for Recharts by reversing the data
    CASH_FLOW["annualReports"] = list(reversed(CASH_FLOW["annualReports"]))
    CASH_FLOW["quarterlyReports"] = list(reversed(CASH_FLOW["quarterlyReports"]))

    # Development Phase: url = f'https://www.alphavantage.co/query?function=DIVIDENDS&symbol={symbol}&apikey={api_key}'
    url = 'https://www.alphavantage.co/query?function=DIVIDENDS&symbol=IBM&apikey=demo'
    response = requests.get(url)
    data = response.json()
    DIVIDENDS = []
    for dividend in data["data"]:
        DIVIDENDS.append({"payment_date": dividend["payment_date"], "amount": dividend["amount"]})

    DIVIDENDS = list(reversed(DIVIDENDS))


    # request to BALANCE_SHEET
    # Development Phase: url = 'https://www.alphavantage.co/query?function=BALANCE_SHEET&symbol={symbol}&apikey={api_key}'
    url = 'https://www.alphavantage.co/query?function=BALANCE_SHEET&symbol=IBM&apikey=demo'
    response = requests.get(url)
    data = response.json()
    BALANCE_SHEET = {"annualReports": [], "quarterlyReports": []}
    for report in data["annualReports"]:
        date = report["fiscalDateEnding"]  # "year-month-day"
        year = date.split("-")[0]
        BALANCE_SHEET["annualReports"].append({
            "date": year,
            "cash": report["cashAndCashEquivalentsAtCarryingValue"],
            "debt": report["shortLongTermDebtTotal"],
            })
    for report in data["quarterlyReports"]:
        BALANCE_SHEET["quarterlyReports"].append({
            "date": report["fiscalDateEnding"],
            "cash": report["cashAndCashEquivalentsAtCarryingValue"],
            "debt": report["shortLongTermDebtTotal"],
        })

    # prepare the data for Recharts by reversing the data
    BALANCE_SHEET["annualReports"] = list(reversed(BALANCE_SHEET["annualReports"]))
    BALANCE_SHEET["quarterlyReports"] = list(reversed(BALANCE_SHEET["quarterlyReports"]))


    # request to SHARES_OUTSTANDING
    # Development Phase: url = 'https://www.alphavantage.co/query?function=SHARES_OUTSTANDING&symbol={symbol}&apikey={api_key}'
    url = 'https://www.alphavantage.co/query?function=SHARES_OUTSTANDING&symbol=MSFT&apikey=demo'
    response = requests.get(url)
    data = response.json()
    SHARES_OUTSTANDING = []
    for report in data["data"]:
        SHARES_OUTSTANDING.append({"date": report["date"], "shares_outstanding_basic": report["shares_outstanding_basic"]})

    SHARES_OUTSTANDING = list(reversed(SHARES_OUTSTANDING))


    # request to EARNINGS
    # Development Phase: url = 'https://www.alphavantage.co/query?function=EARNINGS&symbol={symbol}&apikey={api_key}'
    url = 'https://www.alphavantage.co/query?function=EARNINGS&symbol=IBM&apikey=demo'
    response = requests.get(url)
    data = response.json()
    EARNINGS = {"annualReports": [], "quarterlyReports": []}
    for report in data["annualEarnings"]:
        date = report["fiscalDateEnding"]  # "year-month-day"
        year = date.split("-")[0]
        EARNINGS["annualReports"].append({"date": year, "reportedEPS": report["reportedEPS"]})
    for report in data["quarterlyEarnings"]:
        EARNINGS["quarterlyReports"].append({
            "date": report["fiscalDateEnding"],
            "reportedEPS": report["reportedEPS"],
            "estimatedEPS": report["estimatedEPS"],
            "surprisePercentage": report["surprisePercentage"],
            })

    EARNINGS["annualReports"] = list(reversed(EARNINGS["annualReports"]))
    EARNINGS["quarterlyReports"] = list(reversed(EARNINGS["quarterlyReports"]))


    # request for PRICING
    # Development Phase: url = f'https://www.alphavantage.co/query?function=TIME_SERIES_MONTHLY_ADJUSTED&symbol={symbol}&apikey={api_key}'
    url = 'https://www.alphavantage.co/query?function=TIME_SERIES_MONTHLY_ADJUSTED&symbol=IBM&apikey=demo'
    response = requests.get(url)
    data = response.json()
    records = data["Monthly Adjusted Time Series"]
    PRICING = []
    for date in records:
        PRICING.append({"date": date, "adjusted close": records[date]["5. adjusted close"]})

    PRICING = list(reversed(PRICING))


    # make reports to send for either occasion
    reports = {}
    reports["DIVIDENDS"] = DIVIDENDS
    reports["SHARES_OUTSTANDING"] = SHARES_OUTSTANDING
    reports["PRICING"] = PRICING
    if period == "annually":
        reports["INCOME_STATEMENT"] = INCOME_STATEMENT["annualReports"]
        reports["CASH_FLOW"] = CASH_FLOW["annualReports"]
        reports["BALANCE_SHEET"] = BALANCE_SHEET["annualReports"]
        reports["EARNINGS"] = EARNINGS["annualReports"]
    elif period == "quarterly":
        reports["INCOME_STATEMENT"] = INCOME_STATEMENT["quarterlyReports"]
        reports["CASH_FLOW"] = CASH_FLOW["quarterlyReports"]
        reports["BALANCE_SHEET"] = BALANCE_SHEET["quarterlyReports"]
        reports["EARNINGS"] = EARNINGS["quarterlyReports"]
    return reports




@api_view(["POST"])
@permission_classes([AllowAny])
def overview(request):
    data = json.loads(request.body)
    symbol = data["symbol"]
    period = data["period"]
    # either get data by fetching or cache
    """
    key = f"fundamentals: {symbol}, {period}"
    cached_reports = cache.get(key)
    if cached_reports:
        return Response(cached_reports, status=status.HTTP_200_OK)

    reports = get_reports(symbol=symbol, period=period)
    """
    # get data from files
    with open(f'{period}.txt', 'r') as f:
        reports_string = f.read()
    reports = eval(reports_string)
    """
    cache.set(key, reports, timeout=3600)
    """
    return Response(reports, status=status.HTTP_200_OK)
