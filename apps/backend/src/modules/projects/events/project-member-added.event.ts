export type ProjectMemberAddedEventProps = Readonly<{
  projectId: string;
  userId: string;
  addedBy: string;
  occurredAt: string;
}>;

export class ProjectMemberAddedEvent {
  static readonly eventName = 'project.member.added';

  constructor(readonly props: ProjectMemberAddedEventProps) {}
}
