from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from billings.models import StripeEvent


class Command(BaseCommand):
    help = 'clear stripe events that are older than 60 days'

    # The handle() method contains the main logic of the command
    def handle(self, *args, **option):
        sixty_days_ago_datetime = timezone.now() - timedelta(days=60)
        sixty_days_ago_timestamp = int(sixty_days_ago_datetime.timestamp())
        expired_events = StripeEvent.objects.filter(created_at__lt=sixty_days_ago_timestamp)
        expired_events.delete()


