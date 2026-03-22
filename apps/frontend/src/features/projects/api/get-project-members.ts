import { apiClient } from '@/lib/api/client';
import { apiEndpoints } from '@/lib/api/endpoints';
import type {
  ProjectMember,
  ProjectMembersResponse,
} from '@/types/project-member';

type RawProjectMembersResponse = ProjectMember[] | ProjectMembersResponse;

function normalizeProjectMembersResponse(
  response: RawProjectMembersResponse,
): ProjectMembersResponse {
  if (Array.isArray(response)) {
    return {
      data: response,
      meta: {
        isCached: false,
      },
    };
  }

  return {
    data: Array.isArray(response.data) ? response.data : [],
    meta: response.meta,
  };
}

export async function getProjectMembers(
  projectId: string,
): Promise<ProjectMembersResponse> {
  const response = await apiClient.get<RawProjectMembersResponse>(
    apiEndpoints.projects.members(projectId),
  );

  return normalizeProjectMembersResponse(response.data);
}