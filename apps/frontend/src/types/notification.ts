export type NotificationType =
  | 'TASK_STATUS_CHANGED'
  | 'TASK_UPDATED'
  | 'NEW_ASSIGNMENT'
  | 'INCIDENT_CREATED'
  | 'INCIDENT_RESOLVED'
  | string;

export type NotificationActorUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
};

export type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  projectId?: string | null;
  projectName?: string | null;
  taskId?: string | null;
  incidentId?: string | null;
  createdBy?: string;
  createdByUser?: NotificationActorUser | null;
  readAt?: string | null;
  updatedAt?: string;
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