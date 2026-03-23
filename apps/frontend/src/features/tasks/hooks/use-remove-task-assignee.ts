'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'sonner';

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
      toast.success('Task assignee removed successfully.');

      await queryClient.invalidateQueries({
        queryKey: ['project', variables.projectId, 'tasks'],
      });
    },
    onError: (error: unknown) => {
      const message = axios.isAxiosError<ShieldErrorResponse>(error)
        ? error.response?.data?.message ?? 'Failed to remove task assignee.'
        : 'Failed to remove task assignee.';

      toast.error(message);
    },
  });
}