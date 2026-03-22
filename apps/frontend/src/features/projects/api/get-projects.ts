import { apiClient } from '@/lib/api/client';
import { apiEndpoints } from '@/lib/api/endpoints';
import type { Project, ProjectsListResponse } from '@/types/project';

type RawProjectsResponse =
  | Project[]
  | {
      data?: Project[];
      meta?: {
        isCached?: boolean;
        limit?: number;
        offset?: number;
        total?: number;
      };
    };

function normalizeProjectsResponse(
  response: RawProjectsResponse,
): ProjectsListResponse {
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
    meta: {
      isCached: response.meta?.isCached ?? false,
      limit: response.meta?.limit,
      offset: response.meta?.offset,
      total: response.meta?.total,
    },
  };
}

export async function getProjectsRequest(): Promise<ProjectsListResponse> {
  const response = await apiClient.get<RawProjectsResponse>(
    apiEndpoints.projects.list,
    {
      params: {
        limit: 12,
        offset: 0,
      },
    },
  );

  return normalizeProjectsResponse(response.data);
}