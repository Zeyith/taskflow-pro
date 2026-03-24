'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/constants/query-keys';
import { updateTaskRequest } from '@/features/tasks/api/update-task';

export function useUpdateTask(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateTaskRequest,
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