import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { TaskAssignmentStatusChangedEvent } from '../../modules/tasks/events/task-assignment-status-changed.event';
import { RealtimeGateway } from './realtime.gateway';

@Injectable()
export class RealtimeEventsListener {
  constructor(private readonly realtimeGateway: RealtimeGateway) {}

  @OnEvent(TaskAssignmentStatusChangedEvent.eventName)
  handleTaskAssignmentStatusChanged(
    event: TaskAssignmentStatusChangedEvent,
  ): void {
    this.realtimeGateway.emitTaskAssignmentStatusChanged(event);
  }
}
