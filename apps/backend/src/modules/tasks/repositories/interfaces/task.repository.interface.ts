import type { NewTaskRow } from '../../../../core/database/schema';
import { Task } from '../../entities/task.entity';
import type { TaskSummaryStatus } from '../../types/task-status.type';

export const TASK_REPOSITORY = Symbol('TASK_REPOSITORY');

export type UpdateTaskPayload = {
  title?: string;
  description?: string | null;
  summaryStatus?: TaskSummaryStatus;
};

export interface ITaskRepository {
  create(task: NewTaskRow): Promise<Task>;
  findById(id: string): Promise<Task | null>;
  findByProjectId(projectId: string): Promise<Task[]>;
  updateById(id: string, payload: UpdateTaskPayload): Promise<Task | null>;
  softDeleteById(id: string): Promise<boolean>;
}
