'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'sonner';

import { queryKeys } from '@/constants/query-keys';
import { removeTaskAssigneeRequest } from '@/features/tasks/api/remove-task-assignee';

type RemoveTaskAssigneeParams = {
  projectId: string;
  taskId: string;
  userId: string;
};

type ShieldErrorResponse = {
  message?: string;
};

export function useRemoveTaskAssignee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      projectId: _projectId,
      taskId,
      userId,
    }: RemoveTaskAssigneeParams) => {
      await removeTaskAssigneeRequest({
        taskId,
        userId,
      });
    },
    onSuccess: async (_data, variables) => {
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

      toast.success('Task assignee removed successfully.');
    },
    onError: (error: unknown) => {
      const message = axios.isAxiosError<ShieldErrorResponse>(error)
        ? error.response?.data?.message ?? 'Failed to remove task assignee.'
        : 'Failed to remove task assignee.';

      toast.error(message);
    },
  });
}