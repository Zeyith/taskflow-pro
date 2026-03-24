import { apiClient } from '@/lib/api/client';
import { apiEndpoints } from '@/lib/api/endpoints';
import type { Task } from '@/types/task';
import type { UpdateTaskFormValues } from '@/features/tasks/schema/update-task.schema';

type TaskDetailApiResponse = {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  assignees: Array<{
    userId: string;
    status: string;
  }>;
};

type UpdateTaskApiResponse =
  | TaskDetailApiResponse
  | {
      data: TaskDetailApiResponse;
      meta?: {
        isCached?: boolean;
      };
    };

type UpdateTaskRequestParams = {
  taskId: string;
  values: UpdateTaskFormValues;
};

function extractTaskResponse(response: UpdateTaskApiResponse): TaskDetailApiResponse {
  if ('data' in response) {
    return response.data;
  }

  return response;
}

function normalizeTask(response: TaskDetailApiResponse): Task {
  return {
    id: response.id,
    projectId: response.projectId,
    title: response.title,
    description: response.description,
    status: response.status as Task['status'],
    createdAt: response.createdAt,
    updatedAt: response.updatedAt,
    assignees: response.assignees.map((assignee) => ({
      userId: assignee.userId,
      status: assignee.status as Task['status'],
    })),
  };
}

export async function updateTaskRequest({
  taskId,
  values,
}: UpdateTaskRequestParams): Promise<Task> {
  const response = await apiClient.patch<UpdateTaskApiResponse>(
    apiEndpoints.tasks.update(taskId),
    {
      title: values.title,
      description: values.description?.trim()
        ? values.description.trim()
        : null,
    },
  );

  return normalizeTask(extractTaskResponse(response.data));
}