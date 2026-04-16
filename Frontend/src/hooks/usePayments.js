import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createPaymentOrder, verifyPayment } from '../services/payments';

export function useCreatePaymentOrder() {
  return useMutation({
    mutationFn: (bookingId) => createPaymentOrder(bookingId),
  });
}

export function useVerifyPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => verifyPayment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['session-bookings'] });
    },
  });
}
