import { useQuery } from '@tanstack/react-query';
import { servicesApi } from '@/lib/api/services';
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
