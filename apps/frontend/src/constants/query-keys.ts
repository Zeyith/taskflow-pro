export const queryKeys = {
  auth: {
    me: ['auth', 'me'] as const,
  },
  projects: {
    all: ['projects'] as const,
    detail: (projectId: string) => ['projects', projectId] as const,
    members: (projectId: string) => ['projects', projectId, 'members'] as const,
    tasks: (projectId: string) => ['projects', projectId, 'tasks'] as const,
    presence: (projectId: string) =>
      ['projects', projectId, 'presence'] as const,
    incidents: (projectId: string) =>
      ['projects', projectId, 'incidents'] as const,
  },
  incidents: {
    all: ['incidents'] as const,
  },
  tasks: {
    detail: (taskId: string) => ['tasks', taskId] as const,
  },
  notifications: {
    all: ['notifications'] as const,
    unreadCount: ['notifications', 'unread-count'] as const,
  },
} as const;