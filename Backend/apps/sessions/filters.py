import django_filters
from apps.sessions.models import Session


class SessionFilter(django_filters.FilterSet):
    """Filter sessions by category, price range, date, and status."""

    min_price = django_filters.NumberFilter(field_name="price", lookup_expr="gte")
    max_price = django_filters.NumberFilter(field_name="price", lookup_expr="lte")
    date_from = django_filters.DateTimeFilter(field_name="date_time", lookup_expr="gte")
    date_to = django_filters.DateTimeFilter(field_name="date_time", lookup_expr="lte")

    class Meta:
        model = Session
        fields = ["category", "status", "is_active"]
