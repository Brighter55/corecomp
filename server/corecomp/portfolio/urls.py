from django.urls import path

from . import views

urlpatterns = [
    # No trailing slash: APPEND_SLASH would 301 a POST and fetch follows a 301
    # as a GET, turning it into a 405.
    path("transactions", views.transactions, name="portfolio_transactions"),
    path(
        "transactions/delete",
        views.delete_transaction,
        name="portfolio_transaction_delete",
    ),
    path("analysis", views.analysis_view, name="portfolio_analysis"),
]
