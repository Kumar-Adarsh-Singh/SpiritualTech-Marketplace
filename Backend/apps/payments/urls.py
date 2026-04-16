from django.urls import path
from apps.payments.views import (
    CreatePaymentOrderView,
    VerifyPaymentView,
    PaymentWebhookView,
)

app_name = "payments"

urlpatterns = [
    path("create-order/", CreatePaymentOrderView.as_view(), name="create-order"),
    path("verify/", VerifyPaymentView.as_view(), name="verify-payment"),
    path("webhook/", PaymentWebhookView.as_view(), name="payment-webhook"),
]
