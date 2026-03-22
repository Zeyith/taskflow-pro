import { Module } from '@nestjs/common';

import { ProjectsModule } from '../projects/projects.module';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { TaskNotificationsListener } from './listeners/task-notifications.listener';
import { NotificationRepository } from './repositories/notification.repository';
import { NOTIFICATION_REPOSITORY } from './repositories/interfaces/notification.repository.interface';
import { IncidentNotificationsListener } from './listeners/incident-notifications.listener';
import { IncidentResolvedNotificationsListener } from './listeners/incident-resolved-notifications.listener';

@Module({
  imports: [ProjectsModule],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    TaskNotificationsListener,
    NotificationRepository,
    IncidentNotificationsListener,
    IncidentResolvedNotificationsListener,
    {
      provide: NOTIFICATION_REPOSITORY,
      useExisting: NotificationRepository,
    },
  ],
  exports: [
    NotificationsService,
    NOTIFICATION_REPOSITORY,
    NotificationRepository,
  ],
})
export class NotificationsModule {}
