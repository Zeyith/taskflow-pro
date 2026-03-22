import { Inject, Injectable } from '@nestjs/common';

import { AuthorizationError } from '../../common/exceptions/authorization.exception';
import { NotFoundError } from '../../common/exceptions/not-found.exception';
import type { AuthTokenPayload } from '../../common/types/auth-token-payload.type';
import {
  PROJECT_REPOSITORY,
  type IProjectRepository,
} from '../../modules/projects/repositories/interfaces/project.repository.interface';
import {
  PROJECT_MEMBER_REPOSITORY,
  type IProjectMemberRepository,
} from '../../modules/projects/repositories/interfaces/project-member.repository.interface';

@Injectable()
export class RealtimeAccessService {
  constructor(
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: IProjectRepository,
    @Inject(PROJECT_MEMBER_REPOSITORY)
    private readonly projectMemberRepository: IProjectMemberRepository,
  ) {}

  async ensureProjectRoomJoinAllowed(
    actor: AuthTokenPayload,
    projectId: string,
  ): Promise<void> {
    const project = await this.projectRepository.findById(projectId);

    if (!project) {
      throw new NotFoundError('Project not found');
    }

    if (actor.role === 'TEAM_LEAD') {
      return;
    }

    const membership = await this.projectMemberRepository.findActiveMembership(
      projectId,
      actor.sub,
    );

    if (!membership) {
      throw new AuthorizationError(
        'You are not allowed to join this project room',
      );
    }
  }
}
