'use client';

import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/constants/query-keys';
import { getProjectsRequest } from '@/features/projects/api/get-projects';

export function useProjects() {
  return useQuery({
    queryKey: queryKeys.projects.all,
    queryFn: getProjectsRequest,
  });
}