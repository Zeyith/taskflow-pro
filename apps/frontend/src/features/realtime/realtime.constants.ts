export const realtimeEvent = {
  connectionEstablished: 'connection.established',
  incidentCreated: 'incident.created',
  incidentResolved: 'incident.resolved',
  notificationCreated: 'notification.created',
  notificationUnreadCountUpdated: 'notification.unread-count.updated',
  taskAssignmentStatusChanged: 'task.assignment.status.changed',
  presenceUserUpdated: 'presence.user.updated',
  realtimeError: 'realtime.error',
  projectJoin: 'project.join',
  projectJoined: 'project.joined',
  projectLeave: 'project.leave',
  projectLeft: 'project.left',
} as const;