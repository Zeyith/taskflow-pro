export type NotificationType =
  | 'TASK_STATUS_CHANGED'
  | 'TASK_UPDATED'
  | 'NEW_ASSIGNMENT'
  | 'INCIDENT_CREATED'
  | 'INCIDENT_RESOLVED'
  | string;

export type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  projectId?: string | null;
  taskId?: string | null;
  incidentId?: string | null;
};

export type NotificationsMeta = {
  isCached?: boolean;
  limit?: number;
  offset?: number;
  total?: number;
};

export type NotificationsListResponse = {
  data: Notification[];
  meta?: NotificationsMeta;
};

export type UnreadNotificationsCountResponse = {
  count: number;
};