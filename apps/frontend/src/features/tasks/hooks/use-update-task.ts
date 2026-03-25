'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/constants/query-keys';
import { updateTaskRequest } from '@/features/tasks/api/update-task';

export function useUpdateTask(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateTaskRequest,
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