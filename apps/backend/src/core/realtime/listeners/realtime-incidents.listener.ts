import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { IncidentCreatedEvent } from '../../../modules/incidents/events/incident-created.event';
import { IncidentResolvedEvent } from '../../../modules/incidents/events/incident-resolved.event';
import { RealtimeGateway } from '../realtime.gateway';

@Injectable()
export class RealtimeIncidentsListener {
  constructor(private readonly realtimeGateway: RealtimeGateway) {}

  @OnEvent('incident.created')
  handleIncidentCreated(event: IncidentCreatedEvent): void {
    this.realtimeGateway.emitIncidentCreated(event);
  }

  @OnEvent('incident.resolved')
  handleIncidentResolved(event: IncidentResolvedEvent): void {
    this.realtimeGateway.emitIncidentResolved(event);
  }
}
