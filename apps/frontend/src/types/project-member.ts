export type ProjectMemberUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'TEAM_LEAD' | 'EMPLOYEE';
};

export type ProjectMember = {
  id: string;
  projectId: string;
  userId: string;
  addedBy: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  user: ProjectMemberUser | null;
};

export type ProjectMembersResponse = {
  data: ProjectMember[];
  meta?: {
    isCached?: boolean;
  };
};