'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/constants/query-keys';
import { deleteTaskRequest } from '@/features/tasks/api/delete-task';

export function useDeleteTask(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTaskRequest,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.projects.tasks(projectId),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.projects.detail(projectId),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.dashboard.summary,
        }),
      ]);
    },
  });
}