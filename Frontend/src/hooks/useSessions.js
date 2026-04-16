import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchSessions,
  fetchSession,
  fetchMySessions,
  createSession,
  updateSession,
  deleteSession,
} from '../services/sessions';

export function useSessions(params = {}) {
  return useQuery({
    queryKey: ['sessions', params],
    queryFn: () => fetchSessions(params).then((res) => res.data),
    staleTime: 30000,
  });
}

export function useSession(id) {
  return useQuery({
    queryKey: ['sessions', id],
    queryFn: () => fetchSession(id).then((res) => res.data),
    enabled: !!id,
  });
}

export function useMySessions() {
  return useQuery({
    queryKey: ['my-sessions'],
    queryFn: () => fetchMySessions().then((res) => res.data),
  });
}

export function useCreateSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['my-sessions'] });
    },
  });
}

export function useUpdateSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateSession(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['sessions', id] });
      queryClient.invalidateQueries({ queryKey: ['my-sessions'] });
    },
  });
}

export function useDeleteSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteSession(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['my-sessions'] });
    },
  });
}
