import { useQuery } from '@tanstack/react-query';

import { getProjectTasks } from '@/features/projects/api/get-project-tasks';

export function useProjectTasks(projectId: string) {
  return useQuery({
    queryKey: ['project', projectId, 'tasks'],
    queryFn: () => getProjectTasks(projectId),
    enabled: projectId.length > 0,
  });
}