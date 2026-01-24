import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { stylistsApi } from '@/lib/api/stylists';
import toast from 'react-hot-toast';
import type { Stylist } from '@/types';

const STYLISTS_QUERY_KEY = ['stylists'] as const;

export function useStylists() {
  return useQuery({
    queryKey: STYLISTS_QUERY_KEY,
    queryFn: () => stylistsApi.getAll(),
  });
}

export function useStylist(id: string) {
  return useQuery({
    queryKey: [...STYLISTS_QUERY_KEY, id],
    queryFn: () => stylistsApi.getById(id),
    enabled: !!id,
  });
}

export function useStylistDetail(id: string | null) {
  return useQuery({
    queryKey: [...STYLISTS_QUERY_KEY, id, 'detail'],
    queryFn: () => stylistsApi.getByIdWithAppointments(id!),
    enabled: !!id,
  });
}

export function useCreateStylist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => stylistsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STYLISTS_QUERY_KEY });
      toast.success('Stylist created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create stylist');
    },
  });
}

export function useUpdateStylist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      stylistsApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: STYLISTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...STYLISTS_QUERY_KEY, variables.id] });
      toast.success('Stylist updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update stylist');
    },
  });
}

export function useDeleteStylist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => stylistsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STYLISTS_QUERY_KEY });
      toast.success('Stylist deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete stylist');
    },
  });
}
