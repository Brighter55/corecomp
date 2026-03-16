from rest_framework import serializers
from pages.models import Symbol


class SymbolSerializer(serializers.Serializer):
    symbol = serializers.CharField(max_length=20, required=True, allow_blank=False)

    def validate_symbol(self, value):
        value = value.upper()

        # check if the symbol is in the database
        if not Symbol.objects.filter(symbol=value).exists():
            raise serializers.ValidationError("symbol not in Symbol model")

        return value

class CompositeGraphSerializer(serializers.Serializer):
    graph = serializers.CharField(max_length=100, required=True, allow_blank=False)
    
    ALLOWED_GRAPHS = [
        "ROEPercentage"
    ]
    
    def validate_graph(self, value):
        if value not in self.ALLOWED_GRAPHS:
            raise serializers.ValidationError(
                f"Invalid graph: {value}."
            )
        return value