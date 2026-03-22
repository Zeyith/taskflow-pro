export const DEFAULT_CACHE_TTL_SECONDS = 30;

export const CacheKey = {
  projectById(projectId: string): string {
    return `cache:project:${projectId}`;
  },

  projectTasks(projectId: string): string {
    return `cache:project:${projectId}:tasks`;
  },

  notificationUnreadCount(userId: string): string {
    return `cache:user:${userId}:notifications:unread-count`;
  },

  projectPresence(projectId: string): string {
    return `cache:project:${projectId}:presence`;
  },
} as const;
