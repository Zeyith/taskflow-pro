export const apiEndpoints = {
  auth: {
    login: '/auth/login',
    me: '/auth/me',
    register: '/auth/register',
  },

  projects: {
    list: '/projects',
    create: '/projects',
    detail: (projectId: string) => `/projects/${projectId}`,
    archive: (projectId: string) => `/projects/${projectId}/archive`,
    members: (projectId: string) => `/projects/${projectId}/members`,
    removeMember: (projectId: string, userId: string) =>
      `/projects/${projectId}/members/${userId}`,
    tasks: (projectId: string) => `/projects/${projectId}/tasks`,
    presence: (projectId: string) => `/projects/${projectId}/presence`,
    incidents: (projectId: string) => `/projects/${projectId}/incidents`,
  },

  tasks: {
    create: '/tasks',
    detail: (taskId: string) => `/tasks/${taskId}`,
    assignees: (taskId: string) => `/tasks/${taskId}/assignees`,
    assigneeStatus: (taskId: string, userId: string) =>
      `/tasks/${taskId}/assignees/${userId}/status`,
    removeAssignee: (taskId: string, userId: string) =>
      `/tasks/${taskId}/assignees/${userId}`,
  },

  notifications: {
    list: '/notifications',
    unreadCount: '/notifications/unread-count',
    markRead: (notificationId: string) =>
      `/notifications/${notificationId}/read`,
    markAllRead: '/notifications/read-all',
    delete: (notificationId: string) => `/notifications/${notificationId}`,
  },

  incidents: {
    list: '/incidents',
    create: '/incidents',
    detail: (incidentId: string) => `/incidents/${incidentId}`,
    byId: (incidentId: string) => `/incidents/${incidentId}`,
    close: (incidentId: string) => `/incidents/${incidentId}/close`,
  },

  users: {
    list: '/users',
  },
} as const;