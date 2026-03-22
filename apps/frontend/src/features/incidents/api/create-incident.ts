import { apiClient } from '@/lib/api/client';
import { apiEndpoints } from '@/lib/api/endpoints';
import type { Incident } from '@/types/incident';
import type { CreateIncidentSchemaValues } from '@/features/incidents/schemas/create-incident.schema';

type CreateIncidentApiResponse =
  | Incident
  | {
      data: Incident;
      meta?: {
        isCached?: boolean;
      };
    };

function normalizeCreateIncidentResponse(
  response: CreateIncidentApiResponse,
): Incident {
  if ('data' in response) {
    return response.data;
  }

  return response;
}

export async function createIncidentRequest(
  payload: CreateIncidentSchemaValues,
): Promise<Incident> {
  const response = await apiClient.post<CreateIncidentApiResponse>(
    apiEndpoints.incidents.create,
    payload,
  );

  return normalizeCreateIncidentResponse(response.data);
}