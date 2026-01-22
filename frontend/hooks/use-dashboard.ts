import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/lib/api';

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: dashboardApi.getStats,
    refetchInterval: 60000, // Refetch every minute
  });
}

export function useUpcomingAppointments() {
  return useQuery({
    queryKey: ['dashboard', 'upcoming'],
    queryFn: dashboardApi.getUpcomingAppointments,
    refetchInterval: 60000, // Refetch every minute
  });
}
