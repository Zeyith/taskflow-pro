import { apiClient } from '@/lib/api/client';
import { apiEndpoints } from '@/lib/api/endpoints';
import type { ProjectMember } from '@/types/project-member';

type AddProjectMemberRequestBody = {
  userId: string;
};

export async function addProjectMemberRequest(
  projectId: string,
  userId: string,
): Promise<ProjectMember> {
  const payload: AddProjectMemberRequestBody = {
    userId,
  };

  const response = await apiClient.post<ProjectMember>(
    apiEndpoints.projects.members(projectId),
    payload,
  );

  return response.data;
}