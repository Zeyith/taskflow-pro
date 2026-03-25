export type TaskAssigneeRemovedEventProps = Readonly<{
  projectId: string;
  taskId: string;
  userId: string;
  removedBy: string;
  occurredAt: string;
}>;

export class TaskAssigneeRemovedEvent {
  static readonly eventName = 'task.assignee.removed';

  constructor(readonly props: TaskAssigneeRemovedEventProps) {}
}
