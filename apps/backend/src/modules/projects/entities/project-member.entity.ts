export type ProjectMemberUserInfo = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'TEAM_LEAD' | 'EMPLOYEE';
};

export type CreateProjectMemberProps = {
  id: string;
  projectId: string;
  userId: string;
  addedBy: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  user: ProjectMemberUserInfo | null;
};

export class ProjectMember {
  readonly id: string;
  readonly projectId: string;
  readonly userId: string;
  readonly addedBy: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly deletedAt: Date | null;
  readonly user: ProjectMemberUserInfo | null;

  constructor(props: CreateProjectMemberProps) {
    this.id = props.id;
    this.projectId = props.projectId;
    this.userId = props.userId;
    this.addedBy = props.addedBy;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
    this.deletedAt = props.deletedAt;
    this.user = props.user;
  }

  isDeleted(): boolean {
    return this.deletedAt !== null;
  }
}