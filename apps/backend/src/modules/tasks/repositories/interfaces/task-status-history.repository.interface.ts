import type { NewTaskStatusHistoryRow } from '../../../../core/database/schema';

export const TASK_STATUS_HISTORY_REPOSITORY = Symbol(
  'TASK_STATUS_HISTORY_REPOSITORY',
);

export interface ITaskStatusHistoryRepository {
  create(history: NewTaskStatusHistoryRow): Promise<void>;
}
