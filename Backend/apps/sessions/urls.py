from django.urls import path
from apps.sessions.views import (
    SessionListView,
    SessionDetailView,
    SessionCreateView,
    SessionUpdateView,
    SessionDeleteView,
    CreatorSessionListView,
)

app_name = "sessions"

urlpatterns = [
    # Public
    path("", SessionListView.as_view(), name="session-list"),
    path("<int:pk>/", SessionDetailView.as_view(), name="session-detail"),

    # Creator-only
    path("create/", SessionCreateView.as_view(), name="session-create"),
    path("<int:pk>/update/", SessionUpdateView.as_view(), name="session-update"),
    path("<int:pk>/delete/", SessionDeleteView.as_view(), name="session-delete"),

    # Creator dashboard
    path("my-sessions/", CreatorSessionListView.as_view(), name="creator-sessions"),
]
