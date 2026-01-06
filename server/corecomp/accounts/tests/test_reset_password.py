from django.contrib.auth import get_user_model
from django.urls import reverse
import pytest

User = get_user_model()
url = reverse("reset_password")

# test for valid request
@pytest.mark.django_db
def test_valid_reset_password(api_client):
    user = User.objects.create_user(username="test", account_type="manual", email="test@gmail.com")
    payload = {"email": "test@gmail.com"}
    response = api_client.post(url, payload, format="json")
    assert response.status_code == 200

# test for invalid case where the email is not in the database
@pytest.mark.django_db
def test_email_not_exist(api_client):
    user = User.objects.create_user(username="test", account_type="manual", email="test@gmail.com")
    payload = {"email": "invalidemail@gmail.com"}
    response = api_client.post(url, payload, format="json")
    assert response.status_code == 400
    assert response.json()["email"][0] == "Email provided doesn't exist"

# test for invalid case where the email is in database but not manual account type
@pytest.mark.django_db
def test_account_not_manual(api_client):
    user = User.objects.create_user(username="test", account_type="google", email="test@gmail.com")
    payload = {"email": "test@gmail.com"}
    response = api_client.post(url, payload, format="json")
    assert response.status_code == 400
    assert response.json()["email"][0] == "Email provided doesn't exist"
