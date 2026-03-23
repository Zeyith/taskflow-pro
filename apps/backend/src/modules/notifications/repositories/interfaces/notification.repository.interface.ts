import type { NewNotificationRow } from '../../../../core/database/schema';
import { Notification } from '../../entities/notification.entity';

export const NOTIFICATION_REPOSITORY = Symbol('NOTIFICATION_REPOSITORY');

export type UpdateNotificationPayload = Partial<
  Pick<NewNotificationRow, 'isRead' | 'readAt'>
>;

export interface INotificationRepository {
  create(notification: NewNotificationRow): Promise<Notification>;
  findById(id: string): Promise<Notification | null>;
  findByRecipientUserId(
    recipientUserId: string,
    limit: number,
    offset: number,
  ): Promise<Notification[]>;
  countByRecipientUserId(recipientUserId: string): Promise<number>;
  updateById(
    id: string,
    payload: UpdateNotificationPayload,
  ): Promise<Notification | null>;
  markAllAsReadByRecipientUserId(
    recipientUserId: string,
    readAt: Date,
  ): Promise<number>;
  softDeleteById(
    id: string,
    recipientUserId: string,
  ): Promise<Notification | null>;
  countUnreadByRecipientUserId(recipientUserId: string): Promise<number>;
}
