import { apiClient } from '@/lib/api/client';
import { apiEndpoints } from '@/lib/api/endpoints';

type DeleteTaskRequestParams = {
  taskId: string;
};

export async function deleteTaskRequest({
  taskId,
}: DeleteTaskRequestParams): Promise<void> {
  await apiClient.delete(apiEndpoints.tasks.delete(taskId));
}