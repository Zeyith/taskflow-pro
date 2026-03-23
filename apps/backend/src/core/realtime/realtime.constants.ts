export const SOCKET_NAMESPACE = '/realtime';

export const RealtimeEvent = {
  connectionEstablished: 'connection.established',
  taskAssignmentStatusChanged: 'task.assignment.status.changed',
  notificationCreated: 'notification.created',
  notificationUnreadCountUpdated: 'notification.unread-count.updated',
  presenceUserUpdated: 'presence.user.updated',
  incidentCreated: 'incident.created',
  incidentResolved: 'incident.resolved',
  error: 'realtime.error',
} as const;

export const RealtimeRoom = {
  user: (userId: string): string => `user:${userId}`,
  project: (projectId: string): string => `project:${projectId}`,
} as const;
