export type TaskAssigneeAddedEventProps = Readonly<{
  projectId: string;
  taskId: string;
  userId: string;
  addedBy: string;
  occurredAt: string;
}>;

export class TaskAssigneeAddedEvent {
  static readonly eventName = 'task.assignee.added';

  constructor(readonly props: TaskAssigneeAddedEventProps) {}
}
