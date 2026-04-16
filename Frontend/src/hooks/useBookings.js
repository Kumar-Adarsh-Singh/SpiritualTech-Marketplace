import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createBooking,
  fetchMyBookings,
  cancelBooking,
  fetchSessionBookings,
} from '../services/bookings';

export function useMyBookings(status) {
  return useQuery({
    queryKey: ['my-bookings', status],
    queryFn: () => fetchMyBookings(status).then((res) => res.data),
  });
}

export function useSessionBookings() {
  return useQuery({
    queryKey: ['session-bookings'],
    queryFn: () => fetchSessionBookings().then((res) => res.data),
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sessionId) => createBooking(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => cancelBooking(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['session-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });
}
