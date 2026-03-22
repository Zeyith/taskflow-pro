import type { TaskAssignmentStatus } from '../types/task-status.type';

export type TaskStatusBreakdown = {
  pendingCount: number;
  inProgressCount: number;
  awaitingApprovalCount: number;
  waitingForChangesCount: number;
  completedCount: number;
};

export function buildTaskStatusBreakdown(
  statuses: TaskAssignmentStatus[],
): TaskStatusBreakdown {
  return statuses.reduce<TaskStatusBreakdown>(
    (acc, status) => {
      if (status === 'PENDING') {
        acc.pendingCount += 1;
      } else if (status === 'IN_PROGRESS') {
        acc.inProgressCount += 1;
      } else if (status === 'AWAITING_APPROVAL') {
        acc.awaitingApprovalCount += 1;
      } else if (status === 'WAITING_FOR_CHANGES') {
        acc.waitingForChangesCount += 1;
      } else if (status === 'COMPLETED') {
        acc.completedCount += 1;
      }

      return acc;
    },
    {
      pendingCount: 0,
      inProgressCount: 0,
      awaitingApprovalCount: 0,
      waitingForChangesCount: 0,
      completedCount: 0,
    },
  );
}
