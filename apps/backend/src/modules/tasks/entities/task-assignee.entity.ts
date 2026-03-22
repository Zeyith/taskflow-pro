import type { TaskAssignmentStatus } from '../types/task-status.type';

export type CreateTaskAssigneeProps = {
  id: string;
  taskId: string;
  userId: string;
  addedBy: string;
  status: TaskAssignmentStatus;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

export class TaskAssignee {
  readonly id: string;
  readonly taskId: string;
  readonly userId: string;
  readonly addedBy: string;
  readonly status: TaskAssignmentStatus;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly deletedAt: Date | null;

  constructor(props: CreateTaskAssigneeProps) {
    this.id = props.id;
    this.taskId = props.taskId;
    this.userId = props.userId;
    this.addedBy = props.addedBy;
    this.status = props.status;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
    this.deletedAt = props.deletedAt;
  }

  isDeleted(): boolean {
    return this.deletedAt !== null;
  }

  isCompleted(): boolean {
    return this.status === 'COMPLETED';
  }

  isPending(): boolean {
    return this.status === 'PENDING';
  }

  isActive(): boolean {
    return (
      this.status === 'IN_PROGRESS' ||
      this.status === 'AWAITING_APPROVAL' ||
      this.status === 'WAITING_FOR_CHANGES'
    );
  }
}
