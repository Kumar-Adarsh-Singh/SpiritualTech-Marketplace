from django.conf import settings
from django.db import models


class Booking(models.Model):
    """
    Records a user booking a session.
    A user can only book the same session once (enforced via unique_together).
    """

    class Status(models.TextChoices):
        CONFIRMED = "confirmed", "Confirmed"
        CANCELLED = "cancelled", "Cancelled"
        COMPLETED = "completed", "Completed"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="bookings",
    )
    session = models.ForeignKey(
        "spiritual_sessions.Session",
        on_delete=models.CASCADE,
        related_name="bookings",
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.CONFIRMED,
    )
    booked_at = models.DateTimeField(auto_now_add=True)
    cancelled_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "bookings"
        ordering = ["-booked_at"]
        unique_together = ["user", "session"]

    def __str__(self):
        return f"{self.user.username} → {self.session.title} ({self.status})"
