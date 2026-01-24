import { useQuery } from '@tanstack/react-query';
import { stylistsApi } from '@/lib/api/stylists';
import type { JobTitle } from '@/types';

export function useJobTitles() {
  return useQuery<JobTitle[]>({
    queryKey: ['job-titles'],
    queryFn: stylistsApi.getJobTitles,
  });
}

export function useJobTitlesGrouped() {
  const { data: jobTitles, ...rest } = useJobTitles();

  const grouped = jobTitles?.reduce((acc, jobTitle) => {
    if (!acc[jobTitle.careerStage]) {
      acc[jobTitle.careerStage] = [];
    }
    acc[jobTitle.careerStage].push(jobTitle);
    return acc;
  }, {} as Record<string, JobTitle[]>);

  return { grouped, jobTitles, ...rest };
}
