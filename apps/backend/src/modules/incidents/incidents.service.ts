import { EventEmitter2 } from '@nestjs/event-emitter';
import { Inject, Injectable } from '@nestjs/common';

import { AuthorizationError } from '../../common/exceptions/authorization.exception';
import { BusinessRuleError } from '../../common/exceptions/business-rule.exception';
import { NotFoundError } from '../../common/exceptions/not-found.exception';
import type { AuthenticatedUser } from '../../common/types/authenticated-user.type';
import {
  PROJECT_MEMBER_REPOSITORY,
  type IProjectMemberRepository,
} from '../projects/repositories/interfaces/project-member.repository.interface';
import {
  PROJECT_REPOSITORY,
  type IProjectRepository,
} from '../projects/repositories/interfaces/project.repository.interface';
import type {
  AccessibleIncidentListQueryDto,
  CreateIncidentDto,
} from './dto/incidents-validation.schema';
import { IncidentCreatedEvent } from './events/incident-created.event';
import { IncidentResolvedEvent } from './events/incident-resolved.event';
import {
  toIncidentResponse,
  type IncidentResponse,
} from './mappers/incident-response.mapper';
import {
  INCIDENT_ROOM_REPOSITORY,
  type IIncidentRoomRepository,
} from './repositories/interfaces/incident-room.repository.interface';
import { INCIDENT_STATUS } from './types/incident-status.type';

