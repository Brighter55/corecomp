import pytest
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model


User = get_user_model()

# represents browser
@pytest.fixture
def api_client():
    return APIClient()

# represent test_user in database
@pytest.fixture
def test_user():
    user = User.objects.create_user(username="test", password="12345678", is_active=True)
    return user

# represent authenticated user
@pytest.fixture
def authenticated_client(api_client, test_user):
    api_client.force_authenticate(user=test_user)
    return api_client
