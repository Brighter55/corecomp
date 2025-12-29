from django.urls import path
from . import views

urlpatterns = [
    # stripe payment
    path("checkout-session", views.checkout_session, name="checkout_session"),
    path("portal-session", views.portal_session, name="portal_session"),
    path("session-status", views.session_status, name="session_status"),
    path("webhook", views.webhook, name="webhook"),
]
