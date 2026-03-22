import type { TaskStatus } from '@/types/task';

export function getTaskStatusLabel(status: TaskStatus | string): string {
  switch (status) {
    case 'PENDING':
      return 'Pending';
    case 'IN_PROGRESS':
      return 'In Progress';
    case 'AWAITING_APPROVAL':
      return 'Awaiting Approval';
    case 'COMPLETED':
      return 'Completed';
    default:
      return status;
  }
}

export function getTaskStatusClassName(status: TaskStatus | string): string {
  switch (status) {
    case 'PENDING':
      return 'border-border/60 bg-muted/50 text-foreground';
    case 'IN_PROGRESS':
      return 'border-blue-500/20 bg-blue-500/10 text-blue-700 dark:text-blue-300';
    case 'AWAITING_APPROVAL':
      return 'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300';
    case 'COMPLETED':
      return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300';
    default:
      return 'border-border/60 bg-muted/50 text-foreground';
  }
}