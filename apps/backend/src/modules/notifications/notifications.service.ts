import { Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { AuthorizationError } from '../../common/exceptions/authorization.exception';
import { NotFoundError } from '../../common/exceptions/not-found.exception';
import type { AuthenticatedUser } from '../../common/types/authenticated-user.type';
import {
  CacheKey,
  DEFAULT_CACHE_TTL_SECONDS,
} from '../../core/cache/cache.constants';
import { CacheService } from '../../core/cache/cache.service';
import { Notification } from './entities/notification.entity';
import { NotificationCreatedEvent } from './events/notification-created.event';
import { NotificationUnreadCountUpdatedEvent } from './events/notification-unread-count-updated.event';
import {
  NOTIFICATION_REPOSITORY,
  type INotificationRepository,
} from './repositories/interfaces/notification.repository.interface';

type CreateNotificationInput = {
  recipientUserId: string;
  projectId?: string | null;
  taskId?: string | null;
  type: string;
  title: string;
  message: string;
  createdBy: string;
};

type ListNotificationsResult = {
  items: Notification[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
  };
};

@Injectable()
export class NotificationsService {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notificationRepository: INotificationRepository,
    private readonly eventEmitter: EventEmitter2,
    private readonly cacheService: CacheService,
  ) {}

  async createNotification(
    input: CreateNotificationInput,
  ): Promise<Notification> {
    const notification = await this.notificationRepository.create({
      recipientUserId: input.recipientUserId,
      projectId: input.projectId ?? null,
      taskId: input.taskId ?? null,
      type: input.type,
      title: input.title,
      message: input.message,
      isRead: false,
      createdBy: input.createdBy,
      readAt: null,
    });

    await this.cacheService.del(
      CacheKey.notificationUnreadCount(input.recipientUserId),
    );

    const unreadCount =
      await this.notificationRepository.countUnreadByRecipientUserId(
        input.recipientUserId,
      );

    this.eventEmitter.emit(
      NotificationCreatedEvent.eventName,
      new NotificationCreatedEvent({
        notificationId: notification.id,
        recipientUserId: notification.recipientUserId,
        projectId: notification.projectId,
        taskId: notification.taskId,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        isRead: notification.isRead,
        createdBy: notification.createdBy,
        readAt: notification.readAt ? notification.readAt.toISOString() : null,
        createdAt: notification.createdAt.toISOString(),
        updatedAt: notification.updatedAt.toISOString(),
      }),
    );

    this.eventEmitter.emit(
      NotificationUnreadCountUpdatedEvent.eventName,
      new NotificationUnreadCountUpdatedEvent({
        recipientUserId: input.recipientUserId,
        unreadCount,
      }),
    );

    return notification;
  }

  async listMyNotifications(
    actor: AuthenticatedUser,
    limit: number,
    offset: number,
  ): Promise<ListNotificationsResult> {
    const [items, total] = await Promise.all([
      this.notificationRepository.findByRecipientUserId(actor.sub, limit, offset),
      this.notificationRepository.countByRecipientUserId(actor.sub),
    ]);

    return {
      items,
      pagination: {
        limit,
        offset,
        total,
      },
    };
  }

  async getMyUnreadCount(actor: AuthenticatedUser): Promise<{
    data: {
      unreadCount: number;
    };
    meta: {
      isCached: boolean;
    };
  }> {
    const cacheKey = CacheKey.notificationUnreadCount(actor.sub);

    const cached = await this.cacheService.getJson<{ unreadCount: number }>(
      cacheKey,
    );

    if (cached) {
      return {
        data: cached,
        meta: {
          isCached: true,
        },
      };
    }

    const unreadCount =
      await this.notificationRepository.countUnreadByRecipientUserId(actor.sub);

    const data = {
      unreadCount,
    };

    await this.cacheService.setJson(cacheKey, data, DEFAULT_CACHE_TTL_SECONDS);

    return {
      data,
      meta: {
        isCached: false,
      },
    };
  }

  async markAsRead(
    actor: AuthenticatedUser,
    notificationId: string,
  ): Promise<Notification> {
    const notification =
      await this.notificationRepository.findById(notificationId);

    if (!notification) {
      throw new NotFoundError('Notification not found');
    }

    if (notification.recipientUserId !== actor.sub) {
      throw new AuthorizationError(
        'You are not allowed to modify this notification',
      );
    }

    if (notification.isRead) {
      return notification;
    }

    const updated = await this.notificationRepository.updateById(
      notificationId,
      {
        isRead: true,
        readAt: new Date(),
      },
    );

    if (!updated) {
      throw new NotFoundError('Notification not found');
    }

    await this.cacheService.del(CacheKey.notificationUnreadCount(actor.sub));

    const unreadCount =
      await this.notificationRepository.countUnreadByRecipientUserId(actor.sub);

    this.eventEmitter.emit(
      NotificationUnreadCountUpdatedEvent.eventName,
      new NotificationUnreadCountUpdatedEvent({
        recipientUserId: actor.sub,
        unreadCount,
      }),
    );

    return updated;
  }

  async markAllAsRead(actor: AuthenticatedUser): Promise<{
    data: {
      updatedCount: number;
    };
  }> {
    const updatedCount =
      await this.notificationRepository.markAllAsReadByRecipientUserId(
        actor.sub,
        new Date(),
      );

    await this.cacheService.del(CacheKey.notificationUnreadCount(actor.sub));

    const unreadCount =
      await this.notificationRepository.countUnreadByRecipientUserId(actor.sub);

    this.eventEmitter.emit(
      NotificationUnreadCountUpdatedEvent.eventName,
      new NotificationUnreadCountUpdatedEvent({
        recipientUserId: actor.sub,
        unreadCount,
      }),
    );

    return {
      data: {
        updatedCount,
      },
    };
  }

  async deleteNotification(
    actor: AuthenticatedUser,
    notificationId: string,
  ): Promise<Notification> {
    const notification =
      await this.notificationRepository.findById(notificationId);

    if (!notification) {
      throw new NotFoundError('Notification not found');
    }

    if (notification.recipientUserId !== actor.sub) {
      throw new AuthorizationError(
        'You are not allowed to delete this notification',
      );
    }

    const deleted = await this.notificationRepository.softDeleteById(
      notificationId,
      actor.sub,
    );

    if (!deleted) {
      throw new NotFoundError('Notification not found');
    }

    await this.cacheService.del(CacheKey.notificationUnreadCount(actor.sub));

    const unreadCount =
      await this.notificationRepository.countUnreadByRecipientUserId(actor.sub);

    this.eventEmitter.emit(
      NotificationUnreadCountUpdatedEvent.eventName,
      new NotificationUnreadCountUpdatedEvent({
        recipientUserId: actor.sub,
        unreadCount,
      }),
    );

    return deleted;
  }
}