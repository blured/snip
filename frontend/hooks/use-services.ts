import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { servicesApi } from '@/lib/api/services';
import toast from 'react-hot-toast';
import type { Service } from '@/types';

const SERVICES_QUERY_KEY = ['services'] as const;

export function useServices() {
  return useQuery({
    queryKey: SERVICES_QUERY_KEY,
    queryFn: () => servicesApi.getAll(),
  });
}

export function useServicesByCategory(category: string) {
  return useQuery({
    queryKey: [...SERVICES_QUERY_KEY, category],
    queryFn: () => servicesApi.getByCategory(category),
    enabled: !!category,
  });
}

export function useService(id: string) {
  return useQuery({
    queryKey: [...SERVICES_QUERY_KEY, id],
    queryFn: () => servicesApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => servicesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SERVICES_QUERY_KEY });
      toast.success('Service created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create service');
    },
  });
}

export function useUpdateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      servicesApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: SERVICES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...SERVICES_QUERY_KEY, variables.id] });
      toast.success('Service updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update service');
    },
  });
}

export function useDeleteService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => servicesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SERVICES_QUERY_KEY });
      toast.success('Service deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete service');
    },
  });
}
