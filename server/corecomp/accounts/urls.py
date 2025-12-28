from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenRefreshView


urlpatterns = [
    # Authentication
    path("sign-up", views.sign_up, name="sign_up"),
    path("verify-email", views.verify_email, name="verify_email"),
    path("sign-in", views.CustomTokenObtainPairView.as_view(), name="sign_in"),
    path("google-authentication", views.google_authentication, name="google_authentication"),
    path("sign-out", views.sign_out, name="sign_out"),
    path("reset-password", views.reset_password, name="reset_password"),
    path("confirm-reset-password", views.confirm_reset_password, name="confirm_reset_password"),
    # Authorization
    path("check-permission", views.check_permission, name="check_permission"),
    path("is-customer", views.is_customer, name="is_customer"),
    # handle access token expires | refresh endpoint
    path("refresh", TokenRefreshView.as_view(), name="refresh"),
]
