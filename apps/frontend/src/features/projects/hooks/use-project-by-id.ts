'use client';

import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/constants/query-keys';
import { getProjectById } from '@/features/projects/api/get-project-by-id';
import type { Project } from '@/types/project';

export function useProjectById(projectId: string) {
  return useQuery<Project>({
    queryKey: queryKeys.projects.detail(projectId),
    queryFn: () => getProjectById(projectId),
    enabled: projectId.length > 0,
  });
}