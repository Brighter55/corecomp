import pytest
from django.urls import reverse
from unittest.mock import patch
from pages.models import Symbol
from rest_framework.response import Response
from rest_framework import status
from pathlib import Path
import json


url = reverse('info')

# test for valid request
@patch("pages.views.overview.financial_data_service.get_overview")
@pytest.mark.django_db
def test_info(mock_get_overview, authorized_client):
    symbol = Symbol(
        symbol="IBM",
        name="International Business Machines Corp",
        type="Stock"
    )
    symbol.save()

    path = Path(__file__).resolve().parent.parent / "statement_samples" / "overview.json"
    with open(path, 'r') as file:
        return_value = json.load(file)

    mock_get_overview.return_value = return_value
    payload = {"symbol": "IBM"}
    response = authorized_client.post(url, payload, format="json")
    assert response.status_code == 200
    assert response.json() == {
        "description": return_value["Description"],
        "sector": return_value["Sector"],
        "industry": return_value["Industry"],
        "country": return_value["Country"],
        "exchange": return_value["Exchange"],
        "website": return_value["OfficialSite"],
        "address": return_value["Address"],
        "fiscalYearEnd": return_value["FiscalYearEnd"],
        "marketCapitalization": return_value["MarketCapitalization"],
        "peRatio": return_value["PERatio"],
        "pegRatio": return_value["PEGRatio"],
        "priceToSalesRatioTtm": return_value["PriceToSalesRatioTTM"],
        "priceToBookRatio": return_value["PriceToBookRatio"],
        "evToRevenue": return_value["EVToRevenue"],
        "evToEbitda": return_value["EVToEBITDA"],
        "beta": return_value["Beta"],
        "sharesOutstanding": return_value["SharesOutstanding"],
        "ebitda": return_value["EBITDA"],
        "eps": return_value["EPS"],
        "dilutedEpsTtm": return_value["DilutedEPSTTM"],
        "profitMargin": return_value["ProfitMargin"],
        "operatingMarginTtm": return_value["OperatingMarginTTM"],
        "returnOnAssetsTtm": return_value["ReturnOnAssetsTTM"],
        "returnOnEquityTtm": return_value["ReturnOnEquityTTM"],
        "quarterlyEarningsGrowthYoy": return_value["QuarterlyEarningsGrowthYOY"],
        "quarterlyRevenueGrowthYoy": return_value["QuarterlyRevenueGrowthYOY"],
        "revenueTtm": return_value["RevenueTTM"],
        "grossProfitTtm": return_value["GrossProfitTTM"],
        "revenuePerShareTtm": return_value["RevenuePerShareTTM"],
        "fiftyTwoWeekHigh": return_value["52WeekHigh"],
        "fiftyTwoWeekLow": return_value["52WeekLow"],
        "fiftyDayMovingAverage": return_value["50DayMovingAverage"],
        "twoHundredDayMovingAverage": return_value["200DayMovingAverage"],
        "dividendPerShare": return_value["DividendPerShare"],
        "dividendYield": return_value["DividendYield"],
        "dividendDate": return_value["DividendDate"],
        "exDividendDate": return_value["ExDividendDate"],
        "analystTargetPrice": return_value["AnalystTargetPrice"],
        "analystRatingStrongBuy": return_value["AnalystRatingStrongBuy"],
        "analystRatingBuy": return_value["AnalystRatingBuy"],
        "analystRatingHold": return_value["AnalystRatingHold"],
        "analystRatingSell": return_value["AnalystRatingSell"],
        "analystRatingStrongSell": return_value["AnalystRatingStrongSell"],
    }

# test for invalid symbol where the symbol is not in the database
@pytest.mark.django_db
def test_symbol_not_in_database(authorized_client):
    payload = {"symbol": "invalid symbol"}
    response = authorized_client.post(url, payload, format="json")
    assert response.status_code == 400
    assert response.json()["symbol"][0] == "symbol not in Symbol model"

# test for invalid case where Alpha Vantage returns error message about rate limit
@patch("pages.views.overview.financial_data_service.get_overview")
@pytest.mark.django_db
def test_exceeds_rate_limit(mock_get_overview, authorized_client):
    symbol = Symbol(
        symbol="IBM",
        name="International Business Machines Corp",
        type="Stock"
    )
    symbol.save()
    mock_get_overview.return_value = Response(
        {"error": "rate limit issue"},
        status=status.HTTP_503_SERVICE_UNAVAILABLE,
        headers={"Retry-After":  "60000"}
    )
    payload = {"symbol": "IBM"}
    response = authorized_client.post(url, payload, format="json")
    assert response.status_code == 503
    assert response.headers.get("Retry-After") == "60000"
    assert response.json()["error"] == "rate limit issue"

    mock_get_overview.return_value = Response(
        {"error": "rate limit issue"},
        status=status.HTTP_503_SERVICE_UNAVAILABLE,
        headers={"Retry-After":  "60000"}
    )
    response = authorized_client.post(url, payload, format="json")
    assert response.status_code == 503
    assert response.headers.get("Retry-After") == "60000"
    assert response.json()["error"] == "rate limit issue"

# test for invalid case where Alpha Vantage returns error message about invalid api call
@patch("pages.views.overview.financial_data_service.get_overview")
@pytest.mark.django_db
def test_invalid_api_call(mock_get_overview, authorized_client):
    symbol = Symbol(
        symbol="IBM",
        name="International Business Machines Corp",
        type="Stock"
    )
    symbol.save()
    mock_get_overview.return_value = Response(
        {"error": "invalid api call issue"},
        status=status.HTTP_500_INTERNAL_SERVER_ERROR
    )
    payload = {"symbol": "IBM"}
    response = authorized_client.post(url, payload, format="json")
    assert response.status_code == 500
    assert response.json()["error"] == "invalid api call issue"

# test for invalid case where the symbol exists in Symbol but not in Alpha Vantage or Alpha Vantage doesn't have data
@patch("pages.views.overview.financial_data_service.get_overview")
@pytest.mark.django_db
def test_symbol_not_in_alpha_vantage(mock_get_overview, authorized_client):
    symbol = Symbol(
        symbol="IBM",
        name="International Business Machines Corp",
        type="Stock"
    )
    symbol.save()
    mock_get_overview.return_value = {}
    payload = {"symbol": "IBM"}
    response = authorized_client.post(url, payload, format="json")
    assert response.status_code == 400
    assert response.json()["error"] == "invalid symbol"
