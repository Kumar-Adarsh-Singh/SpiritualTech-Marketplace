from django.urls import path
from apps.accounts.views import (
    GoogleLoginView,
    GitHubLoginView,
    ProfileView,
    TokenRefreshView,
)

app_name = "accounts"

urlpatterns = [
    # OAuth endpoints – frontend sends authorization code here
    path("google/", GoogleLoginView.as_view(), name="google-login"),
    path("github/", GitHubLoginView.as_view(), name="github-login"),

    # JWT refresh
    path("token/refresh/", TokenRefreshView.as_view(), name="token-refresh"),

    # Profile
    path("profile/", ProfileView.as_view(), name="profile"),
]
