from rest_framework_simplejwt.authentication import JWTAuthentication
from django.conf import settings
from rest_framework.authentication import CSRFCheck
from rest_framework import exceptions
from django.contrib.auth.models import AnonymousUser

def enforce_csrf(request):
    """
    Enforce CSRF validation.
    """
    check = CSRFCheck(lambda req: None)
    check.process_request(request)
    reason = check.process_view(request, None, (), {})
    if reason:
        raise exceptions.PermissionDenied('CSRF Failed: %s' % reason)

class CustomJWTAuthentication(JWTAuthentication):
    """Custom authentication class"""
    def authenticate(self, request):
        if hasattr(request, 'user') and not isinstance(request.user, AnonymousUser):
            enforce_csrf(request)
            return request.user, None
        return None