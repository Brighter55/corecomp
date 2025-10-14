from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser): # model for User
    subscription_active = models.BooleanField(default=False)
