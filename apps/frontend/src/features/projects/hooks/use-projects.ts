'use client';

import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/constants/query-keys';
import { getProjectsRequest } from '@/features/projects/api/get-projects';
import type { ProjectsListResponse } from '@/types/project';

export function useProjects() {
  return useQuery<ProjectsListResponse>({
    queryKey: queryKeys.projects.all,
    queryFn: getProjectsRequest,
  });
}