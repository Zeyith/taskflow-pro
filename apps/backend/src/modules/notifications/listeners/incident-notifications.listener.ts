import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { IncidentCreatedEvent } from '../../incidents/events/incident-created.event';
import {
  PROJECT_MEMBER_REPOSITORY,
  type IProjectMemberRepository,
} from '../../projects/repositories/interfaces/project-member.repository.interface';
import { NotificationsService } from '../notifications.service';

@Injectable()
export class IncidentNotificationsListener {
  constructor(
    @Inject(PROJECT_MEMBER_REPOSITORY)
    private readonly projectMemberRepository: IProjectMemberRepository,
    private readonly notificationsService: NotificationsService,
  ) {}

  @OnEvent('incident.created')
  async handleIncidentCreated(event: IncidentCreatedEvent): Promise<void> {
    const { props } = event;

    const members = await this.projectMemberRepository.findByProjectId(
      props.projectId,
    );

    const recipients = members.filter(
      (member) => member.userId !== props.createdBy,
    );

    if (recipients.length === 0) {
      return;
    }

    const title = `[${props.severity}] Incident created`;
    const message =
      props.description && props.description.trim().length > 0
        ? `${props.title}: ${props.description}`
        : props.title;

    await Promise.all(
      recipients.map((recipient) =>
        this.notificationsService.createNotification({
          recipientUserId: recipient.userId,
          projectId: props.projectId,
          taskId: null,
          type: 'INCIDENT_CREATED',
          title,
          message,
          createdBy: props.createdBy,
        }),
      ),
    );
  }
}
