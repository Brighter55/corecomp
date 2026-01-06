from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.urls import reverse
import pytest

User = get_user_model()
url = reverse("verify_email")

# test for valid request
@pytest.mark.django_db
def test_valid_verify_email(api_client):
    user = User.objects.create_user(username="test", is_active=False)
    token = default_token_generator.make_token(user)
    payload = {
        "user_id": user.id,
        "token": token
    }
    response = api_client.post(url, payload, format="json")
    assert response.status_code == 200
    user.refresh_from_db()
    assert user.is_active == True

# test for when user accidentally click verify again
@pytest.mark.django_db
def test_user_verify_again(api_client):
    user = User.objects.create_user(username="test", is_active=True)
    token = default_token_generator.make_token(user)
    payload = {
        "user_id": user.id,
        "token": token
    }
    response = api_client.post(url, payload, format="json")
    assert response.status_code == 200
    assert response.json()["success"] == "the account is already activated"

# test for invalidate request
@pytest.mark.django_db
def test_invalid_verify_email(api_client):
    user = User.objects.create_user(username="test", is_active=False)
    token = default_token_generator.make_token(user)
    # test for valid "token", but correct "user_id"
    payload = {
        "user_id": user.id,
        "token": "invalid token"
    }
    response = api_client.post(url, payload, format="json")
    assert response.status_code == 400
    user.refresh_from_db()
    assert user.is_active == False
    # test for invalid "user_id", but correct "token"
    payload = {
        "user_id": 9999,
        "token": token
    }
    response = api_client.post(url, payload, format="json")
    user.refresh_from_db()
    assert response.status_code == 400
    assert user.is_active == False
