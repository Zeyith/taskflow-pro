'use client';

import { useQuery } from '@tanstack/react-query';

import { getProjectIncidentsRequest } from '@/features/incidents/api/get-project-incidents';

export function useProjectIncidents(projectId: string) {
  return useQuery({
    queryKey: ['incidents', 'project', projectId],
    queryFn: () => getProjectIncidentsRequest(projectId),
    enabled: projectId.length > 0,
  });
}