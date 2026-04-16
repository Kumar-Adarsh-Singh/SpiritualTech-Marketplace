from django.db.models import Count, Q
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from apps.accounts.permissions import IsCreator, IsOwnerOrReadOnly
from apps.sessions.filters import SessionFilter
from apps.sessions.models import Session
from apps.sessions.serializers import (
    SessionCreateUpdateSerializer,
    SessionDetailSerializer,
    SessionListSerializer,
)


class SessionListView(generics.ListAPIView):
    """
    GET /api/sessions/
    Public catalog – any visitor can browse sessions.
    Supports filtering, searching, and ordering.
    """

    permission_classes = [AllowAny]
    serializer_class = SessionListSerializer
    filterset_class = SessionFilter
    search_fields = ["title", "description", "category"]
    ordering_fields = ["date_time", "price", "created_at"]
    ordering = ["-date_time"]

    def get_queryset(self):
        return (
            Session.objects.filter(is_active=True)
            .annotate(confirmed_bookings=Count("bookings", filter=Q(bookings__status="confirmed")))
            .select_related("creator")
        )


class SessionDetailView(generics.RetrieveAPIView):
    """
    GET /api/sessions/<id>/
    Public detail view of a single session.
    """

    permission_classes = [AllowAny]
    serializer_class = SessionDetailSerializer
    queryset = Session.objects.annotate(
        confirmed_bookings=Count("bookings", filter=Q(bookings__status="confirmed"))
    ).select_related("creator")


class SessionCreateView(generics.CreateAPIView):
    """
    POST /api/sessions/create/
    Only Creators can create sessions.
    """

    permission_classes = [IsAuthenticated, IsCreator]
    serializer_class = SessionCreateUpdateSerializer

    def perform_create(self, serializer):
        serializer.save(creator=self.request.user)


class SessionUpdateView(generics.UpdateAPIView):
    """
    PUT/PATCH /api/sessions/<id>/update/
    Only the Creator who owns the session can update it.
    """

    permission_classes = [IsAuthenticated, IsCreator, IsOwnerOrReadOnly]
    serializer_class = SessionCreateUpdateSerializer

    def get_queryset(self):
        return Session.objects.filter(creator=self.request.user)


class SessionDeleteView(generics.DestroyAPIView):
    """
    DELETE /api/sessions/<id>/delete/
    Only the Creator who owns the session can delete it.
    """

    permission_classes = [IsAuthenticated, IsCreator, IsOwnerOrReadOnly]

    def get_queryset(self):
        return Session.objects.filter(creator=self.request.user)


class CreatorSessionListView(generics.ListAPIView):
    """
    GET /api/sessions/my-sessions/
    List all sessions created by the authenticated Creator.
    Used in the Creator Dashboard.
    """

    permission_classes = [IsAuthenticated, IsCreator]
    serializer_class = SessionListSerializer

    def get_queryset(self):
        return (
            Session.objects.filter(creator=self.request.user)
            .annotate(confirmed_bookings=Count("bookings", filter=Q(bookings__status="confirmed")))
            .select_related("creator")
        )
