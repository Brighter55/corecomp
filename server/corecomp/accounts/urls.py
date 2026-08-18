from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenRefreshView


urlpatterns = [
    # Authentication
    path("google-authentication", views.google_authentication, name="google_authentication"),
    path("sign-out", views.sign_out, name="sign_out"),
    path("me", views.me, name="me"),
    # handle access token expires | refresh endpoint
    path("refresh", TokenRefreshView.as_view(), name="refresh"),
]
