import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';
import { ZodError } from 'zod';

import { AppConfig } from '../../common/configs/app.config';
import { AuthenticationError } from '../../common/exceptions/authentication.exception';
import { AuthorizationError } from '../../common/exceptions/authorization.exception';
import { NotFoundError } from '../../common/exceptions/not-found.exception';
import {
  authTokenPayloadSchema,
  type AuthTokenPayload,
} from '../../common/types/auth-token-payload.type';
import { IncidentCreatedEvent } from '../../modules/incidents/events/incident-created.event';
import { IncidentResolvedEvent } from '../../modules/incidents/events/incident-resolved.event';
import { NotificationCreatedEvent } from '../../modules/notifications/events/notification-created.event';
import { NotificationUnreadCountUpdatedEvent } from '../../modules/notifications/events/notification-unread-count-updated.event';
import { PresenceEvent } from '../../modules/presence/presence.constants';
import {
  presenceFocusedTaskSetSchema,
  presenceHeartbeatSchema,
  type PresenceFocusedTaskSetDto,
  type PresenceHeartbeatDto,
} from '../../modules/presence/dto/presence-validation.schema';
import { PresenceService } from '../../modules/presence/presence.service';
import { TaskAssignmentStatusChangedEvent } from '../../modules/tasks/events/task-assignment-status-changed.event';
import { ConnectionManagerService } from './connection-manager.service';
import { RealtimeAccessService } from './realtime-access.service';
import {
  RealtimeEvent,
  RealtimeRoom,
  SOCKET_NAMESPACE,
} from './realtime.constants';

type SocketAuthUser = Readonly<AuthTokenPayload>;

type ClientToServerEvents = {
  'project.join': (payload: { projectId: string }) => void;
  'project.leave': (payload: { projectId: string }) => void;
  'presence.heartbeat': (payload: PresenceHeartbeatDto) => void;
  'presence.focused-task.set': (payload: PresenceFocusedTaskSetDto) => void;
};

type ServerToClientEvents = {
  'connection.established': (payload: {
    userId: string;
    socketId: string;
  }) => void;
  'project.joined': (payload: { projectId: string; room: string }) => void;
  'project.left': (payload: { projectId: string; room: string }) => void;
  'task.assignment.status.changed': (payload: {
    projectId: string;
    taskId: string;
    assigneeUserId: string;
    oldStatus: string;
    newStatus: string;
    changedBy: string;
    summaryStatus: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
    breakdown: {
      pendingCount: number;
      inProgressCount: number;
      awaitingApprovalCount: number;
      waitingForChangesCount: number;
      completedCount: number;
    };
    occurredAt: string;
  }) => void;
  'notification.created': (payload: {
    notificationId: string;
    recipientUserId: string;
    projectId: string | null;
    taskId: string | null;
    type: string;
    title: string;
    message: string;
    isRead: boolean;
    createdBy: string;
    readAt: string | null;
    createdAt: string;
    updatedAt: string;
  }) => void;
  'notification.unread-count.updated': (payload: {
    recipientUserId: string;
    unreadCount: number;
  }) => void;
  'presence.user.updated': (payload: {
    projectId: string;
    userId: string;
    isOnline: boolean;
    focusedTaskId: string | null;
    lastSeenAt: string;
  }) => void;
  'incident.created': (payload: {
    incidentId: string;
    projectId: string;
    title: string;
    description: string | null;
    severity: string;
    status: string;
    createdBy: string;
    closedAt: string | null;
    createdAt: string;
    updatedAt: string;
  }) => void;
  'incident.resolved': (payload: {
    incidentId: string;
    projectId: string;
    title: string;
    description: string | null;
    severity: string;
    status: string;
    createdBy: string;
    closedAt: string | null;
    createdAt: string;
    updatedAt: string;
  }) => void;
  'realtime.error': (payload: {
    type: string;
    error: string;
    message: string;
    timestamp: string;
    path: string;
    statusCode: number;
  }) => void;
};

type InterServerEvents = Record<string, never>;

type SocketData = {
  user?: SocketAuthUser;
};

type AppSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

type ProjectRoomBody = {
  projectId?: unknown;
};

function extractBearer(authHeader: unknown): string | null {
  if (typeof authHeader !== 'string') {
    return null;
  }

  const trimmed = authHeader.trim();

  if (!trimmed.toLowerCase().startsWith('bearer ')) {
    return null;
  }

  const token = trimmed.slice('bearer '.length).trim();

  return token.length > 0 ? token : null;
}

function getAuthTokenFromHandshakeAuth(auth: unknown): string | null {
  if (typeof auth !== 'object' || auth === null) {
    return null;
  }

  const record = auth as Record<string, unknown>;
  const token = record.token;

  if (typeof token === 'string' && token.trim().length > 0) {
    return token.trim();
  }

  return null;
}

