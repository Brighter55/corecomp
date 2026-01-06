from django.contrib.auth import get_user_model
from django.urls import reverse
import pytest
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from django.contrib.auth.tokens import PasswordResetTokenGenerator

User = get_user_model()
url = reverse("confirm_reset_password")

# test for valid request
@pytest.mark.django_db
def test_valid_reset_password(api_client):
    user = User.objects.create_user(username="test", account_type="manual")
    assert user.has_usable_password() == False
    user_id = urlsafe_base64_encode(force_bytes(user.id))
    token_generator = PasswordResetTokenGenerator()
    token = token_generator.make_token(user)
    payload = {
        "id": user_id,
        "token": token,
        "password": "12345678",
        "confirmPassword": "12345678",
    }
    response = api_client.post(url, payload, format="json")
    user.refresh_from_db()
    assert user.has_usable_password() == True
    assert response.status_code == 200

# test for invalid case where the id is incorrect
@pytest.mark.django_db
def test_incorrect_id(api_client):
    user = User.objects.create_user(username="test", account_type="manual")
    user_id = 9999
    token_generator = PasswordResetTokenGenerator()
    token = token_generator.make_token(user)
    payload = {
        "id": user_id,
        "token": token,
        "password": "12345678",
        "confirmPassword": "12345678",
    }
    response = api_client.post(url, payload, format="json")
    assert response.status_code == 400
    assert response.json()["id"][0] == "This user doesn't exist"

# test for invalid case where the account_type is incorrect
@pytest.mark.django_db
def test_invalid_account_type(api_client):
    user = User.objects.create_user(username="test", account_type="google")
    user_id = urlsafe_base64_encode(force_bytes(user.id))
    token_generator = PasswordResetTokenGenerator()
    token = token_generator.make_token(user)
    payload = {
        "id": user_id,
        "token": token,
        "password": "12345678",
        "confirmPassword": "12345678",
    }
    response = api_client.post(url, payload, format="json")
    assert response.status_code == 400
    assert response.json()["id"][0] == "This user doesn't exist"

# test for invalid case where the passwords dont match
@pytest.mark.django_db
def test_passwords_not_match(api_client):
    user = User.objects.create_user(username="test", account_type="manual")
    user_id = urlsafe_base64_encode(force_bytes(user.id))
    token_generator = PasswordResetTokenGenerator()
    token = token_generator.make_token(user)
    payload = {
        "id": user_id,
        "token": token,
        "password": "12345678",
        "confirmPassword": "123456789",
    }
    response = api_client.post(url, payload, format="json")
    assert response.status_code == 400
    assert response.json()["non_field_errors"][0] == "Passwords do not match"


# test for invalid case where the token is invalid
@pytest.mark.django_db
def test_invalid_token(api_client):
    user = User.objects.create_user(username="test", account_type="manual")
    user_id = urlsafe_base64_encode(force_bytes(user.id))
    token = "invalid token"
    payload = {
        "id": user_id,
        "token": token,
        "password": "12345678",
        "confirmPassword": "12345678",
    }
    response = api_client.post(url, payload, format="json")
    assert response.status_code == 400
    assert response.json()["non_field_errors"][0] == "token is invalid"
