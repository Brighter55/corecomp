from django.urls import path
from .views import overview


urlpatterns = [
    # Search page
    path("overview", overview.overview),
]