function extractToken(client: AppSocket): string | null {
  const authToken = getAuthTokenFromHandshakeAuth(client.handshake.auth);

  if (authToken) {
    return authToken;
  }

  const authorizationHeader = client.handshake.headers.authorization;

  return extractBearer(authorizationHeader);
}

function extractProjectId(body: unknown): string | null {
  if (typeof body !== 'object' || body === null) {
    return null;
  }

  const record = body as ProjectRoomBody;
  const projectId = record.projectId;

  if (typeof projectId !== 'string') {
    return null;
  }

  const trimmed = projectId.trim();

  return trimmed.length > 0 ? trimmed : null;
}

@Injectable()
@WebSocketGateway({
  namespace: SOCKET_NAMESPACE,
  cors: {
    origin: true,
    credentials: true,
  },
})
export class RealtimeGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >;

  private readonly logger = new Logger(RealtimeGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly appConfig: AppConfig,
    private readonly connectionManager: ConnectionManagerService,
    private readonly realtimeAccessService: RealtimeAccessService,
    private readonly presenceService: PresenceService,
  ) {}

  async handleConnection(client: AppSocket): Promise<void> {
    const token = extractToken(client);

    if (!token) {
      this.reject(client, new AuthenticationError('JWT token is required'));
      return;
    }

    try {
      const rawPayload = this.jwtService.verify<Record<string, unknown>>(
        token,
        {
          secret: this.appConfig.jwt.secret,
        },
      );

      const payload = authTokenPayloadSchema.parse(rawPayload);

      client.data.user = {
        sub: payload.sub,
        email: payload.email,
        role: payload.role,
      };

      this.connectionManager.addConnection(payload.sub, client.id);

      await client.join(RealtimeRoom.user(payload.sub));

      client.emit(RealtimeEvent.connectionEstablished, {
        userId: payload.sub,
        socketId: client.id,
      });

      this.logger.log(
        JSON.stringify({
          message: 'Socket connected',
          userId: payload.sub,
          socketId: client.id,
          namespace: SOCKET_NAMESPACE,
          timestamp: new Date().toISOString(),
        }),
      );
    } catch {
      this.reject(client, new AuthenticationError('Invalid or expired token'));
    }
  }

  async handleDisconnect(client: AppSocket): Promise<void> {
    const user = client.data.user;

    if (!user) {
      return;
    }

    this.connectionManager.removeConnection(user.sub, client.id);
    await this.presenceService.markOffline(user.sub);

    this.logger.log(
      JSON.stringify({
        message: 'Socket disconnected',
        userId: user.sub,
        socketId: client.id,
        namespace: SOCKET_NAMESPACE,
        timestamp: new Date().toISOString(),
      }),
    );
  }

  @SubscribeMessage('project.join')
  async onProjectJoin(
    @ConnectedSocket() client: AppSocket,
    @MessageBody() body: unknown,
  ): Promise<{ joined: string }> {
    const user = client.data.user;

    if (!user) {
      this.reject(client, new AuthenticationError('Unauthenticated socket'));
      return { joined: '' };
    }

    const projectId = extractProjectId(body);

    if (!projectId) {
      client.emit(RealtimeEvent.error, {
        type: 'VALIDATION_ERROR',
        error: 'ValidationError',
        message: 'projectId is required',
        timestamp: new Date().toISOString(),
        path: 'ws://realtime',
        statusCode: 400,
      });

      return { joined: '' };
    }

    try {
      await this.realtimeAccessService.ensureProjectRoomJoinAllowed(
        user,
        projectId,
      );
    } catch (error) {
      if (
        error instanceof AuthorizationError ||
        error instanceof NotFoundError
      ) {
        client.emit(RealtimeEvent.error, {
          type: error.type,
          error: error.error,
          message: error.message,
          timestamp: new Date().toISOString(),
          path: 'ws://realtime',
          statusCode: error.statusCode,
        });

        return { joined: '' };
      }

      client.emit(RealtimeEvent.error, {
        type: 'INTERNAL_SERVER_ERROR',
        error: 'InternalServerError',
        message: 'Unexpected websocket error',
        timestamp: new Date().toISOString(),
        path: 'ws://realtime',
        statusCode: 500,
      });

      return { joined: '' };
    }

    const room = RealtimeRoom.project(projectId);

    await client.join(room);

    client.emit('project.joined', {
      projectId,
      room,
    });

    this.logger.log(
      JSON.stringify({
        message: 'Project room joined',
        userId: user.sub,
        projectId,
        socketId: client.id,
        room,
        timestamp: new Date().toISOString(),
      }),
    );

    return { joined: room };
  }

  @SubscribeMessage('project.leave')
  async onProjectLeave(
    @ConnectedSocket() client: AppSocket,
    @MessageBody() body: unknown,
  ): Promise<{ left: string }> {
    const user = client.data.user;

    if (!user) {
      this.reject(client, new AuthenticationError('Unauthenticated socket'));
      return { left: '' };
    }

    const projectId = extractProjectId(body);

    if (!projectId) {
      client.emit(RealtimeEvent.error, {
        type: 'VALIDATION_ERROR',
        error: 'ValidationError',
        message: 'projectId is required',
        timestamp: new Date().toISOString(),
        path: 'ws://realtime',
        statusCode: 400,
      });

      return { left: '' };
    }

    const room = RealtimeRoom.project(projectId);

    await client.leave(room);

    client.emit('project.left', {
      projectId,
      room,
    });

    this.logger.log(
      JSON.stringify({
        message: 'Project room left',
        userId: user.sub,
        projectId,
        socketId: client.id,
        room,
        timestamp: new Date().toISOString(),
      }),
    );

    return { left: room };
  }

  @SubscribeMessage(PresenceEvent.heartbeat)
  async handlePresenceHeartbeat(
    @ConnectedSocket() client: AppSocket,
    @MessageBody() payload: unknown,
  ): Promise<void> {
    const user = client.data.user;

    if (!user) {
      this.reject(client, new AuthenticationError('Unauthenticated socket'));
      return;
    }

    try {
      const parsedPayload: PresenceHeartbeatDto =
        presenceHeartbeatSchema.parse(payload);

      const result = await this.presenceService.heartbeat(
        parsedPayload.projectId,
        {
          sub: user.sub,
          email: user.email,
          role: user.role,
        },
      );

      const focusedTaskState = await this.presenceService.getFocusedTaskState(
        user.sub,
      );

      this.server
        .to(RealtimeRoom.project(parsedPayload.projectId))
        .emit(PresenceEvent.userUpdated, {
          projectId: parsedPayload.projectId,
          userId: result.data.userId,
          isOnline: result.data.isOnline,
          focusedTaskId: focusedTaskState?.taskId ?? null,
          lastSeenAt: result.data.lastSeenAt,
        });
    } catch (error) {
      if (error instanceof ZodError) {
        client.emit(RealtimeEvent.error, {
          type: 'VALIDATION_ERROR',
          error: 'ValidationError',
          message: 'Invalid websocket payload',
          timestamp: new Date().toISOString(),
          path: 'ws://realtime',
          statusCode: 400,
        });

        return;
      }

      if (
        error instanceof AuthorizationError ||
        error instanceof NotFoundError
      ) {
        client.emit(RealtimeEvent.error, {
          type: error.type,
          error: error.error,
          message: error.message,
          timestamp: new Date().toISOString(),
          path: 'ws://realtime',
          statusCode: error.statusCode,
        });

        return;
      }

      client.emit(RealtimeEvent.error, {
        type: 'INTERNAL_SERVER_ERROR',
        error: 'InternalServerError',
        message: 'Unexpected websocket error',
        timestamp: new Date().toISOString(),
        path: 'ws://realtime',
        statusCode: 500,
      });
    }
  }

  @SubscribeMessage(PresenceEvent.focusedTaskSet)
  async handlePresenceFocusedTaskSet(
    @ConnectedSocket() client: AppSocket,
    @MessageBody() payload: unknown,
  ): Promise<void> {
    const user = client.data.user;

    if (!user) {
      this.reject(client, new AuthenticationError('Unauthenticated socket'));
      return;
    }

    try {
      const parsedPayload: PresenceFocusedTaskSetDto =
        presenceFocusedTaskSetSchema.parse(payload);

      const focusedTaskResult = await this.presenceService.setFocusedTask(
        parsedPayload.projectId,
        parsedPayload.taskId,
        {
          sub: user.sub,
          email: user.email,
          role: user.role,
        },
      );

      const onlineState = await this.presenceService.getOnlineState(user.sub);

      this.server
        .to(RealtimeRoom.project(parsedPayload.projectId))
        .emit(PresenceEvent.userUpdated, {
          projectId: parsedPayload.projectId,
          userId: user.sub,
          isOnline: onlineState?.isOnline ?? false,
          focusedTaskId: focusedTaskResult.data.taskId,
          lastSeenAt:
            onlineState?.lastSeenAt ?? focusedTaskResult.data.updatedAt,
        });
    } catch (error) {
      if (error instanceof ZodError) {
        client.emit(RealtimeEvent.error, {
          type: 'VALIDATION_ERROR',
          error: 'ValidationError',
          message: 'Invalid websocket payload',
          timestamp: new Date().toISOString(),
          path: 'ws://realtime',
          statusCode: 400,
        });

        return;
      }

      if (
        error instanceof AuthorizationError ||
        error instanceof NotFoundError
      ) {
        client.emit(RealtimeEvent.error, {
          type: error.type,
          error: error.error,
          message: error.message,
          timestamp: new Date().toISOString(),
          path: 'ws://realtime',
          statusCode: error.statusCode,
        });

        return;
      }

      client.emit(RealtimeEvent.error, {
        type: 'INTERNAL_SERVER_ERROR',
        error: 'InternalServerError',
        message: 'Unexpected websocket error',
        timestamp: new Date().toISOString(),
        path: 'ws://realtime',
        statusCode: 500,
      });
    }
  }

  emitTaskAssignmentStatusChanged(
    event: TaskAssignmentStatusChangedEvent,
  ): void {
    const { props } = event;
    const projectRoom = RealtimeRoom.project(props.projectId);

    this.server
      .to(projectRoom)
      .emit(RealtimeEvent.taskAssignmentStatusChanged, {
        projectId: props.projectId,
        taskId: props.taskId,
        assigneeUserId: props.assigneeUserId,
        oldStatus: props.oldStatus,
        newStatus: props.newStatus,
        changedBy: props.changedBy,
        summaryStatus: props.summaryStatus,
        breakdown: props.breakdown,
        occurredAt: props.occurredAt,
      });

    this.logger.log(
      JSON.stringify({
        message: 'Task assignment status changed event published',
        projectId: props.projectId,
        taskId: props.taskId,
        assigneeUserId: props.assigneeUserId,
        changedBy: props.changedBy,
        room: projectRoom,
        timestamp: new Date().toISOString(),
      }),
    );
  }

  emitNotificationCreated(event: NotificationCreatedEvent): void {
    const { props } = event;
    const userRoom = RealtimeRoom.user(props.recipientUserId);

    this.server.to(userRoom).emit(RealtimeEvent.notificationCreated, {
      notificationId: props.notificationId,
      recipientUserId: props.recipientUserId,
      projectId: props.projectId,
      taskId: props.taskId,
      type: props.type,
      title: props.title,
      message: props.message,
      isRead: props.isRead,
      createdBy: props.createdBy,
      readAt: props.readAt,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    });

    this.logger.log(
      JSON.stringify({
        message: 'Notification created event published',
        notificationId: props.notificationId,
        recipientUserId: props.recipientUserId,
        room: userRoom,
        timestamp: new Date().toISOString(),
      }),
    );
  }

  emitNotificationUnreadCountUpdated(
    event: NotificationUnreadCountUpdatedEvent,
  ): void {
    const { props } = event;
    const userRoom = RealtimeRoom.user(props.recipientUserId);

    this.server
      .to(userRoom)
      .emit(RealtimeEvent.notificationUnreadCountUpdated, {
        recipientUserId: props.recipientUserId,
        unreadCount: props.unreadCount,
      });

    this.logger.log(
      JSON.stringify({
        message: 'Notification unread count updated event published',
        recipientUserId: props.recipientUserId,
        unreadCount: props.unreadCount,
        room: userRoom,
        timestamp: new Date().toISOString(),
      }),
    );
  }

  emitIncidentCreated(event: IncidentCreatedEvent): void {
    const { props } = event;
    const projectRoom = RealtimeRoom.project(props.projectId);

    this.server.to(projectRoom).emit(RealtimeEvent.incidentCreated, {
      incidentId: props.incidentId,
      projectId: props.projectId,
      title: props.title,
      description: props.description,
      severity: props.severity,
      status: props.status,
      createdBy: props.createdBy,
      closedAt: props.closedAt,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    });

    this.logger.log(
      JSON.stringify({
        message: 'Incident created event published',
        incidentId: props.incidentId,
        projectId: props.projectId,
        room: projectRoom,
        timestamp: new Date().toISOString(),
      }),
    );
  }

  emitIncidentResolved(event: IncidentResolvedEvent): void {
    const { props } = event;
    const projectRoom = RealtimeRoom.project(props.projectId);

    this.server.to(projectRoom).emit(RealtimeEvent.incidentResolved, {
      incidentId: props.incidentId,
      projectId: props.projectId,
      title: props.title,
      description: props.description,
      severity: props.severity,
      status: props.status,
      createdBy: props.createdBy,
      closedAt: props.closedAt,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    });

    this.logger.log(
      JSON.stringify({
        message: 'Incident resolved event published',
        incidentId: props.incidentId,
        projectId: props.projectId,
        room: projectRoom,
        timestamp: new Date().toISOString(),
      }),
    );
  }

  private reject(client: AppSocket, error: AuthenticationError): void {
    client.emit(RealtimeEvent.error, {
      type: 'AUTHENTICATION_ERROR',
      error: error.name,
      message: error.message,
      timestamp: new Date().toISOString(),
      path: 'ws://realtime',
      statusCode: 401,
    });

    client.disconnect(true);
  }
}
