export const taskStatuses = [
  'PENDING',
  'IN_PROGRESS',
  'AWAITING_APPROVAL',
  'WAITING_FOR_CHANGES',
  'COMPLETED',
] as const;

export type TaskStatus = (typeof taskStatuses)[number];

export type TaskAssignee = {
  userId: string;
  status: TaskStatus;
};

export type Task = {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
  assignees: TaskAssignee[];
};