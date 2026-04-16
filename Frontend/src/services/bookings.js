import api from './api';

export const createBooking = (sessionId) =>
  api.post('bookings/', { session_id: sessionId });

export const fetchMyBookings = (status) => {
  const params = {};
  if (status) params.status = status;
  return api.get('bookings/my-bookings/', { params });
};

export const cancelBooking = (id) =>
  api.post(`bookings/${id}/cancel/`);

export const fetchSessionBookings = () =>
  api.get('bookings/session-bookings/');
