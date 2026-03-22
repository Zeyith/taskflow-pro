import { apiClient } from '@/lib/api/client';
import { apiEndpoints } from '@/lib/api/endpoints';

type AddTaskAssigneeRequestBody = {
  userId: string;
};

export async function addTaskAssigneeRequest(
  taskId: string,
  userId: string,
): Promise<void> {
  const payload: AddTaskAssigneeRequestBody = {
    userId,
  };

  await apiClient.post(apiEndpoints.tasks.assignees(taskId), payload);
}