from django.contrib.auth import get_user_model
from django.urls import reverse
import pytest
from unittest.mock import patch


User = get_user_model()
url = reverse("google_authentication")

# test for valid sign in
@pytest.mark.django_db
@patch("accounts.views.verify_google_token")
def test_valid_google_sign_in(mock_verify, api_client):
    user = User.objects.create_user(username="test@gmail.com", is_active=True, email="test@gmail.com")
    payload = {"JWTToken": "invalid token"}
    mock_verify.return_value = {
        "sub": "123",
        "email": "test@gmail.com",
        "name": "test",
    }
    response = api_client.post(url, payload, format="json")
    assert response.status_code == 200

# test for valid sign up
@pytest.mark.django_db
@patch("accounts.views.verify_google_token")
def test_valid_google_sign_up(mock_verify, api_client):
    payload = {"JWTToken": "invalid token"}
    mock_verify.return_value = {
        "sub": "123",
        "email": "test@gmail.com",
        "name": "test",
    }
    response = api_client.post(url, payload, format="json")
    user = User.objects.get(email="test@gmail.com")
    assert user.email == "test@gmail.com"
    assert user.is_active == True
    assert response.status_code == 200

# test for invalid sign up when user provide incorrect JWTToken
def test_incorrect_jwt_token(api_client):
    payload = {"JWTToken": "invalid token"}
    response = api_client.post(url, payload, format="json")
    assert response.status_code == 400
