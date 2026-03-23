import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import {
  PROJECT_MEMBER_REPOSITORY,
  type IProjectMemberRepository,
} from '../../projects/repositories/interfaces/project-member.repository.interface';
import { TaskAssignmentStatusChangedEvent } from '../../tasks/events/task-assignment-status-changed.event';
import { NotificationsService } from '../notifications.service';

@Injectable()
export class TaskNotificationsListener {
  constructor(
    @Inject(PROJECT_MEMBER_REPOSITORY)
    private readonly projectMemberRepository: IProjectMemberRepository,
    private readonly notificationsService: NotificationsService,
  ) {}

  @OnEvent(TaskAssignmentStatusChangedEvent.eventName)
  async handleTaskAssignmentStatusChanged(
    event: TaskAssignmentStatusChangedEvent,
  ): Promise<void> {
    const { props } = event;

    const members = await this.projectMemberRepository.findByProjectId(
      props.projectId,
    );

    if (members.length === 0) {
      return;
    }

    const title = 'Task status updated';
    const message = `Task status changed from ${props.oldStatus} to ${props.newStatus}.`;

    await Promise.all(
      members.map((member) =>
        this.notificationsService.createNotification({
          recipientUserId: member.userId,
          projectId: props.projectId,
          taskId: props.taskId,
          type: 'TASK_STATUS_CHANGED',
          title,
          message,
          createdBy: props.changedBy,
        }),
      ),
    );
  }
}