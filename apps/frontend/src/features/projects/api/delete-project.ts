import { apiClient } from '@/lib/api/client';
import { apiEndpoints } from '@/lib/api/endpoints';

export type DeleteProjectRequestResponse = {
  success?: boolean;
  message?: string;
};

export async function deleteProjectRequest(
  projectId: string,
): Promise<DeleteProjectRequestResponse> {
  const response = await apiClient.delete<DeleteProjectRequestResponse>(
    apiEndpoints.projects.detail(projectId),
  );

  return response.data;
}