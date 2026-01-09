from django.db import models

# Create your models here.
class Symbol(models.Model):
    name = models.CharField(max_length=255)
    symbol = models.CharField(max_length=20)
    type = models.CharField(max_length=10)
