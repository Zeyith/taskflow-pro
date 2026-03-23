import { apiClient } from '@/lib/api/client';
import { apiEndpoints } from '@/lib/api/endpoints';
import type { Project } from '@/types/project';

export type UpdateProjectRequestInput = {
  projectId: string;
  name: string;
  description: string | null;
};

export async function updateProjectRequest(
  input: UpdateProjectRequestInput,
): Promise<Project> {
  const response = await apiClient.patch<Project>(
    apiEndpoints.projects.detail(input.projectId),
    {
      name: input.name,
      description: input.description,
    },
  );

  return response.data;
}