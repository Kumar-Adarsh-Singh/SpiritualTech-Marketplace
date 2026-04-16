from rest_framework import serializers
from apps.payments.models import Payment


class PaymentCreateSerializer(serializers.Serializer):
    """Input: booking_id → creates a Razorpay order."""

    booking_id = serializers.IntegerField()


class PaymentVerifySerializer(serializers.Serializer):
    """Input: Razorpay callback data to verify payment signature."""

    razorpay_order_id = serializers.CharField()
    razorpay_payment_id = serializers.CharField()
    razorpay_signature = serializers.CharField()


class PaymentSerializer(serializers.ModelSerializer):
    """Read-only representation of a payment record."""

    class Meta:
        model = Payment
        fields = [
            "id",
            "booking",
            "user",
            "amount",
            "currency",
            "status",
            "razorpay_order_id",
            "razorpay_payment_id",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields
