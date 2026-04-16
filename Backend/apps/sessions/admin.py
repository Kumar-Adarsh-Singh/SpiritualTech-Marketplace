from django.contrib import admin
from apps.sessions.models import Session


@admin.register(Session)
class SessionAdmin(admin.ModelAdmin):
    list_display = ("title", "creator", "category", "price", "date_time", "status", "is_active")
    list_filter = ("category", "status", "is_active")
    search_fields = ("title", "description", "creator__username")
    date_hierarchy = "date_time"
