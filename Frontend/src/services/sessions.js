import api from './api';

export const fetchSessions = (params = {}) =>
  api.get('sessions/', { params });

export const fetchSession = (id) =>
  api.get(`sessions/${id}/`);

export const createSession = (data) =>
  api.post('sessions/create/', data);

export const updateSession = (id, data) =>
  api.patch(`sessions/${id}/update/`, data);

export const deleteSession = (id) =>
  api.delete(`sessions/${id}/delete/`);

export const fetchMySessions = () =>
  api.get('sessions/my-sessions/');
