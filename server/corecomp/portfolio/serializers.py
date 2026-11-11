from rest_framework import serializers

from .models import Transaction


class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = [
            "id",
            "symbol",
            "trade_date",
            "kind",
            "amount",
            "shares",
            "price",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]

    def validate_symbol(self, value):
        symbol = str(value).strip().upper()
        if not symbol:
            raise serializers.ValidationError("symbol is required")
        return symbol

    def validate_amount(self, value):
        if value < 0:
            raise serializers.ValidationError("amount cannot be negative")
        return value

    def validate_shares(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError("shares cannot be negative")
        return value

    def validate_price(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError("price cannot be negative")
        return value
