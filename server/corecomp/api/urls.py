from django.urls import path
from . import views


urlpatterns = [
    # Authorization
    path("sign-up", views.sign_up),
    path("verify-email", views.verify_email),
    path("sign-in", views.CustomTokenObtainPairView.as_view()),
    path("google-authentication", views.google_authentication),
    # Check if user is authorized before restricted page
    path("is-authorized", views.is_authorized),
    # handle access token expires | refresh endpoint
    path("refresh", views.CustomTokenRefreshView.as_view()),
    # Search page
    path("overview", views.overview),
]
