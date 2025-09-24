from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenObtainPairView

urlpatterns = [
    # Authorization
    path("sign-up", views.sign_up),
    path("sign-in", TokenObtainPairView.as_view()),
    # Search page
    path("search", views.search),
]
