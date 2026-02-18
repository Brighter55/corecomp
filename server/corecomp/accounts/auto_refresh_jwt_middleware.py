import jwt
from rest_framework_simplejwt.tokens import RefreshToken
import os
from dotenv import load_dotenv
from django.conf import settings
from django.contrib.auth import get_user_model


"""
flow: 
    get tokens from cookie
    expired? => refresh it => gets new access and refresh => blacklist the old refresh
             =>  refresh expired or fail? =>  return None

    set_cookie the response from endpoint

"""
load_dotenv()
User = get_user_model()

def get_user_object(user_id):
    user = User.objects.get(id=user_id)
    return user

# middleware - ONLY handles token refresh, doesn't set user
class AutoRefreshJWTMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        access = request.COOKIES.get("access_token")
        refresh = request.COOKIES.get("refresh_token")

        if refresh:
            try:
                jwt.decode(access, os.getenv("DJANGO_SECRET_KEY"), algorithms=["HS256"])
            except (jwt.ExpiredSignatureError, jwt.exceptions.DecodeError):
                try:
                    # refreshing the access token
                    refresh_object = RefreshToken(refresh)
                    request.new_access_token = str(refresh_object.access_token)
                    refresh_object.blacklist()
                    
                    # use the new access token to get the refresh token
                    user_dict = jwt.decode(request.new_access_token, os.getenv("DJANGO_SECRET_KEY"), algorithms=["HS256"])
                    user = get_user_object(user_dict["user_id"])
                    
                    new_refresh_object = RefreshToken.for_user(user)
                    request.new_refresh_token = str(new_refresh_object)
                except Exception:
                    pass

        # continue to view if access is valid
        response = self.get_response(request)

        # Set cookies if tokens were refreshed
        if hasattr(request, "new_access_token"):
            response.set_cookie(
                key=settings.SIMPLE_JWT["AUTH_COOKIE"],
                value=request.new_access_token,
                domain=settings.SIMPLE_JWT["AUTH_COOKIE_DOMAIN"],
                path=settings.SIMPLE_JWT["AUTH_COOKIE_PATH"],
                max_age=settings.SIMPLE_JWT["ACCESS_TOKEN_LIFETIME"],
                secure=settings.SIMPLE_JWT["AUTH_COOKIE_SECURE"],
                httponly=settings.SIMPLE_JWT["AUTH_COOKIE_HTTP_ONLY"],
                samesite=settings.SIMPLE_JWT["AUTH_COOKIE_SAMESITE"],
            )

        if hasattr(request, "new_refresh_token"):
            response.set_cookie(
                key=settings.SIMPLE_JWT["AUTH_REFRESH_COOKIE"],
                value=request.new_refresh_token,
                domain=settings.SIMPLE_JWT["AUTH_COOKIE_DOMAIN"],
                path=settings.SIMPLE_JWT["AUTH_COOKIE_PATH"],
                max_age=settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"],
                secure=settings.SIMPLE_JWT["AUTH_COOKIE_SECURE"],
                httponly=settings.SIMPLE_JWT["AUTH_COOKIE_HTTP_ONLY"],
                samesite=settings.SIMPLE_JWT["AUTH_COOKIE_SAMESITE"],
            )

        return response