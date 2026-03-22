export const PRESENCE_ONLINE_TTL_SECONDS = 60;
export const PRESENCE_FOCUSED_TASK_TTL_SECONDS = 60;

export const PresenceEvent = {
  heartbeat: 'presence.heartbeat',
  focusedTaskSet: 'presence.focused-task.set',
  userUpdated: 'presence.user.updated',
  projectSnapshot: 'presence.project.snapshot',
} as const;

export const PresenceRedisKey = {
  userOnline(userId: string): string {
    return `presence:user:${userId}:online`;
  },

  userFocusedTask(userId: string): string {
    return `presence:user:${userId}:focus`;
  },
} as const;
