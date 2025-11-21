from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenRefreshView


urlpatterns = [
    # Authentication
    path("sign-up", views.sign_up),
    path("verify-email", views.verify_email),
    path("sign-in", views.CustomTokenObtainPairView.as_view()),
    path("google-authentication", views.google_authentication),
    path("sign-out", views.sign_out),
    path("reset-password", views.reset_password),
    # Authorization
    path("check-permission", views.check_permission),
    # handle access token expires | refresh endpoint
    path("refresh", TokenRefreshView.as_view()),
    # Search page
    path("overview", views.overview),
    # stripe payment
    path("is-customer", views.is_customer),
    path("checkout-session", views.checkout_session),
    path("portal-session", views.portal_session),
    path("session-status", views.session_status),
    path("webhook", views.webhook),
]
