'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/constants/query-keys';
import { deleteTaskRequest } from '@/features/tasks/api/delete-task';

export function useDeleteTask(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTaskRequest,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.projects.tasks(projectId),
      });

      await queryClient.invalidateQueries({
        queryKey: queryKeys.dashboard.summary,
      });
    },
  });
}