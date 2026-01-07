import stripe
from datetime import datetime
from django.utils.timezone import make_aware
from dotenv import load_dotenv
import os


load_dotenv()

# stripe
stripe.api_key = os.getenv("STRIPE_API_KEY")

def checkout(mode, line_items, ui_mode, return_url, subscription_data):
    session = stripe.checkout.Session.create(
        mode=mode,
        line_items=line_items,
        ui_mode=ui_mode,
        return_url=return_url,
        subscription_data = subscription_data
    )
    return session

def get_checkout_status(session_id):
    session = stripe.checkout.Session.retrieve(session_id)
    return session

def create_portal(customer_id, return_url):
    session = stripe.billing_portal.Session.create(
        customer=customer_id,
        return_url=return_url,
    )
    return session

def ts_to_dt(timestamp):
    if not timestamp:
        return None
    return make_aware(datetime.fromtimestamp(timestamp))

def create_event(payload, sig_header, endpoint_secret):
    event_object = stripe.Webhook.construct_event(
        payload, sig_header, endpoint_secret
    )
    return event_object
