import { apiClient } from '@/lib/api/client';
import { apiEndpoints } from '@/lib/api/endpoints';
import type { Notification } from '@/types/notification';

type MarkNotificationAsReadResponse =
  | Notification
  | {
      data: Notification;
      meta?: {
        isCached?: boolean;
      };
    };

function normalizeMarkAsReadResponse(
  response: MarkNotificationAsReadResponse,
): Notification {
  if ('data' in response) {
    return response.data;
  }

  return response;
}

export async function markNotificationAsReadRequest(
  notificationId: string,
): Promise<Notification> {
  const response = await apiClient.patch<MarkNotificationAsReadResponse>(
    apiEndpoints.notifications.markRead(notificationId),
  );

  return normalizeMarkAsReadResponse(response.data);
}