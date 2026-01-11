from django.urls import path
from .views import overview


urlpatterns = [
    # Search page
    path("overview", overview.overview, name="overview"),
    path("overview/current-price", overview.current_price, name="current_price"),
    path("overview/info", overview.info, name="info")
]
