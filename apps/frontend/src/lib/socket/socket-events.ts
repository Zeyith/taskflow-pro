export const socketClientEvents = {
  projectJoin: "project.join",
  projectLeave: "project.leave",
} as const;

export const socketServerEvents = {
  connectionEstablished: "connection.established",
  projectJoined: "project.joined",
  projectLeft: "project.left",
  taskAssignmentStatusChanged: "task.assignment.status.changed",
  notificationCreated: "notification.created",
  notificationUnreadCountUpdated: "notification.unread-count.updated",
  presenceUserUpdated: "presence.user.updated",
  incidentCreated: "incident.created",
  incidentResolved: "incident.resolved",
  error: "realtime.error",
} as const;