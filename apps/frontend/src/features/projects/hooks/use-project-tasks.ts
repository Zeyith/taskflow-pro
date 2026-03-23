'use client';

import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/constants/query-keys';
import { getProjectTasks } from '@/features/projects/api/get-project-tasks';
import type { Task } from '@/types/task';

export function useProjectTasks(projectId: string) {
  return useQuery<Task[]>({
    queryKey: queryKeys.projects.tasks(projectId),
    queryFn: () => getProjectTasks(projectId),
    enabled: projectId.length > 0,
  });
}