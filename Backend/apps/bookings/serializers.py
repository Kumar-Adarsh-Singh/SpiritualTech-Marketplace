from rest_framework import serializers

from apps.bookings.models import Booking
from apps.sessions.serializers import SessionCompactSerializer


class BookingSerializer(serializers.ModelSerializer):
    """Read-only representation of a booking including session details."""

    session = SessionCompactSerializer(read_only=True)
    user_name = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = [
            "id",
            "user",
            "user_name",
            "session",
            "status",
            "booked_at",
            "cancelled_at",
        ]
        read_only_fields = ["id", "user", "status", "booked_at", "cancelled_at"]

    def get_user_name(self, obj):
        return obj.user.get_full_name() or obj.user.username


class BookingCreateSerializer(serializers.ModelSerializer):
    """Used when a user books a session – only session_id is required."""

    session_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Booking
        fields = ["session_id"]

    def validate_session_id(self, value):
        from apps.sessions.models import Session

        try:
            session = Session.objects.get(pk=value, is_active=True)
        except Session.DoesNotExist:
            raise serializers.ValidationError("Session not found or is no longer active.")

        if session.is_fully_booked:
            raise serializers.ValidationError("This session is fully booked.")

        return value

    def validate(self, attrs):
        user = self.context["request"].user
        session_id = attrs["session_id"]

        # Prevent duplicate bookings
        if Booking.objects.filter(
            user=user, session_id=session_id, status=Booking.Status.CONFIRMED
        ).exists():
            raise serializers.ValidationError("You have already booked this session.")

        return attrs

    def create(self, validated_data):
        from apps.sessions.models import Session

        session = Session.objects.get(pk=validated_data["session_id"])
        booking = Booking.objects.create(
            user=self.context["request"].user,
            session=session,
            status=Booking.Status.CONFIRMED,
        )
        return booking
