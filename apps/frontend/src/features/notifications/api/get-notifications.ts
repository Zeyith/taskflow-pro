import { apiClient } from '@/lib/api/client';
import { apiEndpoints } from '@/lib/api/endpoints';
import type {
  Notification,
  NotificationsListResponse,
} from '@/types/notification';

type RawNotificationActorUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
};

type RawNotification = {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  projectId?: string | null;
  projectName?: string | null;
  taskId?: string | null;
  incidentId?: string | null;
  createdBy?: string;
  createdByUser?: RawNotificationActorUser | null;
  readAt?: string | null;
  updatedAt?: string;
};

type RawNotificationsResponse =
  | {
      items?: RawNotification[];
      pagination?: {
        limit?: number;
        offset?: number;
        total?: number;
      };
      meta?: {
        isCached?: boolean;
        total?: number;
      };
    }
  | RawNotification[];

export type GetNotificationsRequestParams = {
  limit: number;
  offset: number;
};

function mapNotification(item: RawNotification): Notification {
  return {
    id: item.id,
    type: item.type,
    title: item.title,
    message: item.message,
    isRead: item.isRead,
    createdAt: item.createdAt,
    projectId: item.projectId ?? null,
    projectName: item.projectName ?? null,
    taskId: item.taskId ?? null,
    incidentId: item.incidentId ?? null,
    createdBy: item.createdBy,
    createdByUser: item.createdByUser ?? null,
    readAt: item.readAt ?? null,
    updatedAt: item.updatedAt,
  };
}

function normalizeNotificationsResponse(
  response: RawNotificationsResponse,
): NotificationsListResponse {
  if (Array.isArray(response)) {
    return {
      data: response.map(mapNotification),
      meta: {
        isCached: false,
      },
    };
  }

  return {
    data: Array.isArray(response.items)
      ? response.items.map(mapNotification)
      : [],
    meta: {
      isCached: response.meta?.isCached ?? false,
      limit: response.pagination?.limit,
      offset: response.pagination?.offset,
      total: response.pagination?.total ?? response.meta?.total,
    },
  };
}

export async function getNotificationsRequest(
  params: GetNotificationsRequestParams,
): Promise<NotificationsListResponse> {
  const response = await apiClient.get<RawNotificationsResponse>(
    apiEndpoints.notifications.list,
    {
      params: {
        limit: params.limit,
        offset: params.offset,
      },
    },
  );

  return normalizeNotificationsResponse(response.data);
}