import { useQuery } from '@tanstack/react-query';
import { stylistsApi } from '@/lib/api/stylists';
import type { Stylist } from '@/types';

const STYLISTS_QUERY_KEY = ['stylists'] as const;

export function useStylists() {
  return useQuery({
    queryKey: STYLISTS_QUERY_KEY,
    queryFn: () => stylistsApi.getAll(),
  });
}
