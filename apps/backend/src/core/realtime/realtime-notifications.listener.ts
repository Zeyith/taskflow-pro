import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { NotificationCreatedEvent } from '../../modules/notifications/events/notification-created.event';
import { NotificationUnreadCountUpdatedEvent } from '../../modules/notifications/events/notification-unread-count-updated.event';
import { RealtimeGateway } from './realtime.gateway';

@Injectable()
export class RealtimeNotificationsListener {
  constructor(private readonly realtimeGateway: RealtimeGateway) {}

  @OnEvent(NotificationCreatedEvent.eventName)
  handleNotificationCreated(event: NotificationCreatedEvent): void {
    this.realtimeGateway.emitNotificationCreated(event);
  }

  @OnEvent(NotificationUnreadCountUpdatedEvent.eventName)
  handleUnreadCountUpdated(event: NotificationUnreadCountUpdatedEvent): void {
    this.realtimeGateway.emitNotificationUnreadCountUpdated(event);
  }
}
