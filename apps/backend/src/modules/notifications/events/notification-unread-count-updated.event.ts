type NotificationUnreadCountUpdatedEventProps = Readonly<{
  recipientUserId: string;
  unreadCount: number;
}>;

export class NotificationUnreadCountUpdatedEvent {
  static readonly eventName = 'notification.unread-count.updated';

  constructor(readonly props: NotificationUnreadCountUpdatedEventProps) {}
}
