import { apiClient } from '@/lib/api/client';
import { apiEndpoints } from '@/lib/api/endpoints';
import type {
  Notification,
  NotificationsListResponse,
} from '@/types/notification';

type RawNotificationsResponse =
  | Notification[]
  | {
      data?: Notification[];
      meta?: {
        isCached?: boolean;
        limit?: number;
        offset?: number;
        total?: number;
      };
    };

function normalizeNotificationsResponse(
  response: RawNotificationsResponse,
): NotificationsListResponse {
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

export async function getNotificationsRequest(): Promise<NotificationsListResponse> {
  const response = await apiClient.get<RawNotificationsResponse>(
    apiEndpoints.notifications.list,
    {
      params: {
        limit: 20,
        offset: 0,
      },
    },
  );

  return normalizeNotificationsResponse(response.data);
}