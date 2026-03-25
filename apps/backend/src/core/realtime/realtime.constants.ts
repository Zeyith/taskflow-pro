export const SOCKET_NAMESPACE = '/realtime';

export const RealtimeClientEvent = {
  projectJoin: 'project.join',
  projectLeave: 'project.leave',
} as const;

export const RealtimeEvent = {
  connectionEstablished: 'connection.established',
  projectJoined: 'project.joined',
  projectLeft: 'project.left',
  taskAssignmentStatusChanged: 'task.assignment.status.changed',
  projectMemberAdded: 'project.member.added',
  projectMemberRemoved: 'project.member.removed',
  taskCreated: 'task.created',
  taskUpdated: 'task.updated',
  taskDeleted: 'task.deleted',
  taskAssigneeAdded: 'task.assignee.added',
  taskAssigneeRemoved: 'task.assignee.removed',
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
