import { Inject, Injectable } from '@nestjs/common';
import { and, eq, isNull } from 'drizzle-orm';

import { DATABASE_CONNECTION } from '../../../core/database/database.module';
import type { AppDb } from '../../../core/database/database.types';
import {
  taskAssignees,
  tasks,
  type NewTaskAssigneeRow,
  type TaskAssigneeRow,
} from '../../../core/database/schema';
import { TaskAssignee } from '../entities/task-assignee.entity';
import type {
  ITaskAssigneeRepository,
  RestoreTaskAssigneePayload,
  UpdateTaskAssigneePayload,
} from './interfaces/task-assignee.repository.interface';

@Injectable()
export class TaskAssigneeRepository implements ITaskAssigneeRepository {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: AppDb,
  ) {}

  async create(taskAssignee: NewTaskAssigneeRow): Promise<TaskAssignee> {
    const [createdRow] = await this.db
      .insert(taskAssignees)
      .values(taskAssignee)
      .returning();

    if (!createdRow) {
      throw new Error('Task assignee creation failed');
    }

    return this.toDomain(createdRow);
  }

  async findById(id: string): Promise<TaskAssignee | null> {
    const [row] = await this.db
      .select()
      .from(taskAssignees)
      .where(and(eq(taskAssignees.id, id), isNull(taskAssignees.deletedAt)))
      .limit(1);

    if (!row) {
      return null;
    }

    return this.toDomain(row);
  }

  async findByTaskId(taskId: string): Promise<TaskAssignee[]> {
    const rows = await this.db
      .select()
      .from(taskAssignees)
      .where(
        and(eq(taskAssignees.taskId, taskId), isNull(taskAssignees.deletedAt)),
      );

    return rows.map((row) => this.toDomain(row));
  }

  async findByTaskIdAndUserId(
    taskId: string,
    userId: string,
  ): Promise<TaskAssignee | null> {
    const [row] = await this.db
      .select()
      .from(taskAssignees)
      .where(
        and(
          eq(taskAssignees.taskId, taskId),
          eq(taskAssignees.userId, userId),
          isNull(taskAssignees.deletedAt),
        ),
      )
      .limit(1);

    if (!row) {
      return null;
    }

    return this.toDomain(row);
  }

  async findAnyByTaskIdAndUserId(
    taskId: string,
    userId: string,
  ): Promise<TaskAssignee | null> {
    const [row] = await this.db
      .select()
      .from(taskAssignees)
      .where(
        and(eq(taskAssignees.taskId, taskId), eq(taskAssignees.userId, userId)),
      )
      .limit(1);

    if (!row) {
      return null;
    }

    return this.toDomain(row);
  }

  async restoreByTaskIdAndUserId(
    taskId: string,
    userId: string,
    payload: RestoreTaskAssigneePayload,
  ): Promise<TaskAssignee | null> {
    const [restoredRow] = await this.db
      .update(taskAssignees)
      .set({
        addedBy: payload.addedBy,
        status: payload.status,
        deletedAt: null,
        updatedAt: new Date(),
      })
      .where(
        and(eq(taskAssignees.taskId, taskId), eq(taskAssignees.userId, userId)),
      )
      .returning();

    if (!restoredRow) {
      return null;
    }

    return this.toDomain(restoredRow);
  }

  async updateById(
    id: string,
    payload: UpdateTaskAssigneePayload,
  ): Promise<TaskAssignee | null> {
    const hasNoFields = Object.keys(payload).length === 0;

    if (hasNoFields) {
      return this.findById(id);
    }

    const [updatedRow] = await this.db
      .update(taskAssignees)
      .set({
        status: payload.status,
        updatedAt: new Date(),
      })
      .where(and(eq(taskAssignees.id, id), isNull(taskAssignees.deletedAt)))
      .returning();

    if (!updatedRow) {
      return null;
    }

    return this.toDomain(updatedRow);
  }

  async softDeleteByTaskIdAndUserId(
    taskId: string,
    userId: string,
  ): Promise<void> {
    await this.db
      .update(taskAssignees)
      .set({
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(taskAssignees.taskId, taskId),
          eq(taskAssignees.userId, userId),
          isNull(taskAssignees.deletedAt),
        ),
      );
  }

  async softDeleteByProjectIdAndUserId(
    projectId: string,
    userId: string,
  ): Promise<void> {
    const projectTasks = await this.db
      .select({
        id: tasks.id,
      })
      .from(tasks)
      .where(and(eq(tasks.projectId, projectId), isNull(tasks.deletedAt)));

    if (projectTasks.length === 0) {
      return;
    }

    const taskIds = projectTasks.map((task) => task.id);

    for (const taskId of taskIds) {
      await this.db
        .update(taskAssignees)
        .set({
          deletedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(taskAssignees.taskId, taskId),
            eq(taskAssignees.userId, userId),
            isNull(taskAssignees.deletedAt),
          ),
        );
    }
  }

  private toDomain(row: TaskAssigneeRow): TaskAssignee {
    return new TaskAssignee({
      id: row.id,
      taskId: row.taskId,
      userId: row.userId,
      addedBy: row.addedBy,
      status: row.status,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      deletedAt: row.deletedAt ?? null,
    });
  }
}