@Injectable()
export class IncidentsService {
  constructor(
    @Inject(INCIDENT_ROOM_REPOSITORY)
    private readonly incidentRoomRepository: IIncidentRoomRepository,
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: IProjectRepository,
    @Inject(PROJECT_MEMBER_REPOSITORY)
    private readonly projectMemberRepository: IProjectMemberRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async createIncident(
    payload: CreateIncidentDto,
    currentUser: AuthenticatedUser,
  ): Promise<{
    data: IncidentResponse;
    meta: {
      isCached: boolean;
    };
  }> {
    this.ensureTeamLead(currentUser);
    await this.ensureProjectExists(payload.projectId);

    const incident = await this.incidentRoomRepository.create({
      projectId: payload.projectId,
      title: payload.title,
      description: payload.description ?? null,
      severity: payload.severity,
      status: INCIDENT_STATUS.ACTIVE,
      createdBy: currentUser.sub,
      closedAt: null,
    });

    const incidentResponse = toIncidentResponse(incident);

    this.eventEmitter.emit(
      'incident.created',
      new IncidentCreatedEvent({
        incidentId: incidentResponse.id,
        projectId: incidentResponse.projectId,
        title: incidentResponse.title,
        description: incidentResponse.description,
        severity: incidentResponse.severity,
        status: incidentResponse.status,
        createdBy: incidentResponse.createdBy,
        closedAt: incidentResponse.closedAt,
        createdAt: incidentResponse.createdAt,
        updatedAt: incidentResponse.updatedAt,
      }),
    );

    return {
      data: incidentResponse,
      meta: {
        isCached: false,
      },
    };
  }

  async listAccessibleIncidents(
    query: AccessibleIncidentListQueryDto,
    currentUser: AuthenticatedUser,
  ): Promise<{
    data: IncidentResponse[];
    meta: {
      isCached: boolean;
      limit: number;
      offset: number;
      total: number;
    };
  }> {
    const { projectId, severity, status, limit, offset } = query;

    if (currentUser.role === 'TEAM_LEAD') {
      if (projectId) {
        await this.ensureProjectExists(projectId);
      }

      const result = await this.incidentRoomRepository.findMany({
        projectIds: projectId ? [projectId] : undefined,
        severity,
        status,
        limit,
        offset,
      });

      return {
        data: result.items.map(toIncidentResponse),
        meta: {
          isCached: false,
          limit,
          offset,
          total: result.total,
        },
      };
    }

    if (projectId) {
      await this.ensureProjectAccess(projectId, currentUser);

      const result = await this.incidentRoomRepository.findMany({
        projectIds: [projectId],
        severity,
        status,
        limit,
        offset,
      });

      return {
        data: result.items.map(toIncidentResponse),
        meta: {
          isCached: false,
          limit,
          offset,
          total: result.total,
        },
      };
    }

    const accessibleProjectIds =
      await this.projectMemberRepository.findActiveProjectIdsByUserId(
        currentUser.sub,
      );

    if (accessibleProjectIds.length === 0) {
      return {
        data: [],
        meta: {
          isCached: false,
          limit,
          offset,
          total: 0,
        },
      };
    }

    const result = await this.incidentRoomRepository.findMany({
      projectIds: accessibleProjectIds,
      severity,
      status,
      limit,
      offset,
    });

    return {
      data: result.items.map(toIncidentResponse),
      meta: {
        isCached: false,
        limit,
        offset,
        total: result.total,
      },
    };
  }

  async getIncidentById(
    id: string,
    currentUser: AuthenticatedUser,
  ): Promise<{
    data: IncidentResponse;
    meta: {
      isCached: boolean;
    };
  }> {
    const incident = await this.incidentRoomRepository.findById(id);

    if (!incident) {
      throw new NotFoundError('Incident room not found');
    }

    await this.ensureProjectAccess(incident.projectId, currentUser);

    return {
      data: toIncidentResponse(incident),
      meta: {
        isCached: false,
      },
    };
  }

  async listProjectIncidents(
    projectId: string,
    currentUser: AuthenticatedUser,
  ): Promise<{
    data: IncidentResponse[];
    meta: {
      isCached: boolean;
    };
  }> {
    await this.ensureProjectAccess(projectId, currentUser);

    const incidents =
      await this.incidentRoomRepository.findByProjectId(projectId);

    return {
      data: incidents.map(toIncidentResponse),
      meta: {
        isCached: false,
      },
    };
  }

  async closeIncident(
    id: string,
    currentUser: AuthenticatedUser,
  ): Promise<{
    data: IncidentResponse;
    meta: {
      isCached: boolean;
    };
  }> {
    this.ensureTeamLead(currentUser);

    const incident = await this.incidentRoomRepository.findById(id);

    if (!incident) {
      throw new NotFoundError('Incident room not found');
    }

    if (incident.status === INCIDENT_STATUS.RESOLVED) {
      throw new BusinessRuleError('Incident room is already resolved');
    }

    const closedIncident = await this.incidentRoomRepository.close(
      id,
      new Date(),
    );

    if (!closedIncident) {
      throw new NotFoundError('Incident room not found');
    }

    const closedIncidentResponse = toIncidentResponse(closedIncident);

    this.eventEmitter.emit(
      'incident.resolved',
      new IncidentResolvedEvent({
        incidentId: closedIncidentResponse.id,
        projectId: closedIncidentResponse.projectId,
        title: closedIncidentResponse.title,
        description: closedIncidentResponse.description,
        severity: closedIncidentResponse.severity,
        status: closedIncidentResponse.status,
        createdBy: closedIncidentResponse.createdBy,
        closedAt: closedIncidentResponse.closedAt,
        createdAt: closedIncidentResponse.createdAt,
        updatedAt: closedIncidentResponse.updatedAt,
      }),
    );

    return {
      data: closedIncidentResponse,
      meta: {
        isCached: false,
      },
    };
  }

  private async ensureProjectExists(projectId: string): Promise<void> {
    const project = await this.projectRepository.findById(projectId);

    if (!project) {
      throw new NotFoundError('Project not found');
    }
  }

  private async ensureProjectAccess(
    projectId: string,
    currentUser: AuthenticatedUser,
  ): Promise<void> {
    await this.ensureProjectExists(projectId);

    if (currentUser.role === 'TEAM_LEAD') {
      return;
    }

    const membership = await this.projectMemberRepository.findActiveMembership(
      projectId,
      currentUser.sub,
    );

    if (!membership) {
      throw new AuthorizationError(
        'You are not allowed to access incidents for this project',
      );
    }
  }

  private ensureTeamLead(currentUser: AuthenticatedUser): void {
    if (currentUser.role !== 'TEAM_LEAD') {
      throw new AuthorizationError('Only team leads can perform this action');
    }
  }
}