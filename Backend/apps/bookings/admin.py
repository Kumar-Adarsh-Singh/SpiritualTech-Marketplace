from django.contrib import admin
from apps.bookings.models import Booking


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ("user", "session", "status", "booked_at", "cancelled_at")
    list_filter = ("status",)
    search_fields = ("user__username", "session__title")
