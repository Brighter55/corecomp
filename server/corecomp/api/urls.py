from django.urls import path
from . import views



urlpatterns = [
    # Search page
    path("overview", views.overview),
    # stripe payment
    path("checkout-session", views.checkout_session),
    path("portal-session", views.portal_session),
    path("session-status", views.session_status),
    path("webhook", views.webhook),
]
