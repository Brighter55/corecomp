from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
import stripe
import os
from dotenv import load_dotenv
from django.utils import timezone


load_dotenv()
User = get_user_model()
stripe.api_key = os.getenv("STRIPE_API_KEY")

class Command(BaseCommand):
    help = "sync subscription status with stripe"

    def handle(self, *arg, **option):
        customers = User.objects.filter(customer_id__isnull=False)
        for customer in customers:
            subscriptions = stripe.Subscription.list(customer=customer.customer_id, limit=1).data
            if subscriptions:
                subscription = subscriptions[0]
                customer.subscription_status = subscription.status
                customer.subscription_id = subscription.id
                customer.cancel_at_period_end = subscription.cancel_at_period_end
                customer.current_period_end = timezone.datetime.fromtimestamp(subscription.current_period_end)
                customer.current_period_start = timezone.datetime.fromtimestamp(subscription.current_period_start)
                customer.save()



