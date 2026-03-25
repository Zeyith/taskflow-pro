'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { queryKeys } from '@/constants/query-keys';
import { updateTaskAssigneeStatusRequest } from '@/features/tasks/api/update-task-assignee-status';

type UpdateTaskAssigneeStatusInput = {
  projectId: string;
  taskId: string;
  userId: string;
  status: import('@/types/task').TaskStatus;
};

export function useUpdateTaskAssigneeStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateTaskAssigneeStatusRequest,
    onSuccess: async (_, variables: UpdateTaskAssigneeStatusInput) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.projects.tasks(variables.projectId),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.projects.detail(variables.projectId),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.dashboard.summary,
        }),
      ]);

      toast.success('Task status updated successfully.');
    },
    onError: () => {
      toast.error('Failed to update task status.');
    },
  });
}