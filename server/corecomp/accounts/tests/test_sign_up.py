from django.contrib.auth import get_user_model
from django.urls import reverse
import pytest

User = get_user_model()
url = reverse("sign_up")


@pytest.mark.django_db
def test_valid_sign_up(api_client):
    payload = {
        "email": "test@gmail.com",
        "username": "test",
        "password": "12345678",
        "confirmPassword": "12345678",
    }
    response = api_client.post(url, payload, format="json")
    user = User.objects.get(username=payload["username"])
    assert response.status_code == 201
    assert user.username == payload["username"]
    assert user.email == payload["email"]
    assert user.is_active == False
    assert user.account_type == "manual"

@pytest.mark.django_db
def test_invalid_sign_up(api_client):
    # test for username taken, email taken
    existing_user = User.objects.create_user(username="test", email="test@gmail.com")
    payload = {
        "email": "test@gmail.com",
        "username": "test",
        "password": "12345678",
        "confirmPassword": "12345678",
    }
    response = api_client.post(url, payload, format="json")
    assert response.status_code == 400
    assert response.json()["username"][0] == "Username is taken"
    assert response.json()["email"][0] == "Email is taken"
    # test for passwords not matched
    payload = {
        "email": "peter@gmail.com",
        "username": "peter",
        "password": "12345678",
        "confirmPassword": "123456789",
    }
    response = api_client.post(url, payload, format="json")
    assert response.status_code == 400
    assert response.json()["non_field_errors"][0] == "Passwords do not match"
