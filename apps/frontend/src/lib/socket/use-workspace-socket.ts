"use client";

import { useEffect } from "react";

import { useAuth } from "@/features/auth/hooks/use-auth";
import { connectSocket, disconnectSocket } from "@/lib/socket/socket-client";

export function useWorkspaceSocket(): void {
  const { accessToken, isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || !accessToken || !user) {
      disconnectSocket();
      return;
    }

    connectSocket(accessToken);

    return () => {
      disconnectSocket();
    };
  }, [accessToken, isAuthenticated, user]);
}