from django.urls import path
from apps.bookings.views import (
    BookingCreateView,
    UserBookingsListView,
    BookingCancelView,
    CreatorBookingsListView,
)

app_name = "bookings"

urlpatterns = [
    # User endpoints
    path("", BookingCreateView.as_view(), name="booking-create"),
    path("my-bookings/", UserBookingsListView.as_view(), name="user-bookings"),
    path("<int:pk>/cancel/", BookingCancelView.as_view(), name="booking-cancel"),

    # Creator dashboard
    path("session-bookings/", CreatorBookingsListView.as_view(), name="creator-bookings"),
]
