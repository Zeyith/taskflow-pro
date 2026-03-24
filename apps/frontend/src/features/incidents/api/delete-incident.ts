import { apiClient } from '@/lib/api/client';
import { apiEndpoints } from '@/lib/api/endpoints';

type DeleteIncidentRequestPayload = {
  incidentId: string;
};

export async function deleteIncidentRequest({
  incidentId,
}: DeleteIncidentRequestPayload): Promise<void> {
  await apiClient.delete(apiEndpoints.incidents.byId(incidentId));
}