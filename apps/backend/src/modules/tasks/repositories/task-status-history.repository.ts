import { Inject, Injectable } from '@nestjs/common';

import { DATABASE_CONNECTION } from '../../../core/database/database.module';
import type { AppDb } from '../../../core/database/database.types';
import {
  taskStatusHistory,
  type NewTaskStatusHistoryRow,
} from '../../../core/database/schema';
import type { ITaskStatusHistoryRepository } from './interfaces/task-status-history.repository.interface';

@Injectable()
export class TaskStatusHistoryRepository implements ITaskStatusHistoryRepository {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: AppDb,
  ) {}

  async create(history: NewTaskStatusHistoryRow): Promise<void> {
    await this.db.insert(taskStatusHistory).values(history);
  }
}
