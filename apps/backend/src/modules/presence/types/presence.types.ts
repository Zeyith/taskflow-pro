export type PresenceHeartbeatPayload = Readonly<{
  projectId: string;
}>;

export type PresenceFocusedTaskSetPayload = Readonly<{
  projectId: string;
  taskId: string | null;
}>;

export type PresenceFocusedTaskState = Readonly<{
  taskId: string | null;
  projectId: string | null;
  updatedAt: string;
}>;

export type PresenceOnlineState = Readonly<{
  userId: string;
  isOnline: boolean;
  lastSeenAt: string;
}>;

export type ProjectPresenceItem = Readonly<{
  userId: string;
  isOnline: boolean;
  focusedTaskId: string | null;
  lastSeenAt: string | null;
}>;

export type ProjectPresenceSnapshot = Readonly<{
  projectId: string;
  users: ProjectPresenceItem[];
}>;

export type PresenceUserUpdatedEventPayload = Readonly<{
  projectId: string;
  userId: string;
  isOnline: boolean;
  focusedTaskId: string | null;
  lastSeenAt: string;
}>;

export type PresenceProjectSnapshotEventPayload = Readonly<{
  projectId: string;
  users: ProjectPresenceItem[];
}>;
