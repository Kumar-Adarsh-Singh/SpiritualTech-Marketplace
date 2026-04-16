from django.utils import timezone
from rest_framework import serializers

from apps.accounts.serializers import UserSerializer
from apps.sessions.models import Session


class SessionListSerializer(serializers.ModelSerializer):
    """Compact representation for the catalog listing."""

    creator_name = serializers.SerializerMethodField()
    available_spots = serializers.SerializerMethodField()
    is_fully_booked = serializers.SerializerMethodField()

    class Meta:
        model = Session
        fields = [
            "id",
            "title",
            "category",
            "price",
            "currency",
            "duration",
            "date_time",
            "image",
            "location",
            "status",
            "creator_name",
            "available_spots",
            "is_fully_booked",
            "created_at",
        ]

    def get_creator_name(self, obj):
        return obj.creator.get_full_name() or obj.creator.username

    def get_available_spots(self, obj):
        if hasattr(obj, "confirmed_bookings"):
            return max(0, obj.max_participants - obj.confirmed_bookings)
        return obj.available_spots

    def get_is_fully_booked(self, obj):
        if hasattr(obj, "confirmed_bookings"):
            return obj.max_participants <= obj.confirmed_bookings
        return obj.is_fully_booked


class SessionCompactSerializer(serializers.ModelSerializer):
    """Lighter representation without dynamic availability counters, used directly in nested booking views to avoid N+1 queries."""

    creator_name = serializers.SerializerMethodField()

    class Meta:
        model = Session
        fields = [
            "id",
            "title",
            "category",
            "price",
            "currency",
            "duration",
            "date_time",
            "image",
            "location",
            "status",
            "creator_name",
        ]

    def get_creator_name(self, obj):
        return obj.creator.get_full_name() or obj.creator.username


class SessionDetailSerializer(serializers.ModelSerializer):
    """Full detail view including creator info."""

    creator = UserSerializer(read_only=True)
    available_spots = serializers.SerializerMethodField()
    is_fully_booked = serializers.SerializerMethodField()

    class Meta:
        model = Session
        fields = [
            "id",
            "creator",
            "title",
            "description",
            "category",
            "price",
            "currency",
            "duration",
            "date_time",
            "max_participants",
            "image",
            "location",
            "meeting_link",
            "status",
            "is_active",
            "available_spots",
            "is_fully_booked",
            "created_at",
            "updated_at",
        ]

    def get_available_spots(self, obj):
        if hasattr(obj, "confirmed_bookings"):
            return max(0, obj.max_participants - obj.confirmed_bookings)
        return obj.available_spots

    def get_is_fully_booked(self, obj):
        if hasattr(obj, "confirmed_bookings"):
            return obj.max_participants <= obj.confirmed_bookings
        return obj.is_fully_booked


class SessionCreateUpdateSerializer(serializers.ModelSerializer):
    """Used by Creators to create or update a session."""

    class Meta:
        model = Session
        fields = [
            "title",
            "description",
            "category",
            "price",
            "currency",
            "duration",
            "date_time",
            "max_participants",
            "image",
            "location",
            "meeting_link",
            "status",
            "is_active",
        ]

    def validate_price(self, value):
        if value < 0:
            raise serializers.ValidationError("Price cannot be negative.")
        return value

    def validate_duration(self, value):
        if value <= 0:
            raise serializers.ValidationError("Duration must be greater than zero.")
        return value

    def validate_date_time(self, value):
        # Allow updating to a past date if it already was a past date, but enforce future date for new sessions or moving existing sessions.
        # Actually a simpler approach is just to check if it's deeply in the past for new sessions.
        if not self.instance and value < timezone.now():
            raise serializers.ValidationError("Date and time must be in the future.")
        return value

    def validate_max_participants(self, value):
        if value < 1:
            raise serializers.ValidationError("Must allow at least 1 participant.")
        return value
