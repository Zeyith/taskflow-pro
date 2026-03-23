import { apiClient } from '@/lib/api/client';

type RemoveTaskAssigneeParams = {
  taskId: string;
  userId: string;
};

export async function removeTaskAssigneeRequest({
  taskId,
  userId,
}: RemoveTaskAssigneeParams): Promise<void> {
  await apiClient.delete(`/tasks/${taskId}/assignees/${userId}`);
}