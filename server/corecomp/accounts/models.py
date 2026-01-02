from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser): # model for User
    subscription_status = models.CharField(max_length=50, null=True)
    customer_id = models.CharField(max_length=50, null=True)
    subscription_id = models.CharField(max_length=50, null=True)
    account_type = models.CharField(max_length=15, null=True)
    current_period_start = models.DateTimeField(null=True, blank=True)
    current_period_end = models.DateTimeField(null=True, blank=True)
    cancel_at_period_end = models.BooleanField(default=False)

