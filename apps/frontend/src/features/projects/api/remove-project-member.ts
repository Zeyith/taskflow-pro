import { apiClient } from '@/lib/api/client';

type RemoveProjectMemberParams = {
  projectId: string;
  userId: string;
};

export async function removeProjectMemberRequest({
  projectId,
  userId,
}: RemoveProjectMemberParams): Promise<void> {
  await apiClient.delete(`/projects/${projectId}/members/${userId}`);
}