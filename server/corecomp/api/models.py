from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser): # model for User
    subscription_status = models.CharField(max_length=50, null=True)
    customer_id = models.CharField(max_length=50, null=True)
    subscription_id = models.CharField(max_length=50, null=True)
    date_active = models.DateTimeField(null=True, blank=True)

