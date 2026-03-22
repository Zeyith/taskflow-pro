import { io, type Socket } from "socket.io-client";

import { clientEnv } from "@/lib/env/env.client";

let socketInstance: Socket | null = null;

function buildSocketUrl(): string {
  const baseUrl = clientEnv.NEXT_PUBLIC_SOCKET_URL.replace(/\/$/, "");
  const namespace = clientEnv.NEXT_PUBLIC_SOCKET_NAMESPACE.startsWith("/")
    ? clientEnv.NEXT_PUBLIC_SOCKET_NAMESPACE
    : `/${clientEnv.NEXT_PUBLIC_SOCKET_NAMESPACE}`;

  return `${baseUrl}${namespace}`;
}

function normalizeSocketToken(accessToken: string): string {
  const trimmed = accessToken.trim();

  if (trimmed.toLowerCase().startsWith("bearer ")) {
    return trimmed.slice("bearer ".length).trim();
  }

  return trimmed;
}

export function createSocket(accessToken: string): Socket {
  const normalizedToken = normalizeSocketToken(accessToken);

  return io(buildSocketUrl(), {
    transports: ["websocket"],
    autoConnect: true,
    forceNew: true,
    auth: {
      token: normalizedToken,
    },
  });
}

export function getSocket(): Socket | null {
  return socketInstance;
}

export function connectSocket(accessToken: string): Socket {
  if (socketInstance) {
    socketInstance.removeAllListeners();
    socketInstance.disconnect();
    socketInstance = null;
  }

  socketInstance = createSocket(accessToken);

  return socketInstance;
}

export function disconnectSocket(): void {
  if (!socketInstance) {
    return;
  }

  socketInstance.removeAllListeners();
  socketInstance.disconnect();
  socketInstance = null;
}