import { apiClient } from '@/lib/api/client';
import { apiEndpoints } from '@/lib/api/endpoints';
import type {
  ProjectPresenceItem,
  ProjectPresenceResponse,
} from '@/types/presence';

type RawPresenceResponse = ProjectPresenceItem[] | ProjectPresenceResponse;

const normalizePresenceResponse = (
  response: RawPresenceResponse,
): ProjectPresenceResponse => {
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
};

export const getProjectPresence = async (
  projectId: string,
): Promise<ProjectPresenceResponse> => {
  const response = await apiClient.get<RawPresenceResponse>(
    apiEndpoints.projects.presence(projectId),
  );

  return normalizePresenceResponse(response.data);
};