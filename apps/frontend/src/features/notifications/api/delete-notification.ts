import { apiClient } from '@/lib/api/client';
import { apiEndpoints } from '@/lib/api/endpoints';
import type { Notification } from '@/types/notification';

type DeleteNotificationResponse =
  | Notification
  | {
      data: Notification;
      meta?: {
        isCached?: boolean;
      };
    };

function normalizeDeleteNotificationResponse(
  response: DeleteNotificationResponse,
): Notification {
  if ('data' in response) {
    return response.data;
  }

  return response;
}

export async function deleteNotificationRequest(
  notificationId: string,
): Promise<Notification> {
  const response = await apiClient.delete<DeleteNotificationResponse>(
    apiEndpoints.notifications.delete(notificationId),
  );

  return normalizeDeleteNotificationResponse(response.data);
}