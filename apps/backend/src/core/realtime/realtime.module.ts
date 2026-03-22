import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { ConfigsModule } from '../../common/configs/configs.module';
import { ProjectsModule } from '../../modules/projects/projects.module';
import { ConnectionManagerService } from './connection-manager.service';
import { RealtimeAccessService } from './realtime-access.service';
import { RealtimeGateway } from './realtime.gateway';
import { RealtimeEventsListener } from './realtime-events.listener';
import { RealtimeNotificationsListener } from './realtime-notifications.listener';
import { RealtimeIncidentsListener } from './listeners/realtime-incidents.listener';
import { PresenceModule } from '../../modules/presence/presence.module';

@Global()
@Module({
  imports: [JwtModule, ConfigsModule, ProjectsModule, PresenceModule],
  providers: [
    RealtimeGateway,
    ConnectionManagerService,
    RealtimeAccessService,
    RealtimeEventsListener,
    RealtimeNotificationsListener,
    RealtimeIncidentsListener,
  ],
  exports: [RealtimeGateway, ConnectionManagerService, RealtimeAccessService],
})
export class RealtimeModule {}
