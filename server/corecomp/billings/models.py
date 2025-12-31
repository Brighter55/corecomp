from django.db import models

class StripeEvent(models.Model):
    event_id = models.CharField(max_length=255)
    created_at = models.CharField(max_length=255)
