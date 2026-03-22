import { Notification } from './entities/notification.entity';

export type NotificationResponse = Readonly<{
  id: string;
  recipientUserId: string;
  projectId: string | null;
  taskId: string | null;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdBy: string;
  readAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}>;

export function toNotificationResponse(
  notification: Notification,
): NotificationResponse {
  return {
    id: notification.id,
    recipientUserId: notification.recipientUserId,
    projectId: notification.projectId,
    taskId: notification.taskId,
    type: notification.type,
    title: notification.title,
    message: notification.message,
    isRead: notification.isRead,
    createdBy: notification.createdBy,
    readAt: notification.readAt,
    createdAt: notification.createdAt,
    updatedAt: notification.updatedAt,
  };
}
