from django.conf import settings
from django.db import models


class Session(models.Model):
    """
    A session created by a Creator that Users can book.
    Think of it as a class/workshop/consultation listing.
    """

    class Category(models.TextChoices):
        MEDITATION = "meditation", "Meditation"
        YOGA = "yoga", "Yoga"
        ASTROLOGY = "astrology", "Astrology"
        HEALING = "healing", "Healing"
        COUNSELING = "counseling", "Counseling"
        WORKSHOP = "workshop", "Workshop"
        OTHER = "other", "Other"

    class Status(models.TextChoices):
        UPCOMING = "upcoming", "Upcoming"
        ONGOING = "ongoing", "Ongoing"
        COMPLETED = "completed", "Completed"
        CANCELLED = "cancelled", "Cancelled"

    creator = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="created_sessions",
    )
    title = models.CharField(max_length=200)
    description = models.TextField()
    category = models.CharField(
        max_length=20,
        choices=Category.choices,
        default=Category.OTHER,
    )
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    currency = models.CharField(max_length=3, default="INR")
    duration = models.PositiveIntegerField(help_text="Duration in minutes")
    date_time = models.DateTimeField(help_text="When the session starts")
    max_participants = models.PositiveIntegerField(default=10)
    image = models.URLField(max_length=500, blank=True, default="")
    location = models.CharField(
        max_length=255,
        blank=True,
        default="Online",
        help_text="Physical address or 'Online'",
    )
    meeting_link = models.URLField(max_length=500, blank=True, default="")
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.UPCOMING,
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "sessions"
        ordering = ["-date_time"]

    def __str__(self):
        return f"{self.title} by {self.creator.username}"

    @property
    def available_spots(self):
        """Number of spots still available for booking."""
        booked_count = self.bookings.filter(status="confirmed").count()
        return max(0, self.max_participants - booked_count)

    @property
    def is_fully_booked(self):
        return self.available_spots == 0
