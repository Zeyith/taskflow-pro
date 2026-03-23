import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { IncidentResolvedEvent } from '../../incidents/events/incident-resolved.event';
import {
  PROJECT_MEMBER_REPOSITORY,
  type IProjectMemberRepository,
} from '../../projects/repositories/interfaces/project-member.repository.interface';
import { NotificationsService } from '../notifications.service';

@Injectable()
export class IncidentResolvedNotificationsListener {
  constructor(
    @Inject(PROJECT_MEMBER_REPOSITORY)
    private readonly projectMemberRepository: IProjectMemberRepository,
    private readonly notificationsService: NotificationsService,
  ) {}

  @OnEvent('incident.resolved')
  async handleIncidentResolved(event: IncidentResolvedEvent): Promise<void> {
    const { props } = event;

    const members = await this.projectMemberRepository.findByProjectId(
      props.projectId,
    );

    if (members.length === 0) {
      return;
    }

    const title = `[${props.severity}] Incident resolved`;
    const message = props.title;

    await Promise.all(
      members.map((member) =>
        this.notificationsService.createNotification({
          recipientUserId: member.userId,
          projectId: props.projectId,
          taskId: null,
          type: 'INCIDENT_RESOLVED',
          title,
          message,
          createdBy: props.createdBy,
        }),
      ),
    );
  }
}
