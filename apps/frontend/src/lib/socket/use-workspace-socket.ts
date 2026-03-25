'use client';

import { useEffect } from 'react';

import { useAuth } from '@/features/auth/hooks/use-auth';
import { connectSocket, disconnectSocket } from '@/lib/socket/socket-client';

function normalizeSocketToken(accessToken: string): string {
  const trimmedToken = accessToken.trim();

  if (trimmedToken.toLowerCase().startsWith('bearer ')) {
    return trimmedToken.slice('bearer '.length).trim();
  }

  return trimmedToken;
}

export function useWorkspaceSocket(): void {
  const { accessToken, isAuthenticated, user, hasHydrated } = useAuth();

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    if (!isAuthenticated || !accessToken || !user) {
      disconnectSocket();
      return;
    }

    const normalizedToken = normalizeSocketToken(accessToken);

    if (!normalizedToken) {
      disconnectSocket();
      return;
    }

    connectSocket(normalizedToken);

    return () => {
      disconnectSocket();
    };
  }, [accessToken, hasHydrated, isAuthenticated, user]);
}