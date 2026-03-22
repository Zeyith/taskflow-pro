import type { NewTaskAssigneeRow } from '../../../../core/database/schema';
import { TaskAssignee } from '../../entities/task-assignee.entity';
import type { TaskAssignmentStatus } from '../../types/task-status.type';

export const TASK_ASSIGNEE_REPOSITORY = Symbol('TASK_ASSIGNEE_REPOSITORY');

export type UpdateTaskAssigneePayload = {
  status?: TaskAssignmentStatus;
};

export type RestoreTaskAssigneePayload = {
  addedBy: string;
  status: TaskAssignmentStatus;
};

export interface ITaskAssigneeRepository {
  create(taskAssignee: NewTaskAssigneeRow): Promise<TaskAssignee>;
  findById(id: string): Promise<TaskAssignee | null>;
  findByTaskId(taskId: string): Promise<TaskAssignee[]>;
  findByTaskIdAndUserId(
    taskId: string,
    userId: string,
  ): Promise<TaskAssignee | null>;
  findAnyByTaskIdAndUserId(
    taskId: string,
    userId: string,
  ): Promise<TaskAssignee | null>;
  restoreByTaskIdAndUserId(
    taskId: string,
    userId: string,
    payload: RestoreTaskAssigneePayload,
  ): Promise<TaskAssignee | null>;
  updateById(
    id: string,
    payload: UpdateTaskAssigneePayload,
  ): Promise<TaskAssignee | null>;
  softDeleteByTaskIdAndUserId(taskId: string, userId: string): Promise<void>;
  softDeleteByProjectIdAndUserId(
    projectId: string,
    userId: string,
  ): Promise<void>;
}