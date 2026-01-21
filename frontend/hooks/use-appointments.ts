import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appointmentsApi } from '@/lib/api/appointments';
import toast from 'react-hot-toast';
import type { Appointment } from '@/types';

const APPOINTMENTS_QUERY_KEY = ['appointments'] as const;

export function useAppointments(params?: { start?: string; end?: string; stylistId?: string; clientId?: string; status?: string }) {
  return useQuery({
    queryKey: [...APPOINTMENTS_QUERY_KEY, params],
    queryFn: () => params?.start && params?.end
      ? appointmentsApi.getByDateRange(params.start, params.end)
      : appointmentsApi.getAll(),
  });
}

export function useAppointment(id: string) {
  return useQuery({
    queryKey: [...APPOINTMENTS_QUERY_KEY, id],
    queryFn: () => appointmentsApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => appointmentsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: APPOINTMENTS_QUERY_KEY });
      toast.success('Appointment created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create appointment');
    },
  });
}

export function useUpdateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      appointmentsApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: APPOINTMENTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...APPOINTMENTS_QUERY_KEY, variables.id] });
      toast.success('Appointment updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update appointment');
    },
  });
}

export function useCancelAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      appointmentsApi.cancel(id, reason || ''),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: APPOINTMENTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...APPOINTMENTS_QUERY_KEY, variables.id] });
      toast.success('Appointment cancelled successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to cancel appointment');
    },
  });
}

export function useDeleteAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => appointmentsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: APPOINTMENTS_QUERY_KEY });
      toast.success('Appointment deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete appointment');
    },
  });
}
