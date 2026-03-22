import type { TaskAssignee } from '../entities/task-assignee.entity';
import type { Task } from '../entities/task.entity';
import type { TaskDetail } from '../tasks.service';

export type TaskAssigneeResponseDto = {
  id: string;
  taskId: string;
  userId: string;
  addedBy: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
};

export type TaskResponseDto = {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  createdBy: string;
  summaryStatus: string;
  createdAt: Date;
  updatedAt: Date;
};

export type TaskListItemResponseDto = {
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
};

export type TaskDetailResponseDto = {
  task: TaskResponseDto;
  assignees: TaskAssigneeResponseDto[];
  breakdown: TaskDetail['breakdown'];
};

export function toTaskResponse(task: Task): TaskResponseDto {
  return {
    id: task.id,
    projectId: task.projectId,
    title: task.title,
    description: task.description,
    createdBy: task.createdBy,
    summaryStatus: task.summaryStatus,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
  };
}

export function toTaskListItemResponse(task: {
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
}): TaskListItemResponseDto {
  return {
    id: task.id,
    projectId: task.projectId,
    title: task.title,
    description: task.description,
    status: task.status,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
    assignees: task.assignees.map((assignee) => ({
      userId: assignee.userId,
      status: assignee.status,
    })),
  };
}

export function toTaskDetailResponse(
  detail: TaskDetail,
): TaskDetailResponseDto {
  return {
    task: toTaskResponse(detail.task),
    assignees: detail.assignees.map(
      (assignee: TaskAssignee): TaskAssigneeResponseDto => ({
        id: assignee.id,
        taskId: assignee.taskId,
        userId: assignee.userId,
        addedBy: assignee.addedBy,
        status: assignee.status,
        createdAt: assignee.createdAt,
        updatedAt: assignee.updatedAt,
      }),
    ),
    breakdown: detail.breakdown,
  };
}