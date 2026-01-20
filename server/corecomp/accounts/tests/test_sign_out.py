from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework_simplejwt.tokens import RefreshToken
import pytest

User = get_user_model()
url = reverse("sign_out")

# test for valid sign out
@pytest.mark.django_db
def test_valid_sign_out(authenticated_client, authenticated_user):
    refresh_object = RefreshToken.for_user(authenticated_user)
    refresh = str(refresh_object)
    payload = {
        "refresh": refresh,
    }
    response = authenticated_client.post(url, payload, format="json")
    assert response.status_code == 200

# test for invalid sign out where the refresh token is invalid
@pytest.mark.django_db
def test_invalid_token(authenticated_client):
    payload = {"refresh": "invalid refresh"}
    response = authenticated_client.post(url, payload, format="json")
    assert response.status_code == 400
