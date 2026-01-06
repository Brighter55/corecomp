import pytest
from django.urls import reverse
from unittest.mock import patch
from types import SimpleNamespace
import stripe


url = reverse('session_status')

# test for valid checkout
@patch("billings.views.get_checkout_status")
@pytest.mark.django_db
def test_valid_checkout(mock_stripe_session_status, authenticated_client):
    mock_stripe_session_status.return_value = SimpleNamespace(status="complete", payment_status="no_payment_required")
    payload = {
        "sessionId": "mock_session_id",
    }
    response = authenticated_client.post(url, payload, format="json")
    assert response.status_code == 200

# test for invalid case where the session_id is invalid
@pytest.mark.django_db
def test_invalid_session_id(authenticated_client):
    payload = {
        "sessionId": "invalid session id",
    }
    response = authenticated_client.post(url, payload, format="json")
    assert response.status_code == 404

# test for invalid case where the session_id is not sent
@pytest.mark.django_db
def test_session_id_not_sent(authenticated_client):
    response = authenticated_client.post(url, format="json")
    assert response.status_code == 400

# test for invalid case where stripe fails
@pytest.mark.django_db
@patch("billings.views.get_checkout_status")
def test_stripe_fails(mock_stripe_session_status, authenticated_client):
    mock_stripe_session_status.side_effect = stripe.StripeError(
        message="Stripe internal error",
        http_status=500,
    )
    payload = {
        "sessionId": "mock_session_id",
    }
    response = authenticated_client.post(url, payload, format="json")
    assert response.status_code == 502
