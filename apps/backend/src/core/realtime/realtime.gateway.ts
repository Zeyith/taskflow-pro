import { JwtService } from '@nestjs/jwt';
import { Logger } from '@nestjs/common';
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

import { AppConfig } from '../../common/configs/app.config';
import type { AuthenticatedUser } from '../../common/types/authenticated-user.type';
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
import { ProjectMemberAddedEvent } from '../../modules/projects/events/project-member-added.event';
import { ProjectMemberRemovedEvent } from '../../modules/projects/events/project-member-removed.event';
import { TaskAssigneeAddedEvent } from '../../modules/tasks/events/task-assignee-added.event';
import { TaskAssigneeRemovedEvent } from '../../modules/tasks/events/task-assignee-removed.event';
import { TaskAssignmentStatusChangedEvent } from '../../modules/tasks/events/task-assignment-status-changed.event';
import { TaskCreatedEvent } from '../../modules/tasks/events/task-created.event';
import { TaskDeletedEvent } from '../../modules/tasks/events/task-deleted.event';
import { TaskUpdatedEvent } from '../../modules/tasks/events/task-updated.event';
import { ConnectionManagerService } from './connection-manager.service';
import { RealtimeAccessService } from './realtime-access.service';
import {
  RealtimeClientEvent,
  RealtimeEvent,
  RealtimeRoom,
  SOCKET_NAMESPACE,
} from './realtime.constants';

type ClientToServerEvents = {
  [RealtimeClientEvent.projectJoin]: (payload: { projectId: string }) => void;
  [RealtimeClientEvent.projectLeave]: (payload: { projectId: string }) => void;
  [PresenceEvent.heartbeat]: (payload: PresenceHeartbeatDto) => void;
  [PresenceEvent.focusedTaskSet]: (payload: PresenceFocusedTaskSetDto) => void;
};

