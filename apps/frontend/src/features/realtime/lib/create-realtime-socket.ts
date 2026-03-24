import { io, type Socket } from 'socket.io-client';

type RealtimeSocket = Socket;

function getSocketUrl(): string {
  return process.env.NEXT_PUBLIC_SOCKET_URL ?? 'http://localhost:3000';
}

function getSocketNamespace(): string {
  return process.env.NEXT_PUBLIC_SOCKET_NAMESPACE ?? '/realtime';
}

export function createRealtimeSocket(accessToken: string): RealtimeSocket {
  return io(`${getSocketUrl()}${getSocketNamespace()}`, {
    transports: ['websocket'],
    withCredentials: true,
    autoConnect: true,
    auth: {
      token: accessToken,
    },
  });
}

export type { RealtimeSocket };