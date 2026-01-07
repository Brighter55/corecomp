import pytest
from django.urls import reverse
from unittest.mock import patch
from types import SimpleNamespace
import stripe
from ..utils import ts_to_dt


url = reverse('webhook')

# test for valid webhook for 'customer.subscription.created'
@patch("billings.views.create_event")
@pytest.mark.django_db
def test_valid_webhook(mock_create_event, test_user, api_client):
    payload = {
        "type": "customer.subscription.created",
        "id": "evt_123",
        "created": 1767126808,
        "data": {
            "object": {
                "metadata": {
                    "user_id": test_user.id
                },
                "customer": "cus_123",
                "id": "sub_123",
                "status": "active",
                "cancel_at_period_end": False,
                "items": {
                    "data": [
                        {
                            "current_period_start": 1767126806,
                            "current_period_end": 1767731606
                        }
                    ]
                }
            }
        }
    }
    mock_create_event.return_value = payload
    response = api_client.post(url, payload, format="json")
    test_user.refresh_from_db()
    assert test_user.customer_id == "cus_123"
    assert test_user.subscription_id == "sub_123"
    assert test_user.subscription_status == "active"
    assert test_user.cancel_at_period_end == False
    assert test_user.current_period_start == ts_to_dt(1767126806)
    assert test_user.current_period_end == ts_to_dt(1767731606)
    assert response.status_code == 200

# test for idempotency
@patch("billings.views.create_event")
@pytest.mark.django_db
def test_for_idempotentcy(mock_create_event, test_user, api_client):
    payload = {
        "type": "customer.subscription.created",
        "id": "evt_123",
        "created": 1767126808,
        "data": {
            "object": {
                "metadata": {
                    "user_id": test_user.id
                },
                "customer": "cus_123",
                "id": "sub_123",
                "status": "active",
                "cancel_at_period_end": False,
                "items": {
                    "data": [
                        {
                            "current_period_start": 1767126806,
                            "current_period_end": 1767731606
                        }
                    ]
                }
            }
        }
    }
    mock_create_event.return_value = payload
    response = api_client.post(url, payload, format="json")
    test_user.refresh_from_db()
    assert test_user.customer_id == "cus_123"
    assert test_user.subscription_id == "sub_123"
    assert test_user.subscription_status == "active"
    assert test_user.cancel_at_period_end == False
    assert test_user.current_period_start == ts_to_dt(1767126806)
    assert test_user.current_period_end == ts_to_dt(1767731606)
    assert response.status_code == 200
    response = api_client.post(url, payload, format="json")
    assert response.status_code == 200
    assert response.json()["detail"] == "reject because the event has been run before"


# test invalid case where the signature header is missing or invalid
@pytest.mark.django_db
def test_valid_webhook(test_user, api_client):
    payload = {
        "type": "customer.subscription.created",
        "id": "evt_123",
        "created": 1767126808,
        "data": {
            "object": {
                "metadata": {
                    "user_id": test_user.id
                },
                "customer": "cus_123",
                "id": "sub_123",
                "status": "active",
                "cancel_at_period_end": False,
                "items": {
                    "data": [
                        {
                            "current_period_start": 1767126806,
                            "current_period_end": 1767731606
                        }
                    ]
                }
            }
        }
    }
    response = api_client.post(url, payload, format="json")
    assert response.status_code == 400

# test for invalid case where stripe fails
@pytest.mark.django_db
@patch("billings.views.create_event")
def test_stripe_fails(mock_create_event, api_client):
    mock_create_event.side_effect = stripe.StripeError(
        message="Stripe internal error",
        http_status=500,
    )
    response = api_client.post(url)
    assert response.status_code == 502
