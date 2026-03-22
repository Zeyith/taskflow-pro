import { useQuery } from '@tanstack/react-query';

import { getProjectPresence } from '@/features/presence/api/get-project-presence';

export const projectPresenceQueryKey = (projectId: string) =>
  ['project-presence', projectId] as const;

export const useProjectPresence = (projectId: string | null) => {
  return useQuery({
    queryKey: projectPresenceQueryKey(projectId ?? ''),
    queryFn: () => {
      if (!projectId) {
        throw new Error('Project id is required');
      }

      return getProjectPresence(projectId);
    },
    enabled: Boolean(projectId),
  });
};