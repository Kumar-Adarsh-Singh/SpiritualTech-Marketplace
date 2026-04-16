import razorpay
from django.conf import settings
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.bookings.models import Booking
from apps.payments.models import Payment
from apps.payments.serializers import (
    PaymentCreateSerializer,
    PaymentSerializer,
    PaymentVerifySerializer,
)


def get_razorpay_client():
    """Initialize and return the Razorpay client."""
    return razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))


class CreatePaymentOrderView(APIView):
    """
    POST /api/payments/create-order/
    Creates a Razorpay order for a booking.
    Returns the order_id that the frontend uses to open Razorpay checkout.
    """

    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = PaymentCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        booking_id = serializer.validated_data["booking_id"]

        try:
            booking = Booking.objects.select_related("session").get(
                pk=booking_id, user=request.user, status=Booking.Status.CONFIRMED
            )
        except Booking.DoesNotExist:
            return Response(
                {"error": "Booking not found or already cancelled."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Check if payment already exists
        if hasattr(booking, "payment") and booking.payment.status == Payment.Status.COMPLETED:
            return Response(
                {"error": "Payment already completed for this booking."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        amount = booking.session.price
        currency = booking.session.currency or "INR"

        client = get_razorpay_client()
        
        # Create Razorpay order with robust error handling
        try:
            razorpay_order = client.order.create(
                {
                    "amount": int(amount * 100),  # Razorpay expects paise
                    "currency": currency,
                    "payment_capture": 1,  # Auto-capture
                    "notes": {
                        "booking_id": str(booking.id),
                        "user_id": str(request.user.id),
                    },
                }
            )
        except Exception as e:
            # Handle Razorpay API failures (e.g. timeout, invalid credentials) gracefully
            return Response(
                {"error": "Failed to communicate with payment provider. Please try again later.", "details": str(e)},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        # Save payment record
        payment, created = Payment.objects.update_or_create(
            booking=booking,
            defaults={
                "user": request.user,
                "amount": amount,
                "currency": currency,
                "razorpay_order_id": razorpay_order["id"],
                "status": Payment.Status.PENDING,
            },
        )

        return Response(
            {
                "order_id": razorpay_order["id"],
                "amount": int(amount * 100),
                "currency": currency,
                "razorpay_key_id": settings.RAZORPAY_KEY_ID,
                "payment": PaymentSerializer(payment).data,
            },
            status=status.HTTP_201_CREATED,
        )


class VerifyPaymentView(APIView):
    """
    POST /api/payments/verify/
    Verify the Razorpay payment signature after the user completes payment.
    Called by the frontend after Razorpay checkout is successful.
    """

    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = PaymentVerifySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        razorpay_order_id = serializer.validated_data["razorpay_order_id"]
        razorpay_payment_id = serializer.validated_data["razorpay_payment_id"]
        razorpay_signature = serializer.validated_data["razorpay_signature"]

        try:
            payment = Payment.objects.get(
                razorpay_order_id=razorpay_order_id, user=request.user
            )
        except Payment.DoesNotExist:
            return Response(
                {"error": "Payment record not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Verify signature using Razorpay SDK
        client = get_razorpay_client()
        try:
            client.utility.verify_payment_signature(
                {
                    "razorpay_order_id": razorpay_order_id,
                    "razorpay_payment_id": razorpay_payment_id,
                    "razorpay_signature": razorpay_signature,
                }
            )
        except razorpay.errors.SignatureVerificationError:
            payment.status = Payment.Status.FAILED
            payment.save(update_fields=["status"])
            return Response(
                {"error": "Payment verification failed."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Payment verified – update records
        payment.razorpay_payment_id = razorpay_payment_id
        payment.razorpay_signature = razorpay_signature
        payment.status = Payment.Status.COMPLETED
        payment.save(update_fields=["razorpay_payment_id", "razorpay_signature", "status"])

        return Response(
            {
                "message": "Payment verified successfully.",
                "payment": PaymentSerializer(payment).data,
            },
            status=status.HTTP_200_OK,
        )


class PaymentWebhookView(APIView):
    """
    POST /api/payments/webhook/
    Razorpay sends payment events here (server-to-server).
    No authentication needed – Razorpay signs the request.
    """

    permission_classes = [AllowAny]

    def post(self, request):
        webhook_secret = getattr(settings, 'RAZORPAY_WEBHOOK_SECRET', None)
        
        # In production, verify the webhook signature from Razorpay
        if webhook_secret:
            signature = request.headers.get('X-Razorpay-Signature')
            if not signature:
                return Response({'error': 'Missing signature.'}, status=status.HTTP_400_BAD_REQUEST)
                
            client = get_razorpay_client()
            try:
                client.utility.verify_webhook_signature(request.body.decode('utf-8'), signature, webhook_secret)
            except razorpay.errors.SignatureVerificationError:
                return Response({'error': 'Invalid signature.'}, status=status.HTTP_400_BAD_REQUEST)

        event = request.data.get("event")
        payload = request.data.get("payload", {})

        if event == "payment.captured":
            payment_entity = payload.get("payment", {}).get("entity", {})
            order_id = payment_entity.get("order_id")

            try:
                payment = Payment.objects.get(razorpay_order_id=order_id)
                payment.razorpay_payment_id = payment_entity.get("id", "")
                payment.status = Payment.Status.COMPLETED
                payment.save(update_fields=["razorpay_payment_id", "status"])
            except Payment.DoesNotExist:
                pass

        elif event == "payment.failed":
            payment_entity = payload.get("payment", {}).get("entity", {})
            order_id = payment_entity.get("order_id")

            try:
                payment = Payment.objects.get(razorpay_order_id=order_id)
                payment.status = Payment.Status.FAILED
                payment.save(update_fields=["status"])
            except Payment.DoesNotExist:
                pass

        return Response({"status": "ok"}, status=status.HTTP_200_OK)
