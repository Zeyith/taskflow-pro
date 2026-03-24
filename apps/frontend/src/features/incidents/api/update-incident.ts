import { apiClient } from '@/lib/api/client';
import { apiEndpoints } from '@/lib/api/endpoints';
import type { Incident } from '@/types/incident';
import type { UpdateIncidentSchemaValues } from '@/features/incidents/schemas/update-incident.schema';

type UpdateIncidentApiResponse =
  | Incident
  | {
      data: Incident;
      meta?: {
        isCached?: boolean;
      };
    };

type UpdateIncidentRequestPayload = {
  incidentId: string;
  values: UpdateIncidentSchemaValues;
};

function normalizeUpdateIncidentResponse(
  response: UpdateIncidentApiResponse,
): Incident {
  if ('data' in response) {
    return response.data;
  }

  return response;
}

export async function updateIncidentRequest({
  incidentId,
  values,
}: UpdateIncidentRequestPayload): Promise<Incident> {
  const response = await apiClient.patch<UpdateIncidentApiResponse>(
    apiEndpoints.incidents.byId(incidentId),
    values,
  );

  return normalizeUpdateIncidentResponse(response.data);
}