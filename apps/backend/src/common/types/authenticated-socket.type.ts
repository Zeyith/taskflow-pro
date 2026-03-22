import type { Socket } from 'socket.io';
import type { SocketAuthUser } from './socket-auth-user.type';

export type AuthenticatedSocketData = {
  user?: SocketAuthUser;
};

export type AuthenticatedSocket = Socket<
  Record<string, never>,
  Record<string, never>,
  Record<string, never>,
  AuthenticatedSocketData
>;
