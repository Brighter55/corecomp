from pages.serializers import CompositeGraphSerializer


class TestCompositeGraphSerializer:
    def test_valid_graph_allowed(self):
        serializer = CompositeGraphSerializer(data={"graph": "ROEPercentage"})
        assert serializer.is_valid()
        assert serializer.validated_data["graph"] == "ROEPercentage"

    def test_invalid_graph_raises_error(self):
        serializer = CompositeGraphSerializer(data={"graph": "InvalidGraph"})
        assert not serializer.is_valid()
        assert "graph" in serializer.errors
        error_message = str(serializer.errors["graph"][0])
        assert "InvalidGraph" in error_message
        assert "Invalid graph" in error_message

    def test_missing_graph_raises_error(self):
        serializer = CompositeGraphSerializer(data={})
        assert not serializer.is_valid()
        assert "graph" in serializer.errors
