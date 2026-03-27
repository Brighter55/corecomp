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
    path("dividends", overview.dividends, name="dividends"),
    path("pricing", overview.pricing, name="pricing"),
    path("shares-outstanding", overview.shares_outstanding, name="shares_outstanding"),
    path("symbol-search", overview.symbol_search, name="symbol_search"),
    path("composite", overview.composite, name="composite"),
]
