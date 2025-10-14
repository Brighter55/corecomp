from django.urls import path
from . import views


urlpatterns = [
    # Authorization
    path("sign-up", views.sign_up),
    path("sign-in", views.CustomTokenObtainPairView.as_view()),
    # Search page
    path("overview", views.overview),
    # Check if user is authorized
    path("is-authorized", views.is_authorized),
]
