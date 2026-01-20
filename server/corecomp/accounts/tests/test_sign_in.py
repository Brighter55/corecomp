from django.contrib.auth import get_user_model
from django.urls import reverse
import pytest

User = get_user_model()
url = reverse("sign_in")

# test for valid sign in
@pytest.mark.django_db
def test_valid_sign_in(api_client):
    user = User.objects.create_user(username="test", password="12345678", is_active=True)
    payload = {
        "username": "test",
        "password": "12345678",
    }
    response = api_client.post(url, payload, format="json")
    assert response.status_code == 200

# test for invalid case where the user account is not active here
@pytest.mark.django_db
def test_account_not_active(api_client):
    user = User.objects.create_user(username="test", password="12345678", is_active=False)
    payload = {
        "username": "test",
        "password": "12345678",
    }
    response = api_client.post(url, payload, format="json")
    assert response.status_code == 401
    assert response.json()["detail"] == "This account is inactive"

# test for invalid case where the password/username is invalid
@pytest.mark.django_db
def test_unsuccessful_sign_in(api_client, authenticated_user):
    payload = {
        "username": "test",
        "password": "invalid password",
    }
    response = api_client.post(url, payload, format="json")
    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid username or password"
    payload = {
        "username": "invalid username",
        "password": "12345678",
    }
    response = api_client.post(url, payload, format="json")
    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid username or password"
