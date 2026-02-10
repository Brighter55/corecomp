from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.authentication import CSRFCheck
from rest_framework import exceptions

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
        user = getattr(request, "_user", None)

        if user is None or not user.is_authenticated:
            return None

        enforce_csrf(request)
        return user, None
