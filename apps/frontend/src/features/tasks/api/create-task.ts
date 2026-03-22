import { apiClient } from '@/lib/api/client';
import { apiEndpoints } from '@/lib/api/endpoints';
import type { Task } from '@/types/task';
import type { CreateTaskFormValues } from '@/features/tasks/schema/create-task.schema';
type CreateTaskRequestBody = {
  projectId: string;
  title: string;
  description?: string | null;
  assigneeIds: string[];
};

export const createTaskRequest = async (
  projectId: string,
  values: CreateTaskFormValues,
): Promise<Task> => {
  const normalizedDescription =
    values.description == null || values.description.trim() === ''
      ? null
      : values.description.trim();

  const payload: CreateTaskRequestBody = {
    projectId,
    title: values.title.trim(),
    description: normalizedDescription,
    assigneeIds: [],
  };

  const response = await apiClient.post<Task>(apiEndpoints.tasks.create, payload);

  return response.data;
};