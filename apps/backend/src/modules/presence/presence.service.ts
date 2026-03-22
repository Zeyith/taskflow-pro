import { Inject, Injectable, Logger } from '@nestjs/common';

import { AuthorizationError } from '../../common/exceptions/authorization.exception';
import { NotFoundError } from '../../common/exceptions/not-found.exception';
import type { AuthenticatedUser } from '../../common/types/authenticated-user.type';
import { CacheKey } from '../../core/cache/cache.constants';
import { CacheService } from '../../core/cache/cache.service';
import { RedisService } from '../../core/redis/redis.service';
import {
  PROJECT_MEMBER_REPOSITORY,
  type IProjectMemberRepository,
} from '../projects/repositories/interfaces/project-member.repository.interface';
import {
  PROJECT_REPOSITORY,
  type IProjectRepository,
} from '../projects/repositories/interfaces/project.repository.interface';
import {
  TASK_REPOSITORY,
  type ITaskRepository,
} from '../tasks/repositories/interfaces/task.repository.interface';
import {
  PRESENCE_FOCUSED_TASK_TTL_SECONDS,
  PRESENCE_ONLINE_TTL_SECONDS,
  PresenceRedisKey,
} from './presence.constants';
import type {
  PresenceFocusedTaskState,
  PresenceOnlineState,
  ProjectPresenceItem,
  ProjectPresenceSnapshot,
} from './types/presence.types';

const PROJECT_PRESENCE_CACHE_TTL_SECONDS = 15;

@Injectable()
export class PresenceService {
  private readonly logger = new Logger(PresenceService.name);

  constructor(
    private readonly redisService: RedisService,
    private readonly cacheService: CacheService,
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: IProjectRepository,
    @Inject(PROJECT_MEMBER_REPOSITORY)
    private readonly projectMemberRepository: IProjectMemberRepository,
    @Inject(TASK_REPOSITORY)
    private readonly taskRepository: ITaskRepository,
  ) {}

  async heartbeat(
    projectId: string,
    currentUser: AuthenticatedUser,
  ): Promise<{
    data: PresenceOnlineState;
    meta: {
      isCached: boolean;
    };
  }> {
    await this.ensureProjectAccess(projectId, currentUser);

    const onlineState: PresenceOnlineState = {
      userId: currentUser.sub,
      isOnline: true,
      lastSeenAt: new Date().toISOString(),
    };

    await this.redisService.set(
      PresenceRedisKey.userOnline(currentUser.sub),
      JSON.stringify(onlineState),
      PRESENCE_ONLINE_TTL_SECONDS,
    );

    await this.cacheService.del(CacheKey.projectPresence(projectId));

    this.logger.log(
      JSON.stringify({
        message: 'Presence heartbeat stored',
        userId: currentUser.sub,
        projectId,
        ttlSeconds: PRESENCE_ONLINE_TTL_SECONDS,
        timestamp: new Date().toISOString(),
      }),
    );

    return {
      data: onlineState,
      meta: {
        isCached: false,
      },
    };
  }

  async setFocusedTask(
    projectId: string,
    taskId: string | null,
    currentUser: AuthenticatedUser,
  ): Promise<{
    data: PresenceFocusedTaskState;
    meta: {
      isCached: boolean;
    };
  }> {
    await this.ensureProjectAccess(projectId, currentUser);

    if (taskId !== null) {
      await this.ensureTaskFocusAllowed(projectId, taskId, currentUser);
    }

    const focusedTaskState: PresenceFocusedTaskState = {
      taskId,
      projectId: taskId === null ? null : projectId,
      updatedAt: new Date().toISOString(),
    };

    const focusedTaskKey = PresenceRedisKey.userFocusedTask(currentUser.sub);

    if (taskId === null) {
      await this.redisService.del(focusedTaskKey);
      await this.cacheService.del(CacheKey.projectPresence(projectId));

      this.logger.log(
        JSON.stringify({
          message: 'Presence focused task cleared',
          userId: currentUser.sub,
          projectId,
          timestamp: new Date().toISOString(),
        }),
      );

      return {
        data: focusedTaskState,
        meta: {
          isCached: false,
        },
      };
    }

    await this.redisService.set(
      focusedTaskKey,
      JSON.stringify(focusedTaskState),
      PRESENCE_FOCUSED_TASK_TTL_SECONDS,
    );

    await this.cacheService.del(CacheKey.projectPresence(projectId));

    this.logger.log(
      JSON.stringify({
        message: 'Presence focused task stored',
        userId: currentUser.sub,
        projectId,
        taskId,
        ttlSeconds: PRESENCE_FOCUSED_TASK_TTL_SECONDS,
        timestamp: new Date().toISOString(),
      }),
    );

    return {
      data: focusedTaskState,
      meta: {
        isCached: false,
      },
    };
  }

