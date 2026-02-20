import pytest
from django.urls import reverse
from unittest.mock import patch
import stripe


url = reverse('checkout_session')

# test for valid checkout
@pytest.mark.django_db
def test_valid_checkout(authenticated_client):
    response = authenticated_client.get(url, format="json")
    assert response.status_code == 200

# test for invalid case where the user is not authenticated
@pytest.mark.django_db
def test_unauthenticated_user(api_client):
    response = api_client.get(url, format="json")
    assert response.status_code == 401

# test for invalid case where stripe fails
@pytest.mark.django_db
@patch("billings.services.checkout")
def test_stripe_fails(mock_stripe_checkout, authenticated_client):
    mock_stripe_checkout.side_effect = stripe.StripeError(
        message="Stripe internal error",
        http_status=500,
        json_body={}
    )
    response = authenticated_client.get(url, format="json")
    assert response.status_code == 502
