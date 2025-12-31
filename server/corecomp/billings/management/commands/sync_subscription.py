from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
import stripe
import os
from dotenv import load_dotenv
from datetime import datetime
from django.utils.timezone import make_aware

load_dotenv()
User = get_user_model()
stripe.api_key = os.getenv("STRIPE_API_KEY")

class Command(BaseCommand):
    help = "sync subscription status with stripe"

    def handle(self, *arg, **option):
        customers = User.objects.filter(customer_id__isnull=False)
        for customer in customers:
            # get a list of subscription objects
            subscriptions = stripe.Subscription.list(customer=customer.customer_id, limit=1, status="all").data
            if subscriptions:
                def ts_to_dt(timestamp):
                    if not timestamp:
                        return None
                    return make_aware(datetime.fromtimestamp(timestamp))

                subscription = subscriptions[0]
                customer.subscription_status = subscription["status"]
                customer.subscription_id = subscription["id"]
                customer.cancel_at_period_end = subscription["cancel_at_period_end"]
                customer.current_period_end = ts_to_dt(subscription["items"]["data"][0]["current_period_end"])
                customer.current_period_start = ts_to_dt(subscription["items"]["data"][0]["current_period_start"])
                customer.save()





