import pytest
from django.urls import reverse
from unittest.mock import patch
from types import SimpleNamespace
import stripe


url = reverse('portal_session')

# test for valid portal session
@patch("billings.views.create_portal")
@pytest.mark.django_db
def test_create_portal(mock_stripe_create_portal, test_user, authenticated_client):
    test_user.customer_id = "valid customer id"
    test_user.save()
    mock_stripe_create_portal.return_value = SimpleNamespace(url="stripe portal url")
    response = authenticated_client.post(url)
    assert response.status_code == 200

# test for invalid case where the user is not a stripe customer
@pytest.mark.django_db
def test_not_customer(authenticated_client):
    response = authenticated_client.post(url)
    assert response.status_code == 403

# test for invalid case where stripe fails to find customer
@pytest.mark.django_db
def test_invalid_cus_id(test_user, authenticated_client):
    test_user.customer_id = "cus_NffrFwUfNV2Hib"
    test_user.save()
    response = authenticated_client.post(url)
    assert response.status_code == 400

# test for invalid case where stripe fails
@pytest.mark.django_db
@patch("billings.views.create_portal")
def test_stripe_fails(mock_create_portal, test_user, authenticated_client):
    test_user.customer_id = "valid customer id"
    test_user.save()
    mock_create_portal.side_effect = stripe.StripeError(
        message="Stripe internal error",
        http_status=500,
        json_body={}
    )
    response = authenticated_client.post(url)
    assert response.status_code == 502
