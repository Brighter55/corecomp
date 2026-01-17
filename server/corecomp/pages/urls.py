from django.urls import path
from .views import overview


urlpatterns = [
    # Search page
    path("overview/current-price", overview.current_price, name="current_price"),
    path("overview/info", overview.info, name="info"),
    path("overview/income-statement", overview.income_statement, name="income_statement")
]
