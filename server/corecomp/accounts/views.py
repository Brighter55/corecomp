from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.tokens import default_token_generator, PasswordResetTokenGenerator
from .serializers import SignUp, CustomTokenObtainPairSerializer, ResetPassword, ConfirmResetPassword
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
import json
from dotenv import load_dotenv
import os
import requests
from django.utils.timezone import now
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from .permissions import IsSubscribed
from .utils import verify_google_token


load_dotenv()
User = get_user_model() # Get model listed in settings.py: AUTH_USER_MODEL = 'accounts.CustomUser'

# return error message: "invalid username/password", user.isactive == False
class CustomTokenObtainPairView(TokenObtainPairView):
    # change from default (JSON access and refresh) to cookies once deployed
    serializer_class = CustomTokenObtainPairSerializer

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
    user_data = json.loads(request.body) # request.body = {email: email, username: username, password: password, confirmPassword: confirmPassword}
    serializer = SignUp(data=user_data)
    if serializer.is_valid():
        email = serializer.validated_data["email"]
        password = serializer.validated_data["password"]
        username = serializer.validated_data["username"]

        User.objects.create_user(username=username, email=email, password=password, is_active=False, account_type="manual")
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
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({"error": "User doesn't exist"}, status=status.HTTP_400_BAD_REQUEST)
    # check if user has already activated their account
    if user.is_active == True:
        return Response({"success": "the account is already activated"}, status=status.HTTP_200_OK)
    if default_token_generator.check_token(user, token): # if the token belongs to this user
        # activate account
        user.is_active = True
        user.save()
        return Response({"success": "yep this is valid user account is activated"}, status=status.HTTP_200_OK)
    return Response({"error": "Nope the token is invalid"}, status=status.HTTP_400_BAD_REQUEST)

@api_view(["POST"])
@permission_classes([AllowAny])
def resend_verify_email(request):
    data = json.loads(request.body)
    username = data.get("username")
    user_id = data.get("user_id")
    try:
        if username:
            user = User.objects.get(username=username)
        elif user_id:
            user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({"error": "User doesn't exist"}, status=status.HTTP_400_BAD_REQUEST)
    if user.is_active == True:
        return Response({"error": "account is already active"}, status=status.HTTP_400_BAD_REQUEST)
    token = default_token_generator.make_token(user)
    link = f"http://localhost:5173/account-verification/{token}/{user.id}"
    response = requests.post(
        "https://api.mailgun.net/v3/sandboxcb8d9093dd704fa990c67dc9fb3b0e78.mailgun.org/messages",
        auth=("api", os.getenv("MAILGUN_API_KEY")),
        data={
            "from": "Corecomp <verify@corecomp.cc>",
            "to": "Peter <sriphrakhunpiyawit@gmail.com>", # change to email in prod.
            "subject": "Account Verification Email",
        #   "html": get_html_message(link),
            "text": f"You have successfully created account with us, click the link below to verify your account and activate your trial {link}"
        })
    return Response({"success": "email has been resent"}, status=status.HTTP_200_OK)

@api_view(["POST"])
@permission_classes([AllowAny])
def google_authentication(request): #decodes the JWT to get user's info and create or retrieve account to send access and refresh
    # get JWT from request
    data = json.loads(request.body)
    jwt_token = data["JWTToken"]
    try:
        user_info = verify_google_token(jwt_token)
        email = user_info["email"]
        user, created = User.objects.get_or_create(email=email, defaults={"username": email, "email": email, "is_active": True, "account_type": "google"})
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
        user = User.objects.get(email=email)
        token_generator = PasswordResetTokenGenerator()
        user_id = urlsafe_base64_encode(force_bytes(user.id))
        token = token_generator.make_token(user)
        reset_password_url = f"http://localhost:5173/reset-password/{token}/{user_id}"
        response = requests.post(
            "https://api.mailgun.net/v3/sandboxcb8d9093dd704fa990c67dc9fb3b0e78.mailgun.org/messages",
            auth=("api", os.getenv("MAILGUN_API_KEY")),
            data={"from": "Corecomp <reset-password@corecomp.cc>",
                "to": "Peter <sriphrakhunpiyawit@gmail.com>", # change to email in prod.
                "subject": "Reset Password",
            #   "html": get_html_message(link),
                "text": f"Click the link below to reset your password {reset_password_url}"
            }
        )
        return Response({"success": f"valid email is {email} and email has been sent"}, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(["POST"])
@permission_classes([AllowAny])
def confirm_reset_password(request):
    data = json.loads(request.body)
    serializer = ConfirmResetPassword(data=data)
    if serializer.is_valid():
        user_id = serializer.validated_data["id"]
        new_password = serializer.validated_data["password"]
        user = User.objects.get(id=user_id)
        user.set_password(new_password)
        user.save()
        return Response({"success": "your password has been reset!"}, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def is_customer(request):
    user = request.user
    if user.subscription_status in ["trialing", "active"]: # if user has customer_id, aka, if user has subscribed before and has stripe account
        return Response({"is_customer": True}, status=status.HTTP_200_OK)
    return Response({"is_customer": False}, status=status.HTTP_400_BAD_REQUEST)
