'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { toast } from 'sonner';

import { addTaskAssigneeRequest } from '@/features/tasks/api/add-task-assignee';

type AddTaskAssigneeInput = {
  projectId: string;
  taskId: string;
  userId: string;
};

type ApiErrorResponse = {
  message?: string;
};

export function useAddTaskAssignee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: AddTaskAssigneeInput) =>
      addTaskAssigneeRequest(input.taskId, input.userId),
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ['project', variables.projectId, 'tasks'],
      });

      toast.success('Assignee added successfully.');
    },
    onError: (error) => {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      const message =
        axiosError.response?.data?.message ?? 'Failed to add assignee.';

      toast.error(message);
    },
  });
}