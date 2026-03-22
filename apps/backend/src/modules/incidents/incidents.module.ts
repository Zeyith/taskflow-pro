import { Module } from '@nestjs/common';

import { ProjectsModule } from '../projects/projects.module';
import { IncidentsController } from './incidents.controller';
import { IncidentsService } from './incidents.service';
import { IncidentRoomRepository } from './repositories/incident-room.repository';
import { INCIDENT_ROOM_REPOSITORY } from './repositories/interfaces/incident-room.repository.interface';

@Module({
  imports: [ProjectsModule],
  controllers: [IncidentsController],
  providers: [
    IncidentsService,
    {
      provide: INCIDENT_ROOM_REPOSITORY,
      useClass: IncidentRoomRepository,
    },
  ],
  exports: [IncidentsService, INCIDENT_ROOM_REPOSITORY],
})
export class IncidentsModule {}
