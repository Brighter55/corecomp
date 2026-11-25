from rest_framework import serializers

from .models import Split, Transaction


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

    def validate(self, attrs):
        # An exact count is what the holdings engine replays, so a new trade
        # must carry one. Updates skip this because legacy rows predate the
        # fields, and a dividend is cash only.
        if self.instance is not None:
            return attrs
        kind = attrs.get("kind", Transaction.Kind.BUY)
        if kind in (Transaction.Kind.BUY, Transaction.Kind.SELL):
            for field in ("shares", "price"):
                if attrs.get(field) is None:
                    raise serializers.ValidationError(
                        {field: "This field is required for a buy or sell."}
                    )
        return attrs


class SplitSerializer(serializers.ModelSerializer):
    class Meta:
        model = Split
        fields = ["id", "symbol", "effective_date", "numerator", "denominator"]
        read_only_fields = ["id"]

    def validate_symbol(self, value):
        symbol = str(value).strip().upper()
        if not symbol:
            raise serializers.ValidationError("symbol is required")
        return symbol

    def validate_numerator(self, value):
        if value <= 0:
            raise serializers.ValidationError("numerator must be positive")
        return value

    def validate_denominator(self, value):
        if value <= 0:
            raise serializers.ValidationError("denominator must be positive")
        return value
