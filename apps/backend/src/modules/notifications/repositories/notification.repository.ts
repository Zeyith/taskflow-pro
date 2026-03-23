import { Inject, Injectable } from '@nestjs/common';
import { and, count, desc, eq, isNull } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';

import { DATABASE_CONNECTION } from '../../../core/database/database.module';
import type { AppDb } from '../../../core/database/database.types';
import {
  notifications,
  projects,
  users,
  type NewNotificationRow,
  type NotificationRow,
  type ProjectRow,
  type UserRow,
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
    const actorUser = alias(users, 'notification_actor_user');

    const [row] = await this.db
      .select({
        notification: notifications,
        project: projects,
        actorUser,
      })
      .from(notifications)
      .leftJoin(projects, eq(notifications.projectId, projects.id))
      .leftJoin(actorUser, eq(notifications.createdBy, actorUser.id))
      .where(and(eq(notifications.id, id), isNull(notifications.deletedAt)))
      .limit(1);

    if (!row) {
      return null;
    }

    return this.toDomainWithRelations(
      row.notification,
      row.project ?? null,
      row.actorUser ?? null,
    );
  }

  async findByRecipientUserId(
    recipientUserId: string,
    limit: number,
    offset: number,
  ): Promise<Notification[]> {
    const actorUser = alias(users, 'notification_actor_user');

    const rows = await this.db
      .select({
        notification: notifications,
        project: projects,
        actorUser,
      })
      .from(notifications)
      .leftJoin(projects, eq(notifications.projectId, projects.id))
      .leftJoin(actorUser, eq(notifications.createdBy, actorUser.id))
      .where(
        and(
          eq(notifications.recipientUserId, recipientUserId),
          isNull(notifications.deletedAt),
        ),
      )
      .orderBy(desc(notifications.createdAt))
      .limit(limit)
      .offset(offset);

    return rows.map((row) =>
      this.toDomainWithRelations(
        row.notification,
        row.project ?? null,
        row.actorUser ?? null,
      ),
    );
  }

  async countByRecipientUserId(recipientUserId: string): Promise<number> {
    const [result] = await this.db
      .select({ count: count() })
      .from(notifications)
      .where(
        and(
          eq(notifications.recipientUserId, recipientUserId),
          isNull(notifications.deletedAt),
        ),
      );

    return result?.count ?? 0;
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

  async markAllAsReadByRecipientUserId(
    recipientUserId: string,
    readAt: Date,
  ): Promise<number> {
    const updatedRows = await this.db
      .update(notifications)
      .set({
        isRead: true,
        readAt,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(notifications.recipientUserId, recipientUserId),
          eq(notifications.isRead, false),
          isNull(notifications.deletedAt),
        ),
      )
      .returning({ id: notifications.id });

    return updatedRows.length;
  }

  async softDeleteById(
    id: string,
    recipientUserId: string,
  ): Promise<Notification | null> {
    const [deletedRow] = await this.db
      .update(notifications)
      .set({
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(notifications.id, id),
          eq(notifications.recipientUserId, recipientUserId),
          isNull(notifications.deletedAt),
        ),
      )
      .returning();

    if (!deletedRow) {
      return null;
    }

    return this.toDomain(deletedRow);
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
      null,
      row.taskId ?? null,
      row.type,
      row.title,
      row.message,
      row.isRead,
      row.createdBy,
      null,
      row.readAt ?? null,
      row.createdAt,
      row.updatedAt,
      row.deletedAt ?? null,
    );
  }

  private toDomainWithRelations(
    notificationRow: NotificationRow,
    projectRow: ProjectRow | null,
    actorUserRow: UserRow | null,
  ): Notification {
    return new Notification(
      notificationRow.id,
      notificationRow.recipientUserId,
      notificationRow.projectId ?? null,
      projectRow?.name ?? null,
      notificationRow.taskId ?? null,
      notificationRow.type,
      notificationRow.title,
      notificationRow.message,
      notificationRow.isRead,
      notificationRow.createdBy,
      actorUserRow
        ? {
            id: actorUserRow.id,
            firstName: actorUserRow.firstName,
            lastName: actorUserRow.lastName,
            email: actorUserRow.email,
            role: actorUserRow.role,
          }
        : null,
      notificationRow.readAt ?? null,
      notificationRow.createdAt,
      notificationRow.updatedAt,
      notificationRow.deletedAt ?? null,
    );
  }
}