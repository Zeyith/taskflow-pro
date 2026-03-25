export type TaskCreatedEventProps = Readonly<{
  projectId: string;
  taskId: string;
  createdBy: string;
  occurredAt: string;
}>;

export class TaskCreatedEvent {
  static readonly eventName = 'task.created';

  constructor(readonly props: TaskCreatedEventProps) {}
}
