from django.utils import timezone
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.permissions import IsCreator
from apps.bookings.models import Booking
from apps.bookings.serializers import BookingCreateSerializer, BookingSerializer


class BookingCreateView(generics.CreateAPIView):
    """
    POST /api/bookings/
    Authenticated users can book a session.
    """

    permission_classes = [IsAuthenticated]
    serializer_class = BookingCreateSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        booking = serializer.save()
        # Return the full booking details
        output = BookingSerializer(booking).data
        return Response(output, status=status.HTTP_201_CREATED)


class UserBookingsListView(generics.ListAPIView):
    """
    GET /api/bookings/my-bookings/
    List all bookings of the authenticated user.
    Supports ?status=confirmed|cancelled|completed filtering.
    """

    permission_classes = [IsAuthenticated]
    serializer_class = BookingSerializer

    def get_queryset(self):
        qs = Booking.objects.filter(user=self.request.user).select_related(
            "session", "session__creator"
        )
        status_filter = self.request.query_params.get("status")
        if status_filter:
            qs = qs.filter(status=status_filter)
        return qs


class BookingCancelView(APIView):
    """
    POST /api/bookings/<id>/cancel/
    Cancel a confirmed booking.
    """

    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            booking = Booking.objects.get(pk=pk, user=request.user)
        except Booking.DoesNotExist:
            return Response(
                {"error": "Booking not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if booking.status != Booking.Status.CONFIRMED:
            return Response(
                {"error": f"Cannot cancel a booking with status '{booking.status}'."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        booking.status = Booking.Status.CANCELLED
        booking.cancelled_at = timezone.now()
        booking.save(update_fields=["status", "cancelled_at"])

        return Response(BookingSerializer(booking).data, status=status.HTTP_200_OK)


class CreatorBookingsListView(generics.ListAPIView):
    """
    GET /api/bookings/session-bookings/
    Creator sees all bookings across their sessions.
    Used in the Creator Dashboard.
    """

    permission_classes = [IsAuthenticated, IsCreator]
    serializer_class = BookingSerializer

    def get_queryset(self):
        return (
            Booking.objects.filter(session__creator=self.request.user)
            .select_related("session", "user")
            .order_by("-booked_at")
        )
