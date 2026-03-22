type NotificationCreatedEventProps = Readonly<{
  notificationId: string;
  recipientUserId: string;
  projectId: string | null;
  taskId: string | null;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdBy: string;
  readAt: string | null;
  createdAt: string;
  updatedAt: string;
}>;

export class NotificationCreatedEvent {
  static readonly eventName = 'notification.created';

  constructor(readonly props: NotificationCreatedEventProps) {}
}
