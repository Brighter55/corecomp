from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status
from django.contrib.auth import get_user_model
import json
from dotenv import load_dotenv
import os
import requests
import stripe



load_dotenv()
User = get_user_model() # Get model listed in settings.py: AUTH_USER_MODEL = 'api.CustomUser'

# stripe
stripe.api_key = os.getenv("STRIPE_API_KEY")
endpoint_secret = os.getenv("STRIPE_ENDPOINT_SECRET")

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def checkout_session(request):
    user = request.user
    session = stripe.checkout.Session.create(
        mode="subscription",
        line_items=[{"price": "price_1SN5QcLmRJ2Mkn9vd7R1eYYd", "quantity": 1}],
        ui_mode="embedded",
        return_url="http://localhost:5173/return/{CHECKOUT_SESSION_ID}",
        subscription_data = {
            "trial_period_days": 7,
            "metadata": {
                "user_id": str(user.id),
            },
        }
    )
    return Response({"client_secret": session.client_secret}, status=status.HTTP_200_OK)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def session_status(request):
    data = json.loads(request.body)
    session_id = data["sessionId"]
    session = stripe.checkout.Session.retrieve(session_id)
    customer = stripe.Customer.retrieve(session.customer)

    return Response({"status": session.status, "payment_status": session.payment_status, "customer_email": customer.email}, status=status.HTTP_200_OK)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def portal_session(request):
    return_url = "http://localhost:5173/user-account"
    customer_id = request.user.customer_id
    session = stripe.billing_portal.Session.create(
        customer=customer_id,
        return_url=return_url,
    )
    return Response({"url": session.url}, status=status.HTTP_200_OK)

@api_view(["POST"])
@permission_classes([AllowAny])
def webhook(request):
    payload = request.body #JSON blob

    try:
        event = stripe.Event.construct_from(  # turn JSON into Python and into stripe object to catch any error early-on
        json.loads(payload), stripe.api_key
        )
    except ValueError as e:
        # Invalid payload
        return Response(status=status.HTTP_400_BAD_REQUEST)

    if endpoint_secret:
            # Only verify the event if you've defined an endpoint secret
            # Otherwise, use the basic event deserialized with JSON
            sig_header = request.headers.get('stripe-signature')
            try:
                event = stripe.Webhook.construct_event(
                    payload, sig_header, endpoint_secret
                )
            except stripe.error.SignatureVerificationError as e:
                print('⚠️  Webhook signature verification failed.' + str(e))
                return jsonify(success=False)

    # Handle the event
    if event.type == 'customer.subscription.created':
        subscription = event.data.object
        user = User.objects.get(id=subscription["metadata"]["user_id"])
        user.customer_id = subscription.customer
        user.subscription_id = subscription.id
        user.subscription_status = subscription.status
        user.save()
        print(f"user: {subscription['metadata']['user_id']}s subscription has been activated")
    elif event.type in ["customer.subscription.updated", "customer.subscription.deleted"]:
        subscription = event.data.object
        user = User.objects.get(customer_id=subscription.customer)
        user.subscription_status = subscription.status
        user.save()
    else:
        print('Unhandled event type {}'.format(event.type))

    return Response(status=status.HTTP_200_OK)

# requests to AlphaVantage and return reports according to period
def get_reports(symbol, period):
    # Development phase: api_key = os.getenv("ALPHAVANTAGE_API_KEY")

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


