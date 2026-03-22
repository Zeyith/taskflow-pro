import { apiClient } from '@/lib/api/client';
import { apiEndpoints } from '@/lib/api/endpoints';
import type { Incident, IncidentsListResponse } from '@/types/incident';

type RawProjectIncidentsResponse =
  | Incident[]
  | {
      data?: Incident[];
      meta?: {
        isCached?: boolean;
        limit?: number;
        offset?: number;
        total?: number;
      };
    };

function normalizeProjectIncidentsResponse(
  response: RawProjectIncidentsResponse,
): IncidentsListResponse {
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

export async function getProjectIncidentsRequest(
  projectId: string,
): Promise<IncidentsListResponse> {
  const response = await apiClient.get<RawProjectIncidentsResponse>(
    apiEndpoints.projects.incidents(projectId),
    {
      params: {
        limit: 20,
        offset: 0,
      },
    },
  );

  return normalizeProjectIncidentsResponse(response.data);
}