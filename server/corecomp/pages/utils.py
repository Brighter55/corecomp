import requests


def get_stock_price(url):
    response = requests.get(url)
    data = response.json()
    return data
