from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status
from django.contrib.auth import get_user_model
import json
from dotenv import load_dotenv
import os
import stripe


# Create your views here.
load_dotenv()
User = get_user_model() # Get model listed in settings.py: AUTH_USER_MODEL = 'accounts.CustomUser'

# stripe
stripe.api_key = os.getenv("STRIPE_API_KEY")
endpoint_secret = os.getenv("STRIPE_ENDPOINT_SECRET")

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def checkout_session(request):
    user = request.user
    session = stripe.checkout.Session.create(
        mode="subscription",
        line_items=[{"price": "price_1SN5QcLmRJ2Mkn9vd7R1eYYd", "quantity": 1}],
        ui_mode="embedded",
        return_url="http://localhost:5173/return/{CHECKOUT_SESSION_ID}",
        subscription_data = {
            "trial_period_days": 7,
            "metadata": {
                "user_id": str(user.id),
            },
        }
    )
    return Response({"client_secret": session.client_secret}, status=status.HTTP_200_OK)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def session_status(request):
    data = json.loads(request.body)
    session_id = data["sessionId"]
    session = stripe.checkout.Session.retrieve(session_id)
    customer = stripe.Customer.retrieve(session.customer)

    return Response({"status": session.status, "payment_status": session.payment_status, "customer_email": customer.email}, status=status.HTTP_200_OK)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def portal_session(request):
    return_url = "http://localhost:5173/user-account"
    customer_id = request.user.customer_id
    session = stripe.billing_portal.Session.create(
        customer=customer_id,
        return_url=return_url,
    )
    return Response({"url": session.url}, status=status.HTTP_200_OK)

@api_view(["POST"])
@permission_classes([AllowAny])
def webhook(request):
    payload = request.body #JSON blob

    try:
        event = stripe.Event.construct_from(  # turn JSON into Python and into stripe object to catch any error early-on
        json.loads(payload), stripe.api_key
        )
    except ValueError as e:
        # Invalid payload
        return Response(status=status.HTTP_400_BAD_REQUEST)

    if endpoint_secret:
            # Only verify the event if you've defined an endpoint secret
            # Otherwise, use the basic event deserialized with JSON
            sig_header = request.headers.get('stripe-signature')
            try:
                event = stripe.Webhook.construct_event(
                    payload, sig_header, endpoint_secret
                )
            except stripe.error.SignatureVerificationError as e:
                print('⚠️  Webhook signature verification failed.' + str(e))
                return jsonify(success=False)

    # Handle the event
    if event.type == 'customer.subscription.created':
        subscription = event.data.object
        user = User.objects.get(id=subscription["metadata"]["user_id"])
        user.customer_id = subscription.customer
        user.subscription_id = subscription.id
        user.subscription_status = subscription.status
        user.save()
        print(f"user: {subscription['metadata']['user_id']}s subscription has been activated")
    elif event.type in ["customer.subscription.updated", "customer.subscription.deleted"]:
        subscription = event.data.object
        user = User.objects.get(customer_id=subscription.customer)
        user.subscription_status = subscription.status
        user.save()
    else:
        print('Unhandled event type {}'.format(event.type))

    return Response(status=status.HTTP_200_OK)
