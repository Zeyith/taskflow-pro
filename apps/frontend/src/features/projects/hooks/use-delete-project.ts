'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { deleteProjectRequest } from '@/features/projects/api/delete-project';
import { queryKeys } from '@/constants/query-keys';

export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (projectId: string) => deleteProjectRequest(projectId),
    onSuccess: async (_data, projectId) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.projects.all,
        }),
        queryClient.removeQueries({
          queryKey: queryKeys.projects.detail(projectId),
        }),
      ]);

      toast.success('Project deleted successfully.');
    },
    onError: () => {
      toast.error('Failed to delete project.');
    },
  });
}