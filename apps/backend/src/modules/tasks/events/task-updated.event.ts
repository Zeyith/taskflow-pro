export type TaskUpdatedEventProps = Readonly<{
  projectId: string;
  taskId: string;
  updatedBy: string;
  occurredAt: string;
}>;

export class TaskUpdatedEvent {
  static readonly eventName = 'task.updated';

  constructor(readonly props: TaskUpdatedEventProps) {}
}
