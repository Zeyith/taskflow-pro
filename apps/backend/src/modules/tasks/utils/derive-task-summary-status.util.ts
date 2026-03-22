import type {
  TaskAssignmentStatus,
  TaskSummaryStatus,
} from '../types/task-status.type';

export function deriveTaskSummaryStatus(
  statuses: TaskAssignmentStatus[],
): TaskSummaryStatus {
  if (statuses.length === 0) {
    return 'PENDING';
  }

  const allPending = statuses.every((status) => status === 'PENDING');

  if (allPending) {
    return 'PENDING';
  }

  const allCompleted = statuses.every((status) => status === 'COMPLETED');

  if (allCompleted) {
    return 'COMPLETED';
  }

  return 'IN_PROGRESS';
}
