from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status
from django.contrib.auth import get_user_model
import json
from dotenv import load_dotenv
import os
import stripe
from .models import StripeEvent
from .utils import get_checkout_status, create_portal, ts_to_dt, create_event
from services import payment_service

# Create your views here.
load_dotenv()
User = get_user_model() # Get model listed in settings.py: AUTH_USER_MODEL = 'accounts.CustomUser'

# stripe
stripe.api_key = os.getenv("STRIPE_API_KEY")
endpoint_secret = os.getenv("STRIPE_ENDPOINT_SECRET")

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def checkout_session(request):
    user = request.user
    try:
        session = payment_service.checkout(user=user)
    except stripe.StripeError as e:
        return Response(status=status.HTTP_502_BAD_GATEWAY)
    return Response({"client_secret": session.client_secret}, status=status.HTTP_200_OK)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def session_status(request):
    try:
        data = json.loads(request.body)
    except json.decoder.JSONDecodeError:
        return Response(status=status.HTTP_400_BAD_REQUEST)

    session_id = data.get("sessionId")

    try:
        session = get_checkout_status(session_id)
    except stripe.InvalidRequestError as e:
        if e.http_status == 404:
            return Response(status=status.HTTP_404_NOT_FOUND)
        return Response(status=status.HTTP_400_BAD_REQUEST)
    except stripe.StripeError:
        return Response(status=status.HTTP_502_BAD_GATEWAY)

    return Response({"status": session.status, "payment_status": session.payment_status}, status=status.HTTP_200_OK)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def portal_session(request):
    return_url = f"{os.getenv('FRONTEND_BASE_URL')}/account"
    customer_id = request.user.customer_id
    if not customer_id:
        return Response(status=status.HTTP_403_FORBIDDEN)
    try:
        session = create_portal(customer_id, return_url)
    except stripe.InvalidRequestError as e:
        if e.http_status == 404:
            return Response(status=status.HTTP_404_NOT_FOUND)
        return Response(status=status.HTTP_400_BAD_REQUEST)
    except stripe.StripeError:
        return Response(status=status.HTTP_502_BAD_GATEWAY)
    return Response({"url": session.url}, status=status.HTTP_200_OK)

@api_view(["POST"])
@permission_classes([AllowAny])
def webhook(request):
    payload = request.body # stripe JSON blob
    sig_header = request.headers.get('stripe-signature')

    try:
        event_object = create_event(
            payload, sig_header, endpoint_secret
        )
    except stripe.SignatureVerificationError as e:
        print('⚠️  Webhook signature verification failed.' + str(e))
        return Response(status=status.HTTP_400_BAD_REQUEST)
    except stripe.StripeError:
        return Response(status=status.HTTP_502_BAD_GATEWAY)

    handled_event_types = [
        "customer.subscription.created",
        "customer.subscription.updated",
        "customer.subscription.deleted",
    ]
    
    # check for idempotentcy
    if StripeEvent.objects.filter(event_id=event_object["id"]).exists():
        return Response({"detail": "reject because the event has been run before"}, status=status.HTTP_200_OK)

    if event_object["type"] not in handled_event_types:
        return Response(status=status.HTTP_200_OK)

    subscription = event_object["data"]["object"]
    # find user
    user = User.objects.get(id=subscription["metadata"]["user_id"])
    # update customer info
    user.customer_id = subscription["customer"]
    user.subscription_id = subscription["id"]
    # update customer's subscription status
    user.subscription_status = subscription["status"]
    user.cancel_at_period_end = subscription["cancel_at_period_end"]
    user.current_period_start = ts_to_dt(subscription["items"]["data"][0]["current_period_start"])
    user.current_period_end = ts_to_dt(subscription["items"]["data"][0]["current_period_end"])
    user.save()

    StripeEvent.objects.create(event_id=event_object["id"], created_at=event_object["created"])

    return Response(status=status.HTTP_200_OK)