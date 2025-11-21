from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny, BasePermission
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.tokens import default_token_generator
from .serializers import SignUp, CustomTokenObtainPairSerializer, ResetPassword
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
import json
from dotenv import load_dotenv
import os
import requests
from django.core.cache import cache
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from django.utils.timezone import now
from datetime import timedelta
import stripe



load_dotenv()
User = get_user_model() # Get model listed in settings.py: AUTH_USER_MODEL = 'api.CustomUser'

class CustomTokenObtainPairView(TokenObtainPairView):
    # change from default (JSON access and refresh) to cookies once deployed
    serializer_class = CustomTokenObtainPairSerializer


class IsSubscribed(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        if user.subscription_status in ["trialing", "active"]:
            return True
        else:
            return False


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def check_permission(request):
    subscribed = IsSubscribed().has_permission(request, view=None)
    if subscribed:
        permission = "IsSubscribed"
    else:
        permission = "IsAuthenticated"
    return Response({"permission": permission}, status=status.HTTP_200_OK)

@api_view(["POST"])
@permission_classes([AllowAny])
def sign_up(request):
    user_data = json.loads(request.body)
    serializer = SignUp(data=user_data)
    if serializer.is_valid():
        email = serializer.validated_data["email"]
        password = serializer.validated_data["password"]
        username = serializer.validated_data["username"]

        User.objects.create_user(username=username, email=email, password=password, is_active=False)
        # send email verification
        user = User.objects.get(username=username)
        token = default_token_generator.make_token(user)
        link = f"http://localhost:5173/account-verification/{token}/{user.id}"
        response = requests.post(
            "https://api.mailgun.net/v3/sandboxcb8d9093dd704fa990c67dc9fb3b0e78.mailgun.org/messages",
            auth=("api", os.getenv("MAILGUN_API_KEY")),
            data={"from": "Corecomp <verify@corecomp.cc>",
                "to": "Peter <sriphrakhunpiyawit@gmail.com>", # change to email in prod.
                "subject": "Account Verification Email",
             #   "html": get_html_message(link),
                "text": f"You have successfully created account with us, click the link below to verify your account and activate your trial {link}"})
        return Response({"success": "User has been created!"}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(["POST"])
@permission_classes([AllowAny])
def verify_email(request):
    data = json.loads(request.body)
    user_id = data["user_id"]
    token = data["token"]
    # get user object
    user = User.objects.get(id=user_id)
    if default_token_generator.check_token(user, token): # if the token belongs to this user
        # activate account
        user.is_active = True
        user.date_active = now()
        user.save()
        return Response({"success": "yep this is valid user account is activated"}, status=status.HTTP_200_OK)
    return Response({"error": "Nope the token is invalid"}, status=status.HTTP_400_BAD_REQUEST)

@api_view(["POST"])
@permission_classes([AllowAny])
def google_authentication(request): #decodes the JWT to get user's info and create or retrieve account to send access and refresh
    # get JWT from request
    data = json.loads(request.body)
    JWTtoken = data["JWTToken"]
    try:
        user_info = id_token.verify_oauth2_token(JWTtoken, google_requests.Request(), os.getenv("GOOGLE_CLIENT_ID"))
        email = user_info["email"]
        user, created = User.objects.get_or_create(email=email, defaults={"username": email, "email": email, "is_active": True, "date_active": now()})
        if created:
            user.set_unusable_password()
            user.save()
        # uses email to generate access and refresh tokens and return them to react
        refresh = RefreshToken.for_user(user)
        return Response({"access": str(refresh.access_token), "refresh": str(refresh)}, status=status.HTTP_200_OK) # TODO: return these tokens via cookies in prod.
    except ValueError:
        return Response({"error": "Token is invalid"}, status=status.HTTP_400_BAD_REQUEST)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def sign_out(request):
    try:
        refresh_token = request.data["refresh"]
        token = RefreshToken(refresh_token)
        token.blacklist()
        return Response({"success": "Refresh token has been blacklisted successfully"}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(["POST"])
@permission_classes([AllowAny])
def reset_password(request):
    data = json.loads(request.body)
    serializer = ResetPassword(data=data)
    if serializer.is_valid():
        email = serializer.validated_data["email"]
        return Response({"success": f"valid email is {email}"}, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# stripe
stripe.api_key = os.getenv("STRIPE_API_KEY")
endpoint_secret = os.getenv("STRIPE_ENDPOINT_SECRET")

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def is_customer(request):
    user = request.user
    if user.subscription_status in ["trialing", "active"]: # if user has customer_id, aka, if user has subscribed before and has stripe account
        return Response({"is_customer": True}, status=status.HTTP_200_OK)
    return Response({"is_customer": False}, status=status.HTTP_400_BAD_REQUEST)

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
@permission_classes([IsSubscribed])
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


