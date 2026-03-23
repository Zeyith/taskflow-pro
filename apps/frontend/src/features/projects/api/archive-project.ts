import { apiClient } from '@/lib/api/client';
import { apiEndpoints } from '@/lib/api/endpoints';
import type { Project } from '@/types/project';

export async function archiveProjectRequest(
  projectId: string,
): Promise<Project> {
  const response = await apiClient.patch<Project>(
    apiEndpoints.projects.archive(projectId),
  );

  return response.data;
}