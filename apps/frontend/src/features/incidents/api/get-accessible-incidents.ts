import { apiClient } from '@/lib/api/client';
import { apiEndpoints } from '@/lib/api/endpoints';
import type { AccessibleIncidentsFilters } from '@/types/incident-filters';
import type { Incident, IncidentsListResponse } from '@/types/incident';

type RawAccessibleIncidentsResponse =
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

function normalizeAccessibleIncidentsResponse(
  response: RawAccessibleIncidentsResponse,
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

export async function getAccessibleIncidentsRequest(
  filters: AccessibleIncidentsFilters,
): Promise<IncidentsListResponse> {
  const response = await apiClient.get<RawAccessibleIncidentsResponse>(
    apiEndpoints.incidents.list,
    {
      params: {
        projectId: filters.projectId,
        severity: filters.severity,
        status: filters.status,
        limit: filters.limit ?? 20,
        offset: filters.offset ?? 0,
      },
    },
  );

  return normalizeAccessibleIncidentsResponse(response.data);
}