import json
from pathlib import Path

import pytest
from django.contrib.auth import get_user_model
from django.core.cache import cache
from rest_framework.test import APIClient

User = get_user_model()


@pytest.fixture
def overview_payload():
    """A realistic Alpha Vantage-shaped overview dict, for mocking get_overview.

    Committed on purpose. The generated `pages/statement_samples/` fixtures are
    gitignored, so tests that read them passed locally and failed on a clean
    checkout with FileNotFoundError -- the suite was not runnable from a fresh
    clone. This file is tracked and must stay stable; it is test data, not a
    regenerated sample.
    """
    path = Path(__file__).resolve().parent / "pages" / "tests" / "fixtures" / "overview.json"
    return json.loads(path.read_text(encoding="utf-8"))

# represents unauthenticated request
@pytest.fixture
def api_client():
    return APIClient()

# represent authenticated_user in database
@pytest.fixture
def authenticated_user():
    user = User.objects.create_user(username="test", password="12345678", is_active=True)
    return user

# represent authorized_user in database (kept for test compatibility;
# every authenticated user is now fully authorized)
@pytest.fixture
def authorized_user():
    user = User.objects.create_user(username="test", password="12345678", is_active=True)
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
