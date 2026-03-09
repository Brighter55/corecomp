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
    authenticated_client.cookies["refresh"] = refresh
    response = authenticated_client.get(url)
    assert response.status_code == 200
