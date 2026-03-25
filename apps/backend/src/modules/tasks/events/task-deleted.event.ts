export type TaskDeletedEventProps = Readonly<{
  projectId: string;
  taskId: string;
  deletedBy: string;
  occurredAt: string;
}>;

export class TaskDeletedEvent {
  static readonly eventName = 'task.deleted';

  constructor(readonly props: TaskDeletedEventProps) {}
}
