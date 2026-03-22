export type PresenceStatus = 'ONLINE' | 'OFFLINE';

export type ProjectPresenceItem = {
  userId: string;
  fullName: string;
  email: string;
  role: 'TEAM_LEAD' | 'EMPLOYEE';
  status: PresenceStatus;
  focusedTaskId: string | null;
  focusedTaskTitle: string | null;
  lastSeenAt: string | null;
};

export type ProjectPresenceResponse = {
  data: ProjectPresenceItem[];
  meta?: {
    isCached?: boolean;
  };
};