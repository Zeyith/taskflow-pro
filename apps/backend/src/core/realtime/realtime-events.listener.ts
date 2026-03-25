import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { ProjectMemberAddedEvent } from '../../modules/projects/events/project-member-added.event';
import { ProjectMemberRemovedEvent } from '../../modules/projects/events/project-member-removed.event';
import { TaskAssigneeAddedEvent } from '../../modules/tasks/events/task-assignee-added.event';
import { TaskAssigneeRemovedEvent } from '../../modules/tasks/events/task-assignee-removed.event';
import { TaskAssignmentStatusChangedEvent } from '../../modules/tasks/events/task-assignment-status-changed.event';
import { TaskCreatedEvent } from '../../modules/tasks/events/task-created.event';
import { TaskDeletedEvent } from '../../modules/tasks/events/task-deleted.event';
import { TaskUpdatedEvent } from '../../modules/tasks/events/task-updated.event';
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

  @OnEvent(ProjectMemberAddedEvent.eventName)
  handleProjectMemberAdded(event: ProjectMemberAddedEvent): void {
    this.realtimeGateway.emitProjectMemberAdded(event);
  }

  @OnEvent(ProjectMemberRemovedEvent.eventName)
  handleProjectMemberRemoved(event: ProjectMemberRemovedEvent): void {
    this.realtimeGateway.emitProjectMemberRemoved(event);
  }

  @OnEvent(TaskCreatedEvent.eventName)
  handleTaskCreated(event: TaskCreatedEvent): void {
    this.realtimeGateway.emitTaskCreated(event);
  }

  @OnEvent(TaskUpdatedEvent.eventName)
  handleTaskUpdated(event: TaskUpdatedEvent): void {
    this.realtimeGateway.emitTaskUpdated(event);
  }

  @OnEvent(TaskDeletedEvent.eventName)
  handleTaskDeleted(event: TaskDeletedEvent): void {
    this.realtimeGateway.emitTaskDeleted(event);
  }

  @OnEvent(TaskAssigneeAddedEvent.eventName)
  handleTaskAssigneeAdded(event: TaskAssigneeAddedEvent): void {
    this.realtimeGateway.emitTaskAssigneeAdded(event);
  }

  @OnEvent(TaskAssigneeRemovedEvent.eventName)
  handleTaskAssigneeRemoved(event: TaskAssigneeRemovedEvent): void {
    this.realtimeGateway.emitTaskAssigneeRemoved(event);
  }
}
