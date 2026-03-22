export class Notification {
  constructor(
    public readonly id: string,
    public readonly recipientUserId: string,
    public readonly projectId: string | null,
    public readonly taskId: string | null,
    public readonly type: string,
    public readonly title: string,
    public readonly message: string,
    public readonly isRead: boolean,
    public readonly createdBy: string,
    public readonly readAt: Date | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly deletedAt: Date | null,
  ) {}
}
