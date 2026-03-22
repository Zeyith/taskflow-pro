import { apiClient } from '@/lib/api/client';
import { apiEndpoints } from '@/lib/api/endpoints';
import type { TaskStatus } from '@/types/task';

type UpdateTaskAssigneeStatusParams = {
  taskId: string;
  userId: string;
  status: TaskStatus;
};

type UpdateTaskAssigneeStatusRequestBody = {
  status: TaskStatus;
};

export async function updateTaskAssigneeStatusRequest({
  taskId,
  userId,
  status,
}: UpdateTaskAssigneeStatusParams): Promise<void> {
  const payload: UpdateTaskAssigneeStatusRequestBody = {
    status,
  };

  await apiClient.patch(apiEndpoints.tasks.assigneeStatus(taskId, userId), payload);
}