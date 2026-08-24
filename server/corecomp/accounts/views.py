from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.middleware.csrf import get_token, rotate_token
import json
from dotenv import load_dotenv
from .utils import verify_google_token
from django.conf import settings


load_dotenv()
User = get_user_model() # Get model listed in settings.py: AUTH_USER_MODEL = 'accounts.CustomUser'

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def me(request):
    user = request.user
    data = {
        "username": user.username,
        "email": user.email,
    }
    return Response(data, status=status.HTTP_200_OK)

@api_view(["POST"])
@permission_classes([AllowAny])
def google_authentication(request): #decodes the JWT to get user's info and create or retrieve account to send access and refresh
    # get JWT from request
    data = request.data
    jwt_token = data["JWTToken"]
    try:
        user_info = verify_google_token(jwt_token)
        email = user_info["email"]

        user = None
        if not User.objects.filter(email=email).exists():
            user = User.objects.create(username=email, email=email, is_active=True)
            user.set_unusable_password()
            user.save()
        # if didn't create user, get user
        if user is None:
            user = User.objects.get(email=email)

        # uses email to generate access and refresh tokens and return them to react
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)

        # issue a fresh CSRF cookie with this response so the browser always has
        # a readable csrftoken (same-site double-submit for authenticated POSTs);
        # CsrfViewMiddleware.process_response sets the cookie from these flags
        rotate_token(request)
        get_token(request)

        response = Response({"access": access_token, "refresh": refresh_token}, status=status.HTTP_200_OK)

        response.set_cookie(
            key=settings.SIMPLE_JWT["AUTH_COOKIE"],
            value=access_token,
            domain=settings.SIMPLE_JWT["AUTH_COOKIE_DOMAIN"],
            path=settings.SIMPLE_JWT["AUTH_COOKIE_PATH"],
            max_age=settings.SIMPLE_JWT["ACCESS_TOKEN_LIFETIME"],
            secure=settings.SIMPLE_JWT["AUTH_COOKIE_SECURE"],
            httponly=settings.SIMPLE_JWT["AUTH_COOKIE_HTTP_ONLY"],
            samesite=settings.SIMPLE_JWT["AUTH_COOKIE_SAMESITE"],
        )

        response.set_cookie(
            key=settings.SIMPLE_JWT["AUTH_REFRESH_COOKIE"],
            value=refresh_token,
            domain=settings.SIMPLE_JWT["AUTH_COOKIE_DOMAIN"],
            path=settings.SIMPLE_JWT["AUTH_COOKIE_PATH"],
            max_age=settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"],
            secure=settings.SIMPLE_JWT["AUTH_COOKIE_SECURE"],
            httponly=settings.SIMPLE_JWT["AUTH_COOKIE_HTTP_ONLY"],
            samesite=settings.SIMPLE_JWT["AUTH_COOKIE_SAMESITE"],
        )

        payload = {
            "username": user.username,
            "email": user.email,
        }
        response.content = json.dumps(payload)
        return response
    except ValueError:
        return Response({"error": "Token is invalid"}, status=status.HTTP_400_BAD_REQUEST)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def sign_out(request):
    refresh_token = request.COOKIES.get("refresh_token")
    try:
        token = RefreshToken(refresh_token)
        token.blacklist()
        response = Response({"success": "Refresh token has been blacklisted successfully"}, status=status.HTTP_200_OK)
        response.delete_cookie(
            key="access_token",
            domain=settings.SIMPLE_JWT["AUTH_COOKIE_DOMAIN"],
            path=settings.SIMPLE_JWT["AUTH_COOKIE_PATH"],
        )
        response.delete_cookie(
            key="refresh_token",
            domain=settings.SIMPLE_JWT["AUTH_COOKIE_DOMAIN"],
            path=settings.SIMPLE_JWT["AUTH_COOKIE_PATH"],
        )
        response.delete_cookie(
            key="csrftoken",
            domain=settings.CSRF_COOKIE_DOMAIN,
            path="/",
        )
        return response
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
