from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status
from .serializers import SignUp
from django.contrib.auth.models import User
import json

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
    user = request.user.username
    data = json.loads(request.body)
    ticker = data["company"]
    period = data["period"]
    return Response({"success": f"Hey this is from django and the user trying to access is {user} and the ticker of a company is {ticker}, and the peirod chosen is {period}"}, status=status.HTTP_200_OK)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def is_authorized(request):
    return Response(status=status.HTTP_200_OK)
