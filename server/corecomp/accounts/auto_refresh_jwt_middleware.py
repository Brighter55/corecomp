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
    refresh expired or fail? =>  return None

    set_cookie the response from endpoint

"""
load_dotenv()
User = get_user_model()

def get_user_object(user_id):
    user = User.objects.get(id=user_id)
    return user

class AutoRefreshJWTMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        access = request.COOKIES.get("access_token")
        refresh = request.COOKIES.get("refresh_token")

        user = None
        try:
            user_dict = jwt.decode(access, os.getenv("DJANGO_SECRET_KEY"), algorithms=["HS256"])
            user = get_user_object(user_dict["user_id"])
        except jwt.DecodeError:
            if refresh:
                try:
                    #renew the access
                    refresh_object = RefreshToken(refresh)
                    request.new_access_token = str(refresh_object.access_token)
                    
                    refresh_object.blacklist() # blacklist the old refresh

                    user_dict = jwt.decode(request.new_access_token, os.getenv("DJANGO_SECRET_KEY"), algorithms=["HS256"])
                    user = get_user_object(user_dict["user_id"])

                    #renew the refresh
                    new_refresh_object = RefreshToken.for_user(user)
                    request.new_refresh_token = str(new_refresh_object)

                except Exception:
                    pass
        
        request._user = user

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