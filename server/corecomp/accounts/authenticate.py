from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework import exceptions
from django.middleware.csrf import _does_token_match
from django.conf import settings
import jwt
from django.contrib.auth import get_user_model


User = get_user_model()

class CustomJWTAuthentication(JWTAuthentication):
    """Custom authentication class that reads JWT from cookies"""
    
    def authenticate(self, request):
        # use new access token if renewed
        access_token = getattr(request, 'new_access_token', None)
        
        if not access_token:
            access_token = request.COOKIES.get(settings.SIMPLE_JWT["AUTH_COOKIE"])
        
        if not access_token:
            return None
        
        try:
            user_dict = jwt.decode(access_token, settings.SECRET_KEY, algorithms=["HS256"])
        except (jwt.DecodeError, jwt.ExpiredSignatureError): # only fails if refresh is missing and access is invalid
            return None
        
        try:
            user = User.objects.get(id=user_dict["user_id"])
        except User.DoesNotExist:
            return None
        
        if not user.is_active:
            return None

        # CSRF validation for unsafe methods
        if request.method not in ('GET', 'HEAD', 'OPTIONS', 'TRACE'):
            csrf_cookie = request.COOKIES.get("csrftoken")
            csrf_token = request.META.get('HTTP_X_CSRFTOKEN', '')
            
            if not csrf_cookie:
                raise exceptions.PermissionDenied('CSRF cookie not set.')
            
            if not csrf_token or csrf_token == 'undefined':
                raise exceptions.PermissionDenied('CSRF token missing or invalid.')
            
            if not _does_token_match(csrf_token, csrf_cookie):
                raise exceptions.PermissionDenied('CSRF token verification failed.')

        return (user, None)