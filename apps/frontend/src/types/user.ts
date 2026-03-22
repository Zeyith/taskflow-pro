export type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  jobTitleId: string | null;
  role: 'TEAM_LEAD' | 'EMPLOYEE';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};