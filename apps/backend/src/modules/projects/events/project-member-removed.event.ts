export type ProjectMemberRemovedEventProps = Readonly<{
  projectId: string;
  userId: string;
  removedBy: string;
  occurredAt: string;
}>;

export class ProjectMemberRemovedEvent {
  static readonly eventName = 'project.member.removed';

  constructor(readonly props: ProjectMemberRemovedEventProps) {}
}
