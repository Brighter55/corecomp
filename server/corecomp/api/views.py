from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status
from .serializers import SignUp
from django.contrib.auth.models import User
import json
from dotenv import load_dotenv
import os

load_dotenv()

@api_view(["POST"])
@permission_classes([AllowAny])
def sign_up(request):
    user_data = json.loads(request.body)
    serializer = SignUp(data=user_data)
    if serializer.is_valid():
        email = serializer.validated_data["email"]
        password = serializer.validated_data["password"]
        username = serializer.validated_data["username"]

        User.objects.create_user(username=username, email=email, password=password)
        return Response({"success": "User has been created!"}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def overview(request):
    data = json.loads(request.body)
    symbol = data["symbol"]
    period = data["period"]
    """ comment out temporarily
        # get netIncome and totalRevenue from Income_statement (alphavanatge)
        url = f'https://www.alphavantage.co/query?function=INCOME_STATEMENT&symbol={symbol}&apikey={os.getenv("ALPHAVANTAGE_API")}'
        r = requests.get(url)
        data = r.json()
    """
    with open("dataTest.txt", "r") as file:
        data = json.load(file)
    """
    TODO:
    reports = {
        annualReports: [{date: "2024",totalRevenue: "62753000000", netIncome: "6023000000"}, ...],
        quarterlyReports: [{date: "2024", totalRevenue: "XXXX", netIncome: "XXXX"}, ...],
    })

    return [{date: "2024",totalRevenue: "62753000000", netIncome: "6023000000"}, ...]
    """
    reports = {"annualReports": [], "quarterlyReports": []}
    # make "annualReports"
    for report in data["annualReports"]:
        date = report["fiscalDateEnding"]  # "2024-12-31"
        year = date.split("-")[0]
        reports["annualReports"].append({"totalRevenue": report["totalRevenue"], "netIncome": report["netIncome"], "date": year})
    # make "quarterlyReports"
    for report in data["quarterlyReports"]:
        reports["quarterlyReports"].append({"totalRevenue": report["totalRevenue"], "netIncome": report["netIncome"], "date": report["fiscalDateEnding"]})

    # prepare the data for Recharts by reversing the data
    chronologicalOrder_annualReports = list(reversed(reports["annualReports"]))
    chronologicalOrder_quarterlyReports = list(reversed(reports["quarterlyReports"]))
    reports["annualReports"] = chronologicalOrder_annualReports
    reports["quarterlyReports"] = chronologicalOrder_quarterlyReports

    if period == "annually":
        return Response(reports["annualReports"], status=status.HTTP_200_OK)
    elif period == "quarterly":
        return Response(reports["quarterlyReports"], status=status.HTTP_200_OK)

    return Response({"error": "Period or symbol must be wrong"}, status=status.HTTP_400_BAD_REQUEST)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def is_authorized(request):
    return Response(status=status.HTTP_200_OK)