type ServerToClientEvents = {
  [RealtimeEvent.connectionEstablished]: (payload: {
    userId: string;
    socketId: string;
  }) => void;
  [RealtimeEvent.projectJoined]: (payload: {
    projectId: string;
    room: string;
  }) => void;
  [RealtimeEvent.projectLeft]: (payload: {
    projectId: string;
    room: string;
  }) => void;
  [RealtimeEvent.taskAssignmentStatusChanged]: (payload: {
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
  [RealtimeEvent.projectMemberAdded]: (payload: {
    projectId: string;
    userId: string;
    addedBy: string;
    occurredAt: string;
  }) => void;
  [RealtimeEvent.projectMemberRemoved]: (payload: {
    projectId: string;
    userId: string;
    removedBy: string;
    occurredAt: string;
  }) => void;
  [RealtimeEvent.taskCreated]: (payload: {
    projectId: string;
    taskId: string;
    createdBy: string;
    occurredAt: string;
  }) => void;
  [RealtimeEvent.taskUpdated]: (payload: {
    projectId: string;
    taskId: string;
    updatedBy: string;
    occurredAt: string;
  }) => void;
  [RealtimeEvent.taskDeleted]: (payload: {
    projectId: string;
    taskId: string;
    deletedBy: string;
    occurredAt: string;
  }) => void;
  [RealtimeEvent.taskAssigneeAdded]: (payload: {
    projectId: string;
    taskId: string;
    userId: string;
    addedBy: string;
    occurredAt: string;
  }) => void;
  [RealtimeEvent.taskAssigneeRemoved]: (payload: {
    projectId: string;
    taskId: string;
    userId: string;
    removedBy: string;
    occurredAt: string;
  }) => void;
  [RealtimeEvent.notificationCreated]: (payload: {
    notificationId: string;
    recipientUserId: string;
    type: string;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
  }) => void;
  [RealtimeEvent.notificationUnreadCountUpdated]: (payload: {
    recipientUserId: string;
    unreadCount: number;
  }) => void;
  [PresenceEvent.userUpdated]: (payload: {
    projectId: string;
    userId: string;
    isOnline: boolean;
    focusedTaskId: string | null;
    lastSeenAt: string;
  }) => void;
  [RealtimeEvent.incidentCreated]: (payload: {
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
  [RealtimeEvent.incidentResolved]: (payload: {
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
  [RealtimeEvent.error]: (payload: {
    type: string;
    error: string;
    message: string;
    timestamp: string;
    path: string;
    statusCode: number;
  }) => void;
};

type SocketData = {
  user: AuthenticatedUser;
};

type AppSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  never,
  SocketData
>;

@WebSocketGateway({
  namespace: SOCKET_NAMESPACE,
  cors: {
    origin: true,
    credentials: true,
  },
})
export class RealtimeGateway
  implements OnGatewayConnection<AppSocket>, OnGatewayDisconnect<AppSocket>
{
  @WebSocketServer()
  server!: Server<
    ClientToServerEvents,
    ServerToClientEvents,
    never,
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
    const token = this.extractToken(client);

    if (!token) {
      client.disconnect(true);
      return;
    }

    try {
      const payload = await this.jwtService.verifyAsync<AuthenticatedUser>(
        token,
        {
          secret: this.appConfig.jwt.secret,
        },
      );

      client.data.user = payload;

      this.connectionManager.addConnection(payload.sub, client.id);

      await client.join(RealtimeRoom.user(payload.sub));

      client.emit(RealtimeEvent.connectionEstablished, {
        userId: payload.sub,
        socketId: client.id,
      });

      this.logger.log(
        JSON.stringify({
          message: 'Realtime client connected',
          userId: payload.sub,
          socketId: client.id,
          timestamp: new Date().toISOString(),
        }),
      );
    } catch {
      this.logger.warn(
        JSON.stringify({
          message: 'Realtime client authentication failed',
          socketId: client.id,
          timestamp: new Date().toISOString(),
        }),
      );

      client.disconnect(true);
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
        message: 'Realtime client disconnected',
        userId: user.sub,
        socketId: client.id,
        timestamp: new Date().toISOString(),
      }),
    );
  }

  @SubscribeMessage(RealtimeClientEvent.projectJoin)
  async onProjectJoin(
    @ConnectedSocket() client: AppSocket,
    @MessageBody() payload: { projectId: string },
  ): Promise<void> {
    const user = client.data.user;
    const projectId = payload.projectId;

    await this.realtimeAccessService.ensureProjectRoomJoinAllowed(
      user,
      projectId,
    );

    const room = RealtimeRoom.project(projectId);

    await client.join(room);

    client.emit(RealtimeEvent.projectJoined, {
      projectId,
      room,
    });
  }

  @SubscribeMessage(RealtimeClientEvent.projectLeave)
  async onProjectLeave(
    @ConnectedSocket() client: AppSocket,
    @MessageBody() payload: { projectId: string },
  ): Promise<void> {
    const room = RealtimeRoom.project(payload.projectId);

    await client.leave(room);

    client.emit(RealtimeEvent.projectLeft, {
      projectId: payload.projectId,
      room,
    });
  }

  @SubscribeMessage(PresenceEvent.heartbeat)
  async handlePresenceHeartbeat(
    @ConnectedSocket() client: AppSocket,
    @MessageBody() payload: PresenceHeartbeatDto,
  ): Promise<void> {
    const parsedPayload = presenceHeartbeatSchema.parse(payload);
    const user = client.data.user;

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
  }

  @SubscribeMessage(PresenceEvent.focusedTaskSet)
  async handlePresenceFocusedTaskSet(
    @ConnectedSocket() client: AppSocket,
    @MessageBody() payload: PresenceFocusedTaskSetDto,
  ): Promise<void> {
    const parsedPayload = presenceFocusedTaskSetSchema.parse(payload);
    const user = client.data.user;

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
        lastSeenAt: onlineState?.lastSeenAt ?? focusedTaskResult.data.updatedAt,
      });
  }

  emitTaskAssignmentStatusChanged(
    event: TaskAssignmentStatusChangedEvent,
  ): void {
    const { props } = event;
    const room = RealtimeRoom.project(props.projectId);

    this.server.to(room).emit(RealtimeEvent.taskAssignmentStatusChanged, {
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
  }

  emitProjectMemberAdded(event: ProjectMemberAddedEvent): void {
    const { props } = event;
    const room = RealtimeRoom.project(props.projectId);

    this.server.to(room).emit(RealtimeEvent.projectMemberAdded, {
      projectId: props.projectId,
      userId: props.userId,
      addedBy: props.addedBy,
      occurredAt: props.occurredAt,
    });
  }

  emitProjectMemberRemoved(event: ProjectMemberRemovedEvent): void {
    const { props } = event;
    const room = RealtimeRoom.project(props.projectId);

    this.server.to(room).emit(RealtimeEvent.projectMemberRemoved, {
      projectId: props.projectId,
      userId: props.userId,
      removedBy: props.removedBy,
      occurredAt: props.occurredAt,
    });
  }

  emitTaskCreated(event: TaskCreatedEvent): void {
    const { props } = event;
    const room = RealtimeRoom.project(props.projectId);

    this.server.to(room).emit(RealtimeEvent.taskCreated, {
      projectId: props.projectId,
      taskId: props.taskId,
      createdBy: props.createdBy,
      occurredAt: props.occurredAt,
    });
  }

  emitTaskUpdated(event: TaskUpdatedEvent): void {
    const { props } = event;
    const room = RealtimeRoom.project(props.projectId);

    this.server.to(room).emit(RealtimeEvent.taskUpdated, {
      projectId: props.projectId,
      taskId: props.taskId,
      updatedBy: props.updatedBy,
      occurredAt: props.occurredAt,
    });
  }

  emitTaskDeleted(event: TaskDeletedEvent): void {
    const { props } = event;
    const room = RealtimeRoom.project(props.projectId);

    this.server.to(room).emit(RealtimeEvent.taskDeleted, {
      projectId: props.projectId,
      taskId: props.taskId,
      deletedBy: props.deletedBy,
      occurredAt: props.occurredAt,
    });
  }

  emitTaskAssigneeAdded(event: TaskAssigneeAddedEvent): void {
    const { props } = event;
    const room = RealtimeRoom.project(props.projectId);

    this.server.to(room).emit(RealtimeEvent.taskAssigneeAdded, {
      projectId: props.projectId,
      taskId: props.taskId,
      userId: props.userId,
      addedBy: props.addedBy,
      occurredAt: props.occurredAt,
    });
  }

  emitTaskAssigneeRemoved(event: TaskAssigneeRemovedEvent): void {
    const { props } = event;
    const room = RealtimeRoom.project(props.projectId);

    this.server.to(room).emit(RealtimeEvent.taskAssigneeRemoved, {
      projectId: props.projectId,
      taskId: props.taskId,
      userId: props.userId,
      removedBy: props.removedBy,
      occurredAt: props.occurredAt,
    });
  }

  emitNotificationCreated(event: NotificationCreatedEvent): void {
    const { props } = event;
    const room = RealtimeRoom.user(props.recipientUserId);

    this.server.to(room).emit(RealtimeEvent.notificationCreated, {
      notificationId: props.notificationId,
      recipientUserId: props.recipientUserId,
      type: props.type,
      title: props.title,
      message: props.message,
      isRead: props.isRead,
      createdAt: props.createdAt,
    });
  }

  emitNotificationUnreadCountUpdated(
    event: NotificationUnreadCountUpdatedEvent,
  ): void {
    const { props } = event;
    const room = RealtimeRoom.user(props.recipientUserId);

    this.server.to(room).emit(RealtimeEvent.notificationUnreadCountUpdated, {
      recipientUserId: props.recipientUserId,
      unreadCount: props.unreadCount,
    });
  }

  emitIncidentCreated(event: IncidentCreatedEvent): void {
    const { props } = event;
    const room = RealtimeRoom.project(props.projectId);

    this.server.to(room).emit(RealtimeEvent.incidentCreated, {
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
  }

  emitIncidentResolved(event: IncidentResolvedEvent): void {
    const { props } = event;
    const room = RealtimeRoom.project(props.projectId);

    this.server.to(room).emit(RealtimeEvent.incidentResolved, {
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
  }

  private extractToken(client: AppSocket): string | null {
    const authPayload: unknown = client.handshake.auth;
    const authToken =
      typeof authPayload === 'object' &&
      authPayload !== null &&
      'token' in authPayload &&
      typeof authPayload.token === 'string'
        ? authPayload.token
        : null;

    if (authToken && authToken.length > 0) {
      return authToken;
    }

    const authorizationHeader = client.handshake.headers.authorization;

    if (
      typeof authorizationHeader === 'string' &&
      authorizationHeader.startsWith('Bearer ')
    ) {
      return authorizationHeader.slice('Bearer '.length);
    }

    return null;
  }
}
