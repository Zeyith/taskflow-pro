import { Inject, Injectable } from '@nestjs/common';
import { and, eq, isNull } from 'drizzle-orm';

import { DATABASE_CONNECTION } from '../../../core/database/database.module';
import type { AppDb } from '../../../core/database/database.types';
import {
  tasks,
  type NewTaskRow,
  type TaskRow,
} from '../../../core/database/schema';
import { Task } from '../entities/task.entity';
import type {
  ITaskRepository,
  UpdateTaskPayload,
} from './interfaces/task.repository.interface';

@Injectable()
export class TaskRepository implements ITaskRepository {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: AppDb,
  ) {}

  async create(task: NewTaskRow): Promise<Task> {
    const [createdRow] = await this.db.insert(tasks).values(task).returning();

    if (!createdRow) {
      throw new Error('Task creation failed');
    }

    return this.toDomain(createdRow);
  }

  async findById(id: string): Promise<Task | null> {
    const [row] = await this.db
      .select()
      .from(tasks)
      .where(and(eq(tasks.id, id), isNull(tasks.deletedAt)))
      .limit(1);

    if (!row) {
      return null;
    }

    return this.toDomain(row);
  }

  async findByProjectId(projectId: string): Promise<Task[]> {
    const rows = await this.db
      .select()
      .from(tasks)
      .where(and(eq(tasks.projectId, projectId), isNull(tasks.deletedAt)));

    return rows.map((row) => this.toDomain(row));
  }

  async updateById(
    id: string,
    payload: UpdateTaskPayload,
  ): Promise<Task | null> {
    const hasNoFields = Object.keys(payload).length === 0;

    if (hasNoFields) {
      return this.findById(id);
    }

    const [updatedRow] = await this.db
      .update(tasks)
      .set({
        title: payload.title,
        description: payload.description,
        summaryStatus: payload.summaryStatus,
        updatedAt: new Date(),
      })
      .where(and(eq(tasks.id, id), isNull(tasks.deletedAt)))
      .returning();

    if (!updatedRow) {
      return null;
    }

    return this.toDomain(updatedRow);
  }

  async softDeleteById(id: string): Promise<boolean> {
    const [deletedRow] = await this.db
      .update(tasks)
      .set({
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(and(eq(tasks.id, id), isNull(tasks.deletedAt)))
      .returning({ id: tasks.id });

    return deletedRow !== undefined;
  }

  private toDomain(row: TaskRow): Task {
    return new Task({
      id: row.id,
      projectId: row.projectId,
      title: row.title,
      description: row.description ?? null,
      createdBy: row.createdBy,
      summaryStatus: row.summaryStatus,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      deletedAt: row.deletedAt ?? null,
    });
  }
}
