from django.contrib import admin
from django.contrib.auth import get_user_model
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

User = get_user_model()


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ("username", "email", "role", "oauth_provider", "is_staff")
    list_filter = ("role", "oauth_provider", "is_staff", "is_active")
    search_fields = ("username", "email", "first_name", "last_name")

    # Add custom fields to the admin form
    fieldsets = BaseUserAdmin.fieldsets + (
        (
            "Extra Info",
            {"fields": ("role", "avatar", "bio", "phone", "oauth_provider", "oauth_uid")},
        ),
    )
