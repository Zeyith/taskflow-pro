import type { TaskSummaryStatus } from '../types/task-status.type';

export type CreateTaskProps = {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  createdBy: string;
  summaryStatus: TaskSummaryStatus;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

export class Task {
  readonly id: string;
  readonly projectId: string;
  readonly title: string;
  readonly description: string | null;
  readonly createdBy: string;
  readonly summaryStatus: TaskSummaryStatus;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly deletedAt: Date | null;

  constructor(props: CreateTaskProps) {
    this.id = props.id;
    this.projectId = props.projectId;
    this.title = props.title;
    this.description = props.description;
    this.createdBy = props.createdBy;
    this.summaryStatus = props.summaryStatus;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
    this.deletedAt = props.deletedAt;
  }

  isDeleted(): boolean {
    return this.deletedAt !== null;
  }

  isCompleted(): boolean {
    return this.summaryStatus === 'COMPLETED';
  }

  isPending(): boolean {
    return this.summaryStatus === 'PENDING';
  }
}