  async markOffline(userId: string): Promise<void> {
    const focusedTaskState = await this.getFocusedTaskState(userId);

    await this.redisService.del(PresenceRedisKey.userOnline(userId));
    await this.redisService.del(PresenceRedisKey.userFocusedTask(userId));

    if (focusedTaskState?.projectId) {
      await this.cacheService.del(
        CacheKey.projectPresence(focusedTaskState.projectId),
      );
    }

    this.logger.log(
      JSON.stringify({
        message: 'Presence state cleared on disconnect',
        userId,
        timestamp: new Date().toISOString(),
      }),
    );
  }

  async getOnlineState(userId: string): Promise<PresenceOnlineState | null> {
    const raw = await this.redisService.get(
      PresenceRedisKey.userOnline(userId),
    );

    if (!raw) {
      return null;
    }

    return this.parseOnlineState(raw);
  }

  async getFocusedTaskState(
    userId: string,
  ): Promise<PresenceFocusedTaskState | null> {
    const raw = await this.redisService.get(
      PresenceRedisKey.userFocusedTask(userId),
    );

    if (!raw) {
      return null;
    }

    return this.parseFocusedTaskState(raw);
  }

  async getProjectPresence(
    projectId: string,
    currentUser: AuthenticatedUser,
  ): Promise<{
    data: ProjectPresenceSnapshot;
    meta: {
      isCached: boolean;
    };
  }> {
    await this.ensureProjectAccess(projectId, currentUser);

    const cacheKey = CacheKey.projectPresence(projectId);

    const cached =
      await this.cacheService.getJson<ProjectPresenceSnapshot>(cacheKey);

    if (cached) {
      return {
        data: cached,
        meta: {
          isCached: true,
        },
      };
    }

    const members =
      await this.projectMemberRepository.findByProjectId(projectId);

    const users: ProjectPresenceItem[] = await Promise.all(
      members.map(async (member) => {
        const onlineState = await this.getOnlineState(member.userId);
        const focusedTaskState = await this.getFocusedTaskState(member.userId);

        return {
          userId: member.userId,
          isOnline: onlineState?.isOnline ?? false,
          focusedTaskId:
            focusedTaskState?.projectId === projectId
              ? focusedTaskState.taskId
              : null,
          lastSeenAt: onlineState?.lastSeenAt ?? null,
        };
      }),
    );

    const data: ProjectPresenceSnapshot = {
      projectId,
      users,
    };

    await this.cacheService.setJson(
      cacheKey,
      data,
      PROJECT_PRESENCE_CACHE_TTL_SECONDS,
    );

    return {
      data,
      meta: {
        isCached: false,
      },
    };
  }

  private async ensureProjectAccess(
    projectId: string,
    currentUser: AuthenticatedUser,
  ): Promise<void> {
    const project = await this.projectRepository.findById(projectId);

    if (!project) {
      throw new NotFoundError('Project not found');
    }

    if (currentUser.role === 'TEAM_LEAD') {
      return;
    }

    const membership = await this.projectMemberRepository.findActiveMembership(
      projectId,
      currentUser.sub,
    );

    if (!membership) {
      throw new AuthorizationError(
        'You are not allowed to access this project presence',
      );
    }
  }

  private async ensureTaskFocusAllowed(
    projectId: string,
    taskId: string,
    currentUser: AuthenticatedUser,
  ): Promise<void> {
    const task = await this.taskRepository.findById(taskId);

    if (!task) {
      throw new NotFoundError('Task not found');
    }

    if (task.projectId !== projectId) {
      throw new AuthorizationError(
        'You cannot focus on a task outside the selected project',
      );
    }

    if (currentUser.role === 'TEAM_LEAD') {
      return;
    }

    const membership = await this.projectMemberRepository.findActiveMembership(
      projectId,
      currentUser.sub,
    );

    if (!membership) {
      throw new AuthorizationError('You are not allowed to focus on this task');
    }
  }

  private parseOnlineState(raw: string): PresenceOnlineState | null {
    try {
      const parsed = JSON.parse(raw) as {
        userId?: unknown;
        isOnline?: unknown;
        lastSeenAt?: unknown;
      };

      if (
        typeof parsed.userId !== 'string' ||
        typeof parsed.isOnline !== 'boolean' ||
        typeof parsed.lastSeenAt !== 'string'
      ) {
        return null;
      }

      return {
        userId: parsed.userId,
        isOnline: parsed.isOnline,
        lastSeenAt: parsed.lastSeenAt,
      };
    } catch {
      return null;
    }
  }

  private parseFocusedTaskState(raw: string): PresenceFocusedTaskState | null {
    try {
      const parsed = JSON.parse(raw) as {
        taskId?: unknown;
        projectId?: unknown;
        updatedAt?: unknown;
      };

      const taskId =
        parsed.taskId === null
          ? null
          : typeof parsed.taskId === 'string'
            ? parsed.taskId
            : undefined;

      const projectId =
        parsed.projectId === null
          ? null
          : typeof parsed.projectId === 'string'
            ? parsed.projectId
            : undefined;

      if (
        typeof parsed.updatedAt !== 'string' ||
        typeof taskId === 'undefined' ||
        typeof projectId === 'undefined'
      ) {
        return null;
      }

      return {
        taskId,
        projectId,
        updatedAt: parsed.updatedAt,
      };
    } catch {
      return null;
    }
  }
}
