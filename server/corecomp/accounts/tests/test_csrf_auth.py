import json
from pathlib import Path
from unittest.mock import patch

import pytest
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework_simplejwt.tokens import RefreshToken

from pages.models import Symbol

User = get_user_model()


def access_token_for(user):
    """Valid access-token cookie value for a real user (bypasses
    force_authenticate so CustomJWTAuthentication's CSRF branch runs)."""
    return str(RefreshToken.for_user(user).access_token)


# Regression: an AllowAny endpoint must not 403 from the auth layer's CSRF
# check just because the browser holds a valid access_token cookie. Before
# the fix this returned 403 "CSRF cookie not set." on every authenticated POST.
@pytest.mark.django_db
def test_symbol_search_authenticated_post_without_csrf(api_client, authenticated_user):
    Symbol(
        symbol="IBM",
        name="International Business Machines Corp",
        type="Stock",
    ).save()
    api_client.credentials(HTTP_COOKIE=f"access_token={access_token_for(authenticated_user)}")

    response = api_client.post(reverse("symbol_search"), {"symbol": "IB"}, format="json")

    assert response.status_code == 200
    assert response.json() == [
        {"name": "International Business Machines Corp", "symbol": "IBM"}
    ]


# CSRF is still enforced for authenticated requests to quota views (non-public).
@pytest.mark.django_db
def test_quota_view_authenticated_post_requires_csrf(api_client, authenticated_user):
    api_client.credentials(HTTP_COOKIE=f"access_token={access_token_for(authenticated_user)}")

    response = api_client.post(reverse("info"), {"symbol": "IBM"}, format="json")

    assert response.status_code == 403


@pytest.mark.django_db
def test_quota_view_authenticated_post_rejects_wrong_csrf(api_client, authenticated_user):
    api_client.credentials(
        HTTP_COOKIE=f"access_token={access_token_for(authenticated_user)}; csrftoken={'A' * 32}",
        HTTP_X_CSRFTOKEN="B" * 32,
    )

    response = api_client.post(reverse("info"), {"symbol": "IBM"}, format="json")

    assert response.status_code == 403


# Authenticated POST passes when the csrftoken cookie and X-CSRFToken header
# match (cookie-only double-submit; secret chars must be CSRF_ALLOWED_CHARS).
@patch("pages.views.overview.financial_data_service.get_overview")
@pytest.mark.django_db
def test_quota_view_authenticated_post_with_valid_csrf(mock_get_overview, api_client, authenticated_user):
    Symbol(
        symbol="IBM",
        name="International Business Machines Corp",
        type="Stock",
    ).save()
    path = Path(__file__).resolve().parents[2] / "pages" / "statement_samples" / "overview.json"
    with open(path, "r") as file:
        mock_get_overview.return_value = json.load(file)
    secret = "A" * 32
    api_client.credentials(
        HTTP_COOKIE=f"access_token={access_token_for(authenticated_user)}; csrftoken={secret}",
        HTTP_X_CSRFTOKEN=secret,
    )

    response = api_client.post(reverse("info"), {"symbol": "IBM"}, format="json")

    assert response.status_code == 200


# The login response must Set-Cookie the csrftoken so the browser has a
# readable CSRF token for subsequent authenticated POSTs.
@pytest.mark.django_db
@patch("accounts.views.verify_google_token")
def test_google_sign_in_sets_csrf_cookie(mock_verify, api_client):
    User.objects.create_user(username="test@gmail.com", is_active=True, email="test@gmail.com")
    mock_verify.return_value = {
        "sub": "123",
        "email": "test@gmail.com",
        "name": "test",
    }

    response = api_client.post(
        reverse("google_authentication"), {"JWTToken": "invalid token"}, format="json"
    )

    assert response.status_code == 200
    assert "csrftoken" in response.cookies
