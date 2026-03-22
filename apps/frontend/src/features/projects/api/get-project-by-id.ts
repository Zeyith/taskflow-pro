import { apiClient } from '@/lib/api/client';
import { apiEndpoints } from '@/lib/api/endpoints';
import type { Project } from '@/types/project';

type ProjectDetailApiResponse =
  | Project
  | {
      data: Project;
      meta?: {
        isCached?: boolean;
      };
    };

function normalizeProjectDetailResponse(
  response: ProjectDetailApiResponse,
): Project {
  if ('data' in response) {
    return response.data;
  }

  return response;
}

export async function getProjectById(projectId: string): Promise<Project> {
  const response = await apiClient.get<ProjectDetailApiResponse>(
    apiEndpoints.projects.detail(projectId),
  );

  return normalizeProjectDetailResponse(response.data);
}