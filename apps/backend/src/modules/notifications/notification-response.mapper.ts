import { Notification } from './entities/notification.entity';

export type NotificationResponse = Readonly<{
  id: string;
  recipientUserId: string;
  projectId: string | null;
  projectName: string | null;
  taskId: string | null;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdBy: string;
  createdByUser: Readonly<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  }> | null;
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
    projectName: notification.projectName,
    taskId: notification.taskId,
    type: notification.type,
    title: notification.title,
    message: notification.message,
    isRead: notification.isRead,
    createdBy: notification.createdBy,
    createdByUser: notification.createdByUser
      ? {
          id: notification.createdByUser.id,
          firstName: notification.createdByUser.firstName,
          lastName: notification.createdByUser.lastName,
          email: notification.createdByUser.email,
          role: notification.createdByUser.role,
        }
      : null,
    readAt: notification.readAt,
    createdAt: notification.createdAt,
    updatedAt: notification.updatedAt,
  };
}