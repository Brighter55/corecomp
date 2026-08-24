from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework import exceptions
from rest_framework.permissions import AllowAny
from django.middleware.csrf import _does_token_match
from django.conf import settings
import jwt
from django.contrib.auth import get_user_model


User = get_user_model()

class CustomJWTAuthentication(JWTAuthentication):
    """Custom authentication class that reads JWT from cookies"""

    @staticmethod
    def _view_allows_anonymous(request):
        """True when the target view is public (AllowAny). Public endpoints
        must never be rejected by the auth layer's CSRF check — the CSRF
        branch below protects authenticated state changes, and AllowAny views
        have none."""
        view = (request.parser_context or {}).get("view")
        for permission in getattr(view, "permission_classes", None) or []:
            try:
                if issubclass(permission, AllowAny):
                    return True
            except TypeError:  # permission class already instantiated
                if permission is AllowAny:
                    return True
        return False

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

        # CSRF validation for unsafe methods (skipped for AllowAny views)
        if (request.method not in ('GET', 'HEAD', 'OPTIONS', 'TRACE')
                and not self._view_allows_anonymous(request)):
            csrf_cookie = request.COOKIES.get("csrftoken")
            csrf_token = request.META.get('HTTP_X_CSRFTOKEN', '')
            
            if not csrf_cookie:
                raise exceptions.PermissionDenied('CSRF cookie not set.')
            
            if not csrf_token or csrf_token == 'undefined':
                raise exceptions.PermissionDenied('CSRF token missing or invalid.')
            
            if not _does_token_match(csrf_token, csrf_cookie):
                raise exceptions.PermissionDenied('CSRF token verification failed.')

        return (user, None)