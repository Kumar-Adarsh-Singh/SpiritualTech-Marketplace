from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Custom user model with role-based access.
    Roles:
        - user: can browse and book sessions
        - creator: can create and manage sessions
    """

    class Role(models.TextChoices):
        USER = "user", "User"
        CREATOR = "creator", "Creator"

    role = models.CharField(
        max_length=10,
        choices=Role.choices,
        default=Role.USER,
    )
    avatar = models.URLField(max_length=500, blank=True, default="")
    bio = models.TextField(max_length=500, blank=True, default="")
    phone = models.CharField(max_length=20, blank=True, default="")

    # OAuth fields
    oauth_provider = models.CharField(
        max_length=20,
        blank=True,
        default="",
        help_text="google or github",
    )
    oauth_uid = models.CharField(
        max_length=255,
        blank=True,
        default="",
        help_text="Unique ID from the OAuth provider",
    )

    class Meta:
        db_table = "users"

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"

    @property
    def is_creator(self):
        return self.role == self.Role.CREATOR

    @property
    def is_user(self):
        return self.role == self.Role.USER
