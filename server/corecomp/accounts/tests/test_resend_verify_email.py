from django.contrib.auth import get_user_model
from django.urls import reverse
import pytest

User = get_user_model()
url = reverse("resend_verify_email")

# test for valid request passing user_id
@pytest.mark.django_db
def test_resend_email_with_user_id(api_client):
    user = User.objects.create_user(username="test", is_active=False)
    payload = {"user_id": user.id}
    response = api_client.post(url, payload, format="json")
    assert response.status_code == 200
    assert response.json()["success"] == "email has been resent"

# test for valid request passing username
@pytest.mark.django_db
def test_resend_email_with_username(api_client):
    user = User.objects.create_user(username="test", is_active=False)
    payload = {"username": user.username}
    response = api_client.post(url, payload, format="json")
    assert response.status_code == 200
    assert response.json()["success"] == "email has been resent"

# test for invalid case where user resend when their account is already active
@pytest.mark.django_db
def test_resend_account_already_active(api_client):
    user = User.objects.create_user(username="test", is_active=True)
    payload = {"user_id": user.id}
    response = api_client.post(url, payload, format="json")
    assert response.status_code == 400
    assert response.json()["error"] == "account is already active"

# test for invalid case where the user_id is invalid
@pytest.mark.django_db
def test_invalid_user_id(api_client):
    user = User.objects.create_user(username="test", is_active=False)
    payload = {"user_id": 9999}
    response = api_client.post(url, payload, format="json")
    assert response.status_code == 400
    assert response.json()["error"] == "User doesn't exist"
