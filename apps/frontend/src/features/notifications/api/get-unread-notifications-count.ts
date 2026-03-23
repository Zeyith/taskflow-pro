import { apiClient } from '@/lib/api/client';
import { apiEndpoints } from '@/lib/api/endpoints';
import type { UnreadNotificationsCountResponse } from '@/types/notification';

type RawUnreadCountResponse =
  | UnreadNotificationsCountResponse
  | {
      data?: {
        unreadCount?: number;
      };
      meta?: {
        isCached?: boolean;
      };
    };

function normalizeUnreadCountResponse(
  response: RawUnreadCountResponse,
): UnreadNotificationsCountResponse {
  if ('count' in response) {
    return response;
  }

  return {
    count: response.data?.unreadCount ?? 0,
  };
}

export async function getUnreadNotificationsCountRequest(): Promise<UnreadNotificationsCountResponse> {
  const response = await apiClient.get<RawUnreadCountResponse>(
    apiEndpoints.notifications.unreadCount,
  );

  return normalizeUnreadCountResponse(response.data);
}