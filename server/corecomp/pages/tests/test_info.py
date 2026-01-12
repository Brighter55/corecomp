import pytest
from django.urls import reverse
from unittest.mock import patch
from pages.models import Symbol
from rest_framework.response import Response
from rest_framework import status


url = reverse('info')

# test for valid request
@patch("pages.views.overview.fetchAlphaVantage")
@pytest.mark.django_db
def test_info(mock_fetchAlphaVantage, authorized_client):
    symbol = Symbol(
        symbol="IBM",
        name="International Business Machines Corp",
        type="Stock"
    )
    symbol.save()
    return_value = {
        "Symbol": "IBM",
        "AssetType": "Common Stock",
        "Name": "International Business Machines",
        "Description": "International Business Machines Corporation (IBM) is a leading multinational technology company based in Armonk, New York, with a robust global presence in over 170 countries. Founded in 1911, IBM has consistently been at the forefront of technological innovation, focusing on areas such as artificial intelligence, quantum computing, and cloud computing services. The company is renowned for its strong commitment to research and development, holding the record for the most U.S. patents granted for 28 consecutive years, which underscores its role as a pioneer in the tech industry. With a rich history of impactful inventions including the ATM and relational database systems, IBM continues to adapt and evolve, providing advanced technological solutions that cater to the dynamic needs of multiple sectors in today's fast-paced digital economy.",
        "CIK": "51143",
        "Exchange": "NYSE",
        "Currency": "USD",
        "Country": "USA",
        "Sector": "TECHNOLOGY",
        "Industry": "INFORMATION TECHNOLOGY SERVICES",
        "Address": "ONE NEW ORCHARD ROAD, ARMONK, NY, UNITED STATES, 10504",
        "OfficialSite": "https://www.ibm.com",
        "FiscalYearEnd": "December",
        "LatestQuarter": "2025-09-30",
        "MarketCapitalization": "284365160000",
        "EBITDA": "15042000000",
        "PERatio": "36.22",
        "PEGRatio": "2.082",
        "BookValue": "29.85",
        "DividendPerShare": "6.7",
        "DividendYield": "0.0221",
        "EPS": "8.4",
        "RevenuePerShareTTM": "70.35",
        "ProfitMargin": "0.121",
        "OperatingMarginTTM": "0.172",
        "ReturnOnAssetsTTM": "0.0514",
        "ReturnOnEquityTTM": "0.302",
        "RevenueTTM": "65401999000",
        "GrossProfitTTM": "37808001000",
        "DilutedEPSTTM": "8.4",
        "QuarterlyEarningsGrowthYOY": "0.177",
        "QuarterlyRevenueGrowthYOY": "0.091",
        "AnalystTargetPrice": "301.0",
        "AnalystRatingStrongBuy": "1",
        "AnalystRatingBuy": "8",
        "AnalystRatingHold": "8",
        "AnalystRatingSell": "2",
        "AnalystRatingStrongSell": "2",
        "TrailingPE": "36.22",
        "ForwardPE": "24.75",
        "PriceToSalesRatioTTM": "4.348",
        "PriceToBookRatio": "10.19",
        "EVToRevenue": "5.14",
        "EVToEBITDA": "20.73",
        "Beta": "0.698",
        "52WeekHigh": "324.9",
        "52WeekLow": "209.2",
        "50DayMovingAverage": "303.94",
        "200DayMovingAverage": "273.37",
        "SharesOutstanding": "934735000",
        "SharesFloat": "932613000",
        "PercentInsiders": "0.120",
        "PercentInstitutions": "64.267",
        "DividendDate": "2025-12-10",
        "ExDividendDate": "2025-11-10"
    }
    mock_fetchAlphaVantage.return_value = return_value
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
@patch("pages.views.overview.fetchAlphaVantage")
@pytest.mark.django_db
def test_exceeds_rate_limit(mock_fetchAlphaVantage, authorized_client):
    symbol = Symbol(
        symbol="IBM",
        name="International Business Machines Corp",
        type="Stock"
    )
    symbol.save()
    mock_fetchAlphaVantage.return_value = Response(
        {"error": "rate limit issue"},
        status=status.HTTP_503_SERVICE_UNAVAILABLE,
        headers={"Retry-After":  "60000"}
    )
    payload = {"symbol": "IBM"}
    response = authorized_client.post(url, payload, format="json")
    assert response.status_code == 503
    assert response.headers.get("Retry-After") == "60000"
    assert response.json()["error"] == "rate limit issue"

    mock_fetchAlphaVantage.return_value = Response(
        {"error": "rate limit issue"},
        status=status.HTTP_503_SERVICE_UNAVAILABLE,
        headers={"Retry-After":  "60000"}
    )
    response = authorized_client.post(url, payload, format="json")
    assert response.status_code == 503
    assert response.headers.get("Retry-After") == "60000"
    assert response.json()["error"] == "rate limit issue"

# test for invalid case where Alpha Vantage returns error message about invalid api call
@patch("pages.views.overview.fetchAlphaVantage")
@pytest.mark.django_db
def test_invalid_api_call(mock_fetchAlphaVantage, authorized_client):
    symbol = Symbol(
        symbol="IBM",
        name="International Business Machines Corp",
        type="Stock"
    )
    symbol.save()
    mock_fetchAlphaVantage.return_value = Response(
        {"error": "invalid api call issue"},
        status=status.HTTP_500_INTERNAL_SERVER_ERROR
    )
    payload = {"symbol": "IBM"}
    response = authorized_client.post(url, payload, format="json")
    assert response.status_code == 500
    assert response.json()["error"] == "invalid api call issue"

# test for invalid case where the symbol exists in Symbol but not in Alpha Vantage or Alpha Vantage doesn't have data
@patch("pages.views.overview.fetchAlphaVantage")
@pytest.mark.django_db
def test_symbol_not_in_alpha_vantage(mock_fetchAlphaVantage, authorized_client):
    symbol = Symbol(
        symbol="IBM",
        name="International Business Machines Corp",
        type="Stock"
    )
    symbol.save()
    mock_fetchAlphaVantage.return_value = {}
    payload = {"symbol": "IBM"}
    response = authorized_client.post(url, payload, format="json")
    assert response.status_code == 400
    assert response.json()["error"] == "invalid symbol"
