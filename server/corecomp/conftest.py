import pytest
from rest_framework.test import APIClient

# represents browser
@pytest.fixture
def api_client():
    return APIClient()
