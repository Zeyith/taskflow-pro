import type { TaskAssignmentStatus } from '../types/task-status.type';

type TaskStatusBreakdown = Readonly<{
  pendingCount: number;
  inProgressCount: number;
  awaitingApprovalCount: number;
  waitingForChangesCount: number;
  completedCount: number;
}>;

type TaskSummaryStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

type TaskAssignmentStatusChangedEventProps = Readonly<{
  projectId: string;
  taskId: string;
  assigneeUserId: string;
  oldStatus: TaskAssignmentStatus;
  newStatus: TaskAssignmentStatus;
  changedBy: string;
  summaryStatus: TaskSummaryStatus;
  breakdown: TaskStatusBreakdown;
  occurredAt: string;
}>;

export class TaskAssignmentStatusChangedEvent {
  static readonly eventName = 'task.assignment.status.changed';

  constructor(readonly props: TaskAssignmentStatusChangedEventProps) {}
}
