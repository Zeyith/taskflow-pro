import { Inject, Injectable } from '@nestjs/common';
import { and, eq, isNull } from 'drizzle-orm';

import { DATABASE_CONNECTION } from '../../../core/database/database.module';
import type { AppDb } from '../../../core/database/database.types';
import {
  taskAssignees,
  type NewTaskAssigneeRow,
  type TaskAssigneeRow,
} from '../../../core/database/schema';
import { TaskAssignee } from '../entities/task-assignee.entity';
import type {
  ITaskAssigneeRepository,
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
