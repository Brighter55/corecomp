import pytest
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from django.core.cache import cache


User = get_user_model()

# represents unauthenticated request
@pytest.fixture
def api_client():
    return APIClient()

# represent authenticated_user in database
@pytest.fixture
def authenticated_user():
    user = User.objects.create_user(username="test", password="12345678", is_active=True)
    return user

# represent authorized_user in database
@pytest.fixture
def authorized_user():
    user = User.objects.create_user(username="test", password="12345678", is_active=True, subscription_status="active")
    return user

# represent authenticated request
@pytest.fixture
def authenticated_client(api_client, authenticated_user):
    api_client.force_authenticate(user=authenticated_user)
    return api_client

# represent authorized request
@pytest.fixture
def authorized_client(api_client, authorized_user):
    api_client.force_authenticate(user=authorized_user)
    return api_client

# help clear the cache before/after each test run
@pytest.fixture(autouse=True)
def clear_cache_between_tests():
    yield
    cache.clear()
