import jwt
from rest_framework_simplejwt.tokens import RefreshToken
import os
from dotenv import load_dotenv
from django.conf import settings
from django.contrib.auth.models import AnonymousUser


"""
flow: 
    get tokens from cookie
    expired? => refresh it => gets new access and refresh => blacklist the old refresh
    refresh expired or fail? =>  return None

    set_cookie the response from endpoint

"""
load_dotenv()

class AutoRefreshJWTMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        access = request.COOKIES.get("access_token")
        refresh = request.COOKIES.get("refresh_token")

        user = AnonymousUser()
        try:
            user = jwt.decode(access, os.getenv("DJANGO_SECRET_KEY"), algorithms=["HS256"])
        except jwt.DecodeError:
            pass
        except jwt.ExpiredSignatureError:
            try:
                refresh_object = RefreshToken(refresh)
                request.new_access_token = str(refresh_object.access_token)
                request.new_refresh_token = str(refresh_object)
                refresh_object.blacklist() # blacklist the old refresh
                user = jwt.decode(request.new_access_token, os.getenv("DJANGO_SECRET_KEY"), algorithms=["HS256"])
            except Exception:
                pass
        

        request.user = user

        # Continue to view
        response = self.get_response(request)

        # After view is executed
        # set_cookie refresh as well
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
            print("new access is set")

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
            print("new refresh is set")

        return response