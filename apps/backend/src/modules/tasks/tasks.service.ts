import { Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { AuthorizationError } from '../../common/exceptions/authorization.exception';
import { BusinessRuleError } from '../../common/exceptions/business-rule.exception';
import { NotFoundError } from '../../common/exceptions/not-found.exception';
import type { AuthenticatedUser } from '../../common/types/authenticated-user.type';
import type { UserRole } from '../../common/types/user-role.type';
import {
  CacheKey,
  DEFAULT_CACHE_TTL_SECONDS,
} from '../../core/cache/cache.constants';
import { CacheService } from '../../core/cache/cache.service';
import {
  PROJECT_MEMBER_REPOSITORY,
  type IProjectMemberRepository,
} from '../projects/repositories/interfaces/project-member.repository.interface';
import {
  PROJECT_REPOSITORY,
  type IProjectRepository,
} from '../projects/repositories/interfaces/project.repository.interface';
import { Task } from './entities/task.entity';
import { TaskAssignee } from './entities/task-assignee.entity';
import { TaskAssignmentStatusChangedEvent } from './events/task-assignment-status-changed.event';
import {
  TASK_ASSIGNEE_REPOSITORY,
  type ITaskAssigneeRepository,
} from './repositories/interfaces/task-assignee.repository.interface';
import {
  TASK_REPOSITORY,
  type ITaskRepository,
} from './repositories/interfaces/task.repository.interface';
import {
  TASK_STATUS_HISTORY_REPOSITORY,
  type ITaskStatusHistoryRepository,
} from './repositories/interfaces/task-status-history.repository.interface';
import type { TaskAssignmentStatus } from './types/task-status.type';
import {
  buildTaskStatusBreakdown,
  type TaskStatusBreakdown,
} from './utils/build-task-status-breakdown.util';
import { deriveTaskSummaryStatus } from './utils/derive-task-summary-status.util';

export type CreateTaskInput = {
  projectId: string;
  title: string;
  description?: string | null;
  assigneeIds: string[];
};

export type TaskDetail = {
  task: Task;
  assignees: TaskAssignee[];
  breakdown: TaskStatusBreakdown;
};

@Injectable()
export class TasksService {
  constructor(
    @Inject(TASK_REPOSITORY)
    private readonly taskRepository: ITaskRepository,
    @Inject(TASK_ASSIGNEE_REPOSITORY)
    private readonly taskAssigneeRepository: ITaskAssigneeRepository,
    @Inject(TASK_STATUS_HISTORY_REPOSITORY)
    private readonly taskStatusHistoryRepository: ITaskStatusHistoryRepository,
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: IProjectRepository,
    @Inject(PROJECT_MEMBER_REPOSITORY)
    private readonly projectMemberRepository: IProjectMemberRepository,
    private readonly eventEmitter: EventEmitter2,
    private readonly cacheService: CacheService,
  ) {}

  async createTask(
    actor: AuthenticatedUser,
    input: CreateTaskInput,
  ): Promise<TaskDetail> {
    this.ensureTeamLead(actor.role);

    const project = await this.projectRepository.findById(input.projectId);

    if (!project) {
      throw new NotFoundError('Project not found');
    }

    if (project.isArchived) {
      throw new BusinessRuleError('Cannot create task for archived project');
    }

    const uniqueAssigneeIds = [...new Set(input.assigneeIds)];

    for (const assigneeId of uniqueAssigneeIds) {
      const membership =
        await this.projectMemberRepository.findActiveMembership(
          input.projectId,
          assigneeId,
        );

      if (!membership) {
        throw new BusinessRuleError('All assignees must be project members');
      }
    }

    const task = await this.taskRepository.create({
      projectId: input.projectId,
      title: input.title,
      description: input.description ?? null,
      createdBy: actor.sub,
      summaryStatus: 'PENDING',
    });

    const assignees: TaskAssignee[] = [];

    for (const assigneeId of uniqueAssigneeIds) {
      const assignee = await this.taskAssigneeRepository.create({
        taskId: task.id,
        userId: assigneeId,
        addedBy: actor.sub,
        status: 'PENDING',
      });

      assignees.push(assignee);
    }

    const statuses = assignees.map((item) => item.status);
    const summaryStatus = deriveTaskSummaryStatus(statuses);

    const updatedTask =
      summaryStatus === 'PENDING'
        ? task
        : await this.recalculateAndPersistSummaryStatus(task.id);

    await this.cacheService.del(CacheKey.projectTasks(input.projectId));

    return {
      task: updatedTask,
      assignees,
      breakdown: buildTaskStatusBreakdown(statuses),
    };
  }

  async listProjectTasks(
    actor: AuthenticatedUser,
    projectId: string,
  ): Promise<{
    data: Array<{
      id: string;
      projectId: string;
      title: string;
      description: string | null;
      status: string;
      createdAt: Date;
      updatedAt: Date;
      assignees: Array<{
        userId: string;
        status: string;
      }>;
    }>;
    meta: {
      isCached: boolean;
    };
  }> {
    await this.ensureProjectReadable(projectId, actor);

    const cacheKey = CacheKey.projectTasks(projectId);

    const cached = await this.cacheService.getJson<
      Array<{
        id: string;
        projectId: string;
        title: string;
        description: string | null;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        assignees: Array<{
          userId: string;
          status: string;
        }>;
      }>
    >(cacheKey);

    if (cached) {
      return {
        data: cached,
        meta: {
          isCached: true,
        },
      };
    }

    const tasks = await this.taskRepository.findByProjectId(projectId);

    const taskDetails = await Promise.all(
      tasks.map(async (task) => {
        const assignees = await this.taskAssigneeRepository.findByTaskId(
          task.id,
        );

        return {
          id: task.id,
          projectId: task.projectId,
          title: task.title,
          description: task.description,
          status: task.summaryStatus,
          createdAt: task.createdAt,
          updatedAt: task.updatedAt,
          assignees: assignees.map((assignee) => ({
            userId: assignee.userId,
            status: assignee.status,
          })),
        };
      }),
    );

    await this.cacheService.setJson(
      cacheKey,
      taskDetails,
      DEFAULT_CACHE_TTL_SECONDS,
    );

    return {
      data: taskDetails,
      meta: {
        isCached: false,
      },
    };
  }

  async getTaskDetail(
    actor: AuthenticatedUser,
    taskId: string,
  ): Promise<TaskDetail> {
    const task = await this.taskRepository.findById(taskId);

    if (!task) {
      throw new NotFoundError('Task not found');
    }

    await this.ensureProjectReadable(task.projectId, actor);

    const assignees = await this.taskAssigneeRepository.findByTaskId(task.id);
    const statuses = assignees.map((item) => item.status);

    return {
      task,
      assignees,
      breakdown: buildTaskStatusBreakdown(statuses),
    };
  }

  async addAssignee(
    actor: AuthenticatedUser,
    taskId: string,
    userId: string,
  ): Promise<TaskDetail> {
    this.ensureTeamLead(actor.role);

    const task = await this.taskRepository.findById(taskId);

    if (!task) {
      throw new NotFoundError('Task not found');
    }

    const membership = await this.projectMemberRepository.findActiveMembership(
      task.projectId,
      userId,
    );

    if (!membership) {
      throw new BusinessRuleError('User must be a project member');
    }

    const existingAssignee =
      await this.taskAssigneeRepository.findByTaskIdAndUserId(taskId, userId);

    if (existingAssignee) {
      throw new BusinessRuleError('User is already assigned to this task');
    }

    await this.taskAssigneeRepository.create({
      taskId,
      userId,
      addedBy: actor.sub,
      status: 'PENDING',
    });

    await this.cacheService.del(CacheKey.projectTasks(task.projectId));

    return this.getTaskDetail(actor, taskId);
  }

  async removeAssignee(
    actor: AuthenticatedUser,
    taskId: string,
    userId: string,
  ): Promise<TaskDetail> {
    this.ensureTeamLead(actor.role);

    const task = await this.taskRepository.findById(taskId);

    if (!task) {
      throw new NotFoundError('Task not found');
    }

    const existingAssignee =
      await this.taskAssigneeRepository.findByTaskIdAndUserId(taskId, userId);

    if (!existingAssignee) {
      throw new NotFoundError('Task assignee not found');
    }

    await this.taskAssigneeRepository.softDeleteByTaskIdAndUserId(
      taskId,
      userId,
    );
    await this.recalculateAndPersistSummaryStatus(taskId);
    await this.cacheService.del(CacheKey.projectTasks(task.projectId));

    return this.getTaskDetail(actor, taskId);
  }

  async updateAssignmentStatus(
    actor: AuthenticatedUser,
    taskId: string,
    assigneeUserId: string,
    nextStatus: TaskAssignmentStatus,
  ): Promise<TaskDetail> {
    const task = await this.taskRepository.findById(taskId);

    if (!task) {
      throw new NotFoundError('Task not found');
    }

    const assignment = await this.taskAssigneeRepository.findByTaskIdAndUserId(
      taskId,
      assigneeUserId,
    );

    if (!assignment) {
      throw new NotFoundError('Task assignee not found');
    }

    this.ensureAssignmentStatusUpdatable(actor, assigneeUserId);

    const updatedAssignment = await this.taskAssigneeRepository.updateById(
      assignment.id,
      { status: nextStatus },
    );

    if (!updatedAssignment) {
      throw new NotFoundError('Task assignee not found');
    }

    await this.taskStatusHistoryRepository.create({
      taskId,
      taskAssigneeId: assignment.id,
      oldStatus: assignment.status,
      newStatus: nextStatus,
      changedBy: actor.sub,
    });

    await this.recalculateAndPersistSummaryStatus(taskId);
    await this.cacheService.del(CacheKey.projectTasks(task.projectId));

    const taskDetail = await this.getTaskDetail(actor, taskId);

    this.eventEmitter.emit(
      TaskAssignmentStatusChangedEvent.eventName,
      new TaskAssignmentStatusChangedEvent({
        projectId: task.projectId,
        taskId,
        assigneeUserId,
        oldStatus: assignment.status,
        newStatus: nextStatus,
        changedBy: actor.sub,
        summaryStatus: taskDetail.task.summaryStatus,
        breakdown: taskDetail.breakdown,
        occurredAt: new Date().toISOString(),
      }),
    );

    return taskDetail;
  }

  private async recalculateAndPersistSummaryStatus(
    taskId: string,
  ): Promise<Task> {
    const task = await this.taskRepository.findById(taskId);

    if (!task) {
      throw new NotFoundError('Task not found');
    }

    const assignees = await this.taskAssigneeRepository.findByTaskId(taskId);
    const statuses = assignees.map((item) => item.status);
    const nextSummaryStatus = deriveTaskSummaryStatus(statuses);

    if (task.summaryStatus === nextSummaryStatus) {
      return task;
    }

    const updatedTask = await this.taskRepository.updateById(taskId, {
      summaryStatus: nextSummaryStatus,
    });

    if (!updatedTask) {
      throw new NotFoundError('Task not found');
    }

    return updatedTask;
  }

  private ensureTeamLead(role: UserRole): void {
    if (role !== 'TEAM_LEAD') {
      throw new AuthorizationError('Only team leads can perform this action');
    }
  }

  private async ensureProjectReadable(
    projectId: string,
    actor: AuthenticatedUser,
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
        'You are not allowed to access this project',
      );
    }
  }

  private ensureAssignmentStatusUpdatable(
    actor: AuthenticatedUser,
    assignmentUserId: string,
  ): void {
    const isTeamLead = actor.role === 'TEAM_LEAD';
    const isSelfAssignment = actor.sub === assignmentUserId;

    if (!isTeamLead && !isSelfAssignment) {
      throw new AuthorizationError(
        'You are not allowed to update this task status',
      );
    }
  }
}
