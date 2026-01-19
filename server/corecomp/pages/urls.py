from django.urls import path
from .views import overview


urlpatterns = [
    # Search page
    path("current-price", overview.current_price, name="current_price"),
    path("info", overview.info, name="info"),
    path("income-statement", overview.income_statement, name="income_statement"),
    path("cash-flow", overview.cash_flow, name="cash_flow"),
    path("balance-sheet", overview.balance_sheet, name="balance_sheet"),
    path("earnings", overview.earnings, name="earnings"),
]
