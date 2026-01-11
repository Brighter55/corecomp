import requests
from rest_framework.response import Response
from rest_framework import status


def get_stock_price(url):
    response = requests.get(url)
    data = response.json()
    return data


def fetchAlphaVantage(url):
    response = requests.get(url)
    data = response.json()

    # check if alphavatage api returns an error
    if "Note" in data or "Information" in data:
        return Response(
            {"error": "rate limit issue"},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
            headers={"Retry-After":  "60000"}
        )
    if "Error Message" in data:
        return Response(
            {"error": "invalid api call issue"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    return data
