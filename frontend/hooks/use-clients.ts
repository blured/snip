import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientsApi } from '@/lib/api/clients';
import toast from 'react-hot-toast';
import type { Client } from '@/types';

// Query keys
const CLIENTS_QUERY_KEY = ['clients'] as const;

export function useClients() {
  return useQuery({
    queryKey: CLIENTS_QUERY_KEY,
    queryFn: () => clientsApi.getAll(),
  });
}

export function useClient(id: string) {
  return useQuery({
    queryKey: [...CLIENTS_QUERY_KEY, id],
    queryFn: () => clientsApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Client>) => clientsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLIENTS_QUERY_KEY });
      toast.success('Client created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create client');
    },
  });
}

export function useUpdateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Client> }) =>
      clientsApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: CLIENTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...CLIENTS_QUERY_KEY, variables.id] });
      toast.success('Client updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update client');
    },
  });
}

export function useDeleteClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => clientsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLIENTS_QUERY_KEY });
      toast.success('Client deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete client');
    },
  });
}

export function useClientAppointments(clientId: string) {
  return useQuery({
    queryKey: [...CLIENTS_QUERY_KEY, clientId, 'appointments'],
    queryFn: () => clientsApi.getAppointments(clientId),
    enabled: !!clientId,
  });
}

export function useClientInvoices(clientId: string) {
  return useQuery({
    queryKey: [...CLIENTS_QUERY_KEY, clientId, 'invoices'],
    queryFn: () => clientsApi.getInvoices(clientId),
    enabled: !!clientId,
  });
}
