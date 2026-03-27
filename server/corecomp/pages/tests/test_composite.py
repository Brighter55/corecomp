import pytest
from django.urls import reverse
from unittest.mock import patch
from pages.models import Symbol
from rest_framework import status
from rest_framework.response import Response


url = reverse("composite")


def _create_symbol():
    return Symbol.objects.create(
        symbol="IBM",
        name="International Business Machines Corp",
        type="Stock",
    )


def _income_statement_payload():
    return {
        "annualReports": [
            {
                "fiscalDateEnding": "2023-12-31",
                "netIncome": "100",
                "totalRevenue": "500",
            }
        ],
        "quarterlyReports": [
            {
                "fiscalDateEnding": "2023-09-30",
                "netIncome": "25",
                "totalRevenue": "125",
            }
        ],
    }


def _balance_sheet_payload():
    return {
        "annualReports": [
            {
                "fiscalDateEnding": "2023-12-31",
                "totalShareholderEquity": "1000",
                "totalAssets": "2000",
                "totalLiabilities": "1000",
            }
        ],
        "quarterlyReports": [
            {
                "fiscalDateEnding": "2023-09-30",
                "totalShareholderEquity": "900",
                "totalAssets": "1800",
                "totalLiabilities": "900",
            }
        ],
    }


def _pricing_payload():
    return {
        "Monthly Adjusted Time Series": {
            "2023-12-29": {
                "4. close": "150.00",
                "5. adjusted close": "150.00",
                }
        }
    }


def _earnings_payload():
    return {
        "annualEarnings": [{"fiscalDateEnding": "2023-12-31", "reportedEPS": "10"}],
        "quarterlyEarnings": [{"fiscalDateEnding": "2023-12-31", "reportedEPS": "2.5"}],
    }


@pytest.mark.django_db
@patch("pages.views.overview.compute_roe")
@patch("pages.views.overview.financial_data_service.get_balance_sheet")
@patch("pages.views.overview.financial_data_service.get_income_statement")
def test_valid(
    mock_get_income_statement,
    mock_get_balance_sheet,
    mock_compute_roe,
    authorized_client,
):
    _create_symbol()
    mock_get_income_statement.return_value = _income_statement_payload()
    mock_get_balance_sheet.return_value = _balance_sheet_payload()
    expected = {
        "annualReports": [{"fiscalDateEnding": "2023-12-31", "ROEPercentage": 15.0}],
        "quarterlyReports": [{"fiscalDateEnding": "2023-09-30", "ROEPercentage": 14.0}],
    }
    mock_compute_roe.return_value = expected

    payload = {"symbol": "IBM", "graph": "ROEPercentage"}
    response = authorized_client.post(url, payload, format="json")

    assert response.status_code == 200
    assert response.json() == expected


@pytest.mark.django_db
@patch("pages.views.overview.compute_roe")
@patch("pages.views.overview.financial_data_service.get_balance_sheet")
@patch("pages.views.overview.financial_data_service.get_income_statement")
def test_valid_cache(
    mock_get_income_statement,
    mock_get_balance_sheet,
    mock_compute_roe,
    authorized_client,
):
    _create_symbol()

    mock_get_income_statement.return_value = _income_statement_payload()
    mock_get_balance_sheet.return_value = _balance_sheet_payload()

    mock_compute_roe.return_value = {
        "annualReports": [{"fiscalDateEnding": "2023-12-31", "ROEPercentage": 15.0}],
        "quarterlyReports": [{"fiscalDateEnding": "2023-09-30", "ROEPercentage": 14.0}],
    }

    roe_payload = {"symbol": "IBM", "graph": "ROEPercentage"}

    response_1 = authorized_client.post(url, roe_payload, format="json")
    response_2 = authorized_client.post(url, roe_payload, format="json")

    assert response_1.status_code == 200
    assert response_2.status_code == 200

    # Same graph+symbol should hit composite cache, but a different graph should compute separately.
    assert mock_compute_roe.call_count == 1
    assert mock_get_income_statement.call_count == 1
    assert mock_get_balance_sheet.call_count == 1

@pytest.mark.django_db
def test_composite_reject_invalid_symbol_graph(authorized_client):
    _create_symbol()

    invalid_symbol_payload = {"symbol": "NOTREAL", "graph": "ROEPercentage"}
    invalid_graph_payload = {"symbol": "IBM", "graph": "InvalidGraph"}

    invalid_symbol_response = authorized_client.post(url, invalid_symbol_payload, format="json")
    invalid_graph_response = authorized_client.post(url, invalid_graph_payload, format="json")

    assert invalid_symbol_response.status_code == 400
    assert "symbol" in invalid_symbol_response.json()

    assert invalid_graph_response.status_code == 400
    assert "graph" in invalid_graph_response.json()


