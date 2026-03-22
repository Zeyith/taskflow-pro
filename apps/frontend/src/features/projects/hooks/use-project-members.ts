'use client';

import { useQuery } from '@tanstack/react-query';

import { getProjectMembers } from '@/features/projects/api/get-project-members';

type UseProjectMembersOptions = {
  enabled?: boolean;
};

export function useProjectMembers(
  projectId: string,
  options?: UseProjectMembersOptions,
) {
  return useQuery({
    queryKey: ['project', projectId, 'members'],
    queryFn: () => getProjectMembers(projectId),
    enabled: Boolean(projectId) && (options?.enabled ?? true),
  });
}