from django.conf import settings
from django.db import models


class Transaction(models.Model):
    """A manually entered trade or dividend.

    `amount` is the source of truth for money. Every portfolio calculation
    divides a dollar amount by a split-adjusted close, so a split needs no
    stored factor and a share count is derived rather than trusted. `shares` and
    `price` are the numbers the user typed, kept for display and for an advisory
    split check.

    A DIVIDEND row records history the user entered. The analysis endpoint
    computes dividends from the provider instead, so these rows are display
    only and must not be added to the computed total.
    """

    class Kind(models.TextChoices):
        BUY = "BUY", "Buy"
        SELL = "SELL", "Sell"
        DIVIDEND = "DIVIDEND", "Dividend"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="portfolio_transactions",
    )
    symbol = models.CharField(max_length=20)
    trade_date = models.DateField()
    kind = models.CharField(max_length=10, choices=Kind.choices, default=Kind.BUY)
    amount = models.DecimalField(max_digits=18, decimal_places=4)
    shares = models.DecimalField(max_digits=24, decimal_places=8, null=True, blank=True)
    price = models.DecimalField(max_digits=18, decimal_places=4, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["trade_date", "id"]
        indexes = [
            models.Index(fields=["user", "symbol"]),
            models.Index(fields=["user", "trade_date"]),
        ]
        constraints = [
            models.CheckConstraint(
                condition=models.Q(amount__gte=0),
                name="portfolio_transaction_amount_non_negative",
            ),
        ]

    def save(self, *args, **kwargs):
        self.symbol = self.symbol.strip().upper()
        super().save(*args, **kwargs)
