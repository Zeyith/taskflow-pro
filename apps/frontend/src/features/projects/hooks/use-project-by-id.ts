import { useQuery } from '@tanstack/react-query';

import { getProjectById } from '@/features/projects/api/get-project-by-id';

export function useProjectById(projectId: string) {
  return useQuery({
    queryKey: ['project', projectId],
    queryFn: () => getProjectById(projectId),
    enabled: projectId.length > 0,
  });
}