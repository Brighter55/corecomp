from django.urls import path
from .views import overview


urlpatterns = [
    # Search page
    path("overview", overview.overview, name="overview"),
    path("get-most-recent-price", overview.get_most_recent_price, name="get_most_recent_price"),
]