@pytest.mark.django_db
@patch("pages.views.overview.compute_roe")
@patch("pages.views.overview.financial_data_service.get_balance_sheet")
@patch("pages.views.overview.financial_data_service.get_income_statement")
def test_call_compute_roe(
    mock_get_income_statement,
    mock_get_balance_sheet,
    mock_compute_roe,
    authorized_client,
):
    _create_symbol()
    mock_get_income_statement.return_value = _income_statement_payload()
    mock_get_balance_sheet.return_value = _balance_sheet_payload()
    mock_compute_roe.return_value = {
        "annualReports": [{"fiscalDateEnding": "2023-12-31", "ROEPercentage": 15.0}],
        "quarterlyReports": [{"fiscalDateEnding": "2023-09-30", "ROEPercentage": 14.0}],
    }

    payload = {"symbol": "IBM", "graph": "ROEPercentage"}
    response = authorized_client.post(url, payload, format="json")

    assert response.status_code == 200
    mock_compute_roe.assert_called_once()


@pytest.mark.django_db
@patch("pages.views.overview.compute_pe")
@patch("pages.views.overview.financial_data_service.get_earnings")
@patch("pages.views.overview.financial_data_service.get_pricing")
def test_call_compute_pe(
    mock_get_pricing,
    mock_get_earnings,
    mock_compute_pe,
    authorized_client,
):
    _create_symbol()
    mock_get_pricing.return_value = _pricing_payload()
    mock_get_earnings.return_value = _earnings_payload()
    mock_compute_pe.return_value = {
        "annualReports": [{"fiscalDateEnding": "2023-12-31", "PERatio": 10.0}],
        "quarterlyReports": [{"fiscalDateEnding": "2023-12-31", "PERatio": 11.0}],
    }

    payload = {"symbol": "IBM", "graph": "PERatio"}
    response = authorized_client.post(url, payload, format="json")

    assert response.status_code == 200
    mock_compute_pe.assert_called_once()


@pytest.mark.django_db
@patch("pages.views.overview.compute_pb")
@patch("pages.views.overview.financial_data_service.get_balance_sheet")
@patch("pages.views.overview.financial_data_service.get_pricing")
def test_call_compute_pb(
    mock_get_pricing,
    mock_get_balance_sheet,
    mock_compute_pb,
    authorized_client,
):
    _create_symbol()
    mock_get_pricing.return_value = _pricing_payload()
    mock_get_balance_sheet.return_value = _balance_sheet_payload()
    mock_compute_pb.return_value = {
        "annualReports": [{"fiscalDateEnding": "2023-12-31", "PBRatio": 2.5}],
        "quarterlyReports": [{"fiscalDateEnding": "2023-09-30", "PBRatio": 2.4}],
    }

    payload = {"symbol": "IBM", "graph": "PBRatio"}
    response = authorized_client.post(url, payload, format="json")

    assert response.status_code == 200
    mock_compute_pb.assert_called_once()


@pytest.mark.django_db
@patch("pages.views.overview.compute_roe")
@patch("pages.views.overview.financial_data_service.get_balance_sheet")
@patch("pages.views.overview.financial_data_service.get_income_statement")
def test_no_data(
    mock_get_income_statement,
    mock_get_balance_sheet,
    mock_compute_roe,
    authorized_client,
):
    _create_symbol()
    mock_get_income_statement.return_value = _income_statement_payload()
    mock_get_balance_sheet.return_value = _balance_sheet_payload()
    mock_compute_roe.return_value = {
        "annualReports": [],
        "quarterlyReports": [],
    }

    payload = {"symbol": "IBM", "graph": "ROEPercentage"}
    response = authorized_client.post(url, payload, format="json")

    assert response.status_code == 204


@pytest.mark.django_db
@patch("pages.views.overview.financial_data_service.get_income_statement")
def test_exceeds_rate_limit(mock_get_income_statement, authorized_client):
    _create_symbol()
    mock_get_income_statement.return_value = Response(
        {"error": "rate limit issue"},
        status=status.HTTP_503_SERVICE_UNAVAILABLE,
        headers={"Retry-After": "60000"},
    )

    payload = {"symbol": "IBM", "graph": "ROEPercentage"}
    response = authorized_client.post(url, payload, format="json")

    assert response.status_code == 503
    assert response.headers.get("Retry-After") == "60000"
    assert response.json()["error"] == "rate limit issue"