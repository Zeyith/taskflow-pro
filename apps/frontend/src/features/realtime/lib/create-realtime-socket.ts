import { io, type Socket } from 'socket.io-client';

type RealtimeSocket = Socket;

function getSocketUrl(): string {
  return process.env.NEXT_PUBLIC_SOCKET_URL ?? 'http://localhost:3000';
}

function getSocketNamespace(): string {
  return process.env.NEXT_PUBLIC_SOCKET_NAMESPACE ?? '/realtime';
}

function normalizeSocketToken(accessToken: string): string {
  const trimmedToken = accessToken.trim();

  if (trimmedToken.toLowerCase().startsWith('bearer ')) {
    return trimmedToken.slice('bearer '.length).trim();
  }

  return trimmedToken;
}

export function createRealtimeSocket(accessToken: string): RealtimeSocket {
  const normalizedToken = normalizeSocketToken(accessToken);

  return io(`${getSocketUrl()}${getSocketNamespace()}`, {
    transports: ['websocket'],
    withCredentials: true,
    autoConnect: false,
    auth: {
      token: normalizedToken,
    },
  });
}

export type { RealtimeSocket };