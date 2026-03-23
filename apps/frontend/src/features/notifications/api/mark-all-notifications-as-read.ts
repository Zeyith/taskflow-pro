import { apiClient } from '@/lib/api/client';
import { apiEndpoints } from '@/lib/api/endpoints';

type RawMarkAllNotificationsAsReadResponse =
  | {
      data?: {
        updatedCount?: number;
      };
    }
  | {
      updatedCount: number;
    };

type MarkAllNotificationsAsReadResponse = {
  updatedCount: number;
};

function normalizeMarkAllAsReadResponse(
  response: RawMarkAllNotificationsAsReadResponse,
): MarkAllNotificationsAsReadResponse {
  if ('updatedCount' in response) {
    return response;
  }

  return {
    updatedCount: response.data?.updatedCount ?? 0,
  };
}

export async function markAllNotificationsAsReadRequest(): Promise<MarkAllNotificationsAsReadResponse> {
  const response =
    await apiClient.patch<RawMarkAllNotificationsAsReadResponse>(
      apiEndpoints.notifications.markAllRead,
    );

  return normalizeMarkAllAsReadResponse(response.data);
}