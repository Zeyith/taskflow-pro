import { Inject, Injectable } from '@nestjs/common';
import { and, count, desc, eq, isNull } from 'drizzle-orm';

import { DATABASE_CONNECTION } from '../../../core/database/database.module';
import type { AppDb } from '../../../core/database/database.types';
import {
  notifications,
  type NewNotificationRow,
  type NotificationRow,
} from '../../../core/database/schema';
import { Notification } from '../entities/notification.entity';
import type {
  INotificationRepository,
  UpdateNotificationPayload,
} from './interfaces/notification.repository.interface';

@Injectable()
export class NotificationRepository implements INotificationRepository {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: AppDb,
  ) {}

  async create(notification: NewNotificationRow): Promise<Notification> {
    const [createdRow] = await this.db
      .insert(notifications)
      .values(notification)
      .returning();

    if (!createdRow) {
      throw new Error('Notification creation failed');
    }

    return this.toDomain(createdRow);
  }

  async findById(id: string): Promise<Notification | null> {
    const [row] = await this.db
      .select()
      .from(notifications)
      .where(and(eq(notifications.id, id), isNull(notifications.deletedAt)))
      .limit(1);

    if (!row) {
      return null;
    }

    return this.toDomain(row);
  }

  async findByRecipientUserId(
    recipientUserId: string,
    limit: number,
    offset: number,
  ): Promise<Notification[]> {
    const rows = await this.db
      .select()
      .from(notifications)
      .where(
        and(
          eq(notifications.recipientUserId, recipientUserId),
          isNull(notifications.deletedAt),
        ),
      )
      .orderBy(desc(notifications.createdAt))
      .limit(limit)
      .offset(offset);

    return rows.map((row) => this.toDomain(row));
  }

  async updateById(
    id: string,
    payload: UpdateNotificationPayload,
  ): Promise<Notification | null> {
    const hasNoFields = Object.keys(payload).length === 0;

    if (hasNoFields) {
      return this.findById(id);
    }

    const [updatedRow] = await this.db
      .update(notifications)
      .set({
        isRead: payload.isRead,
        readAt: payload.readAt,
        updatedAt: new Date(),
      })
      .where(and(eq(notifications.id, id), isNull(notifications.deletedAt)))
      .returning();

    if (!updatedRow) {
      return null;
    }

    return this.toDomain(updatedRow);
  }

  async countUnreadByRecipientUserId(recipientUserId: string): Promise<number> {
    const [result] = await this.db
      .select({ count: count() })
      .from(notifications)
      .where(
        and(
          eq(notifications.recipientUserId, recipientUserId),
          eq(notifications.isRead, false),
          isNull(notifications.deletedAt),
        ),
      );

    return result?.count ?? 0;
  }

  private toDomain(row: NotificationRow): Notification {
    return new Notification(
      row.id,
      row.recipientUserId,
      row.projectId ?? null,
      row.taskId ?? null,
      row.type,
      row.title,
      row.message,
      row.isRead,
      row.createdBy,
      row.readAt ?? null,
      row.createdAt,
      row.updatedAt,
      row.deletedAt ?? null,
    );
  }
}
