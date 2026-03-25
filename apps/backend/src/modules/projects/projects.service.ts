import { Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { AuthorizationError } from '../../common/exceptions/authorization.exception';
import { BusinessRuleError } from '../../common/exceptions/business-rule.exception';
import { NotFoundError } from '../../common/exceptions/not-found.exception';
import type { UserRole } from '../../common/types/user-role.type';
import { CacheKey } from '../../core/cache/cache.constants';
import { CacheService } from '../../core/cache/cache.service';
import {
  TASK_ASSIGNEE_REPOSITORY,
  type ITaskAssigneeRepository,
} from '../tasks/repositories/interfaces/task-assignee.repository.interface';
import { ProjectMemberAddedEvent } from './events/project-member-added.event';
import { ProjectMemberRemovedEvent } from './events/project-member-removed.event';
import {
  PROJECT_MEMBER_REPOSITORY,
  type IProjectMemberRepository,
} from './repositories/interfaces/project-member.repository.interface';
import {
  PROJECT_REPOSITORY,
  type IProjectRepository,
} from './repositories/interfaces/project.repository.interface';

type CreateProjectInput = {
  name: string;
  description: string | null;
  createdBy: string;
};

type UpdateProjectInput = {
  projectId: string;
  name?: string;
  description?: string | null;
};

type RequestUserContext = {
  userId: string;
  role: UserRole;
};

type AddProjectMemberInput = {
  projectId: string;
  userId: string;
  addedBy: string;
};

type RemoveProjectMemberInput = {
  projectId: string;
  userId: string;
  removedBy: string;
};

@Injectable()
export class ProjectsService {
  constructor(
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: IProjectRepository,
    @Inject(PROJECT_MEMBER_REPOSITORY)
    private readonly projectMemberRepository: IProjectMemberRepository,
    @Inject(TASK_ASSIGNEE_REPOSITORY)
    private readonly taskAssigneeRepository: ITaskAssigneeRepository,
    private readonly cacheService: CacheService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(input: CreateProjectInput) {
    const project = await this.projectRepository.create({
      name: input.name,
      description: input.description,
      createdBy: input.createdBy,
    });

    await this.projectMemberRepository.create({
      projectId: project.id,
      userId: input.createdBy,
      addedBy: input.createdBy,
    });

    return this.toResponse(project);
  }

  async findAll(limit: number, offset: number, actor: RequestUserContext) {
    if (actor.role === 'TEAM_LEAD') {
      const projects = await this.projectRepository.findAll(limit, offset);

      return projects.map((project) => this.toResponse(project));
    }

    const projects = await this.projectMemberRepository.findProjectsByUserId(
      actor.userId,
      limit,
      offset,
    );

    return projects.map((project) => this.toResponse(project));
  }

  async findById(id: string, actor: RequestUserContext) {
    const project = await this.projectRepository.findById(id);

    if (!project) {
      throw new NotFoundError('Project not found');
    }

    if (actor.role === 'EMPLOYEE') {
      const membership =
        await this.projectMemberRepository.findActiveMembership(
          id,
          actor.userId,
        );

      if (!membership) {
        throw new NotFoundError('Project not found');
      }
    }

    return this.toResponse(project);
  }

  async update(input: UpdateProjectInput) {
    const project = await this.projectRepository.findById(input.projectId);

    if (!project) {
      throw new NotFoundError('Project not found');
    }

    if (project.isArchived) {
      throw new BusinessRuleError('Archived projects cannot be updated');
    }

    const updatedProject = await this.projectRepository.update(
      input.projectId,
      {
        name: input.name,
        description: input.description,
      },
    );

    if (!updatedProject) {
      throw new NotFoundError('Project not found');
    }

    await this.cacheService.del(CacheKey.projectTasks(input.projectId));

    return this.toResponse(updatedProject);
  }

  async archive(id: string) {
    const existingProject = await this.projectRepository.findById(id);

    if (!existingProject) {
      throw new NotFoundError('Project not found');
    }

    if (existingProject.isArchived) {
      throw new BusinessRuleError('Project is already archived');
    }

    const project = await this.projectRepository.archive(id);

    if (!project) {
      throw new NotFoundError('Project not found');
    }

    await this.cacheService.del(CacheKey.projectTasks(id));

    return this.toResponse(project);
  }

  async softDelete(id: string) {
    const project = await this.projectRepository.findById(id);

    if (!project) {
      throw new NotFoundError('Project not found');
    }

    if (!project.isArchived) {
      throw new BusinessRuleError('Only archived projects can be deleted');
    }

    const deletedProject = await this.projectRepository.softDelete(id);

    if (!deletedProject) {
      throw new NotFoundError('Project not found');
    }

    await this.cacheService.del(CacheKey.projectTasks(id));

    return this.toResponse(deletedProject);
  }

  async addMember(input: AddProjectMemberInput) {
    const project = await this.projectRepository.findById(input.projectId);

    if (!project) {
      throw new NotFoundError('Project not found');
    }

    const existingActiveMembership =
      await this.projectMemberRepository.findActiveMembership(
        input.projectId,
        input.userId,
      );

    if (existingActiveMembership) {
      throw new BusinessRuleError('User is already a member of this project');
    }

    const existingMembership =
      await this.projectMemberRepository.findAnyMembership(
        input.projectId,
        input.userId,
      );

    if (existingMembership) {
      const restoredMembership = await this.projectMemberRepository.restore(
        input.projectId,
        input.userId,
      );

      if (!restoredMembership) {
        throw new NotFoundError('Project member could not be restored');
      }

      await this.cacheService.del(CacheKey.projectTasks(input.projectId));

      this.eventEmitter.emit(
        ProjectMemberAddedEvent.eventName,
        new ProjectMemberAddedEvent({
          projectId: input.projectId,
          userId: input.userId,
          addedBy: input.addedBy,
          occurredAt: new Date().toISOString(),
        }),
      );

      return this.toProjectMemberResponse(restoredMembership);
    }

    const membership = await this.projectMemberRepository.create({
      projectId: input.projectId,
      userId: input.userId,
      addedBy: input.addedBy,
    });

    await this.cacheService.del(CacheKey.projectTasks(input.projectId));

    this.eventEmitter.emit(
      ProjectMemberAddedEvent.eventName,
      new ProjectMemberAddedEvent({
        projectId: input.projectId,
        userId: input.userId,
        addedBy: input.addedBy,
        occurredAt: new Date().toISOString(),
      }),
    );

    return this.toProjectMemberResponse(membership);
  }

  async removeMember(input: RemoveProjectMemberInput) {
    const project = await this.projectRepository.findById(input.projectId);

    if (!project) {
      throw new NotFoundError('Project not found');
    }

    const membership = await this.projectMemberRepository.findActiveMembership(
      input.projectId,
      input.userId,
    );

    if (!membership) {
      throw new NotFoundError('Project member not found');
    }

    const deletedMembership = await this.projectMemberRepository.softDelete(
      input.projectId,
      input.userId,
    );

    if (!deletedMembership) {
      throw new NotFoundError('Project member not found');
    }

    await this.taskAssigneeRepository.softDeleteByProjectIdAndUserId(
      input.projectId,
      input.userId,
    );

    await this.cacheService.del(CacheKey.projectTasks(input.projectId));

    this.eventEmitter.emit(
      ProjectMemberRemovedEvent.eventName,
      new ProjectMemberRemovedEvent({
        projectId: input.projectId,
        userId: input.userId,
        removedBy: input.removedBy,
        occurredAt: new Date().toISOString(),
      }),
    );

    return this.toProjectMemberResponse(deletedMembership);
  }

  async listMembers(projectId: string, actor: RequestUserContext) {
    const project = await this.projectRepository.findById(projectId);

    if (!project) {
      throw new NotFoundError('Project not found');
    }

    if (actor.role === 'EMPLOYEE') {
      const membership =
        await this.projectMemberRepository.findActiveMembership(
          projectId,
          actor.userId,
        );

      if (!membership) {
        throw new AuthorizationError(
          'You do not have permission to access this resource',
        );
      }
    }

    const members =
      await this.projectMemberRepository.findByProjectId(projectId);

    return members.map((member) => this.toProjectMemberResponse(member));
  }

  private toResponse(project: {
    id: string;
    name: string;
    description: string | null;
    createdBy: string;
    createdByUser: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      role: UserRole;
    } | null;
    isArchived: boolean;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
  }) {
    return {
      id: project.id,
      name: project.name,
      description: project.description,
      createdBy: project.createdBy,
      createdByUser: project.createdByUser,
      isArchived: project.isArchived,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      deletedAt: project.deletedAt,
    };
  }

  private toProjectMemberResponse(member: {
    id: string;
    projectId: string;
    userId: string;
    addedBy: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      role: UserRole;
    } | null;
  }) {
    return {
      id: member.id,
      projectId: member.projectId,
      userId: member.userId,
      addedBy: member.addedBy,
      createdAt: member.createdAt,
      updatedAt: member.updatedAt,
      deletedAt: member.deletedAt,
      user: member.user,
    };
  }
}
