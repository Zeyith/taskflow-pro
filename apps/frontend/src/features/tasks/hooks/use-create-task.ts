'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { toast } from 'sonner';

import { createTaskRequest } from '@/features/tasks/api/create-task';
import type { CreateTaskFormValues } from '@/features/tasks/schema/create-task.schema';

type ApiErrorResponse = {
  message?: string;
};

export function useCreateTask(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: CreateTaskFormValues) =>
      createTaskRequest(projectId, values),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['project', projectId, 'tasks'],
      });

      await queryClient.invalidateQueries({
        queryKey: ['dashboard', 'summary'],
      });

      toast.success('Task created successfully.');
    },
    onError: (error) => {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      const message =
        axiosError.response?.data?.message ?? 'Failed to create task.';

      toast.error(message);
    },
  });
}