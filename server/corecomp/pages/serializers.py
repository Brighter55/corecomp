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

class DipSymbolsSerializer(serializers.Serializer):
    """Batch symbol list for /pages/dip.

    Deliberately does NOT check the Symbol table the way SymbolSerializer does:
    the dip watchlist lives in localStorage, so a ticker that has since dropped
    out of the table must degrade to a single "unknown" row rather than 400 the
    whole chart.
    """

    MAX_SYMBOLS = 20

    symbols = serializers.ListField(
        child=serializers.CharField(max_length=20, allow_blank=False),
        allow_empty=False,
        required=True,
    )

    def validate_symbols(self, value):
        symbols = []
        for symbol in value:
            symbol = symbol.strip().upper()
            if symbol and symbol not in symbols:
                symbols.append(symbol)

        if not symbols:
            raise serializers.ValidationError("no valid symbols provided")

        if len(symbols) > self.MAX_SYMBOLS:
            raise serializers.ValidationError(
                f"at most {self.MAX_SYMBOLS} symbols per request"
            )

        return symbols


class CompositeGraphSerializer(serializers.Serializer):
    graph = serializers.CharField(max_length=100, required=True, allow_blank=False)
    
    ALLOWED_GRAPHS = [
        "ROEPercentage",
        "ROAPercentage",
        "PERatio",
        "PBRatio",
        "MarketCap",
        "PSRatio",
        "PFCFRatio",
    ]
    
    def validate_graph(self, value):
        if value not in self.ALLOWED_GRAPHS:
            raise serializers.ValidationError(
                f"Invalid graph: {value}."
            )
        return value