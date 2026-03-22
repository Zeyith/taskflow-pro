import type { NewTaskAssigneeRow } from '../../../../core/database/schema';
import type { TaskAssignmentStatus } from '../../types/task-status.type';
import { TaskAssignee } from '../../entities/task-assignee.entity';

export const TASK_ASSIGNEE_REPOSITORY = Symbol('TASK_ASSIGNEE_REPOSITORY');

export type UpdateTaskAssigneePayload = {
  status?: TaskAssignmentStatus;
};

export interface ITaskAssigneeRepository {
  create(taskAssignee: NewTaskAssigneeRow): Promise<TaskAssignee>;
  findById(id: string): Promise<TaskAssignee | null>;
  findByTaskId(taskId: string): Promise<TaskAssignee[]>;
  findByTaskIdAndUserId(
    taskId: string,
    userId: string,
  ): Promise<TaskAssignee | null>;
  updateById(
    id: string,
    payload: UpdateTaskAssigneePayload,
  ): Promise<TaskAssignee | null>;
  softDeleteByTaskIdAndUserId(taskId: string, userId: string): Promise<void>;
}
