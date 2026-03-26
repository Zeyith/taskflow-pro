'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef } from 'react';

import { queryKeys } from '@/constants/query-keys';
import { useProjects } from '@/features/projects/hooks/use-projects';
import {
  createRealtimeSocket,
  type RealtimeSocket,
} from '@/features/realtime/lib/create-realtime-socket';
import { showIncidentToast } from '@/features/realtime/lib/show-incident-toast';
import { realtimeEvent } from '@/features/realtime/realtime.constants';
import { useAuthStore } from '@/stores/auth.store';

type IncidentCreatedPayload = {
  incidentId: string;
  projectId: string;
  title: string;
  description: string | null;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | string;
  status: 'ACTIVE' | 'RESOLVED' | string;
  createdBy: string;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type RealtimeProviderProps = {
  children: React.ReactNode;
};

export function RealtimeProvider({
  children,
}: RealtimeProviderProps): React.JSX.Element {
  const router = useRouter();
  const queryClient = useQueryClient();
  const socketRef = useRef<RealtimeSocket | null>(null);
  const joinedProjectIdsRef = useRef<Set<string>>(new Set());

  const accessToken = useAuthStore((state) => state.accessToken);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);

  const projectsQuery = useProjects();
  const projects = projectsQuery.data?.data ?? [];

  const projectIds = useMemo(
    () => projects.map((project) => project.id),
    [projects],
  );

  useEffect(() => {
    if (!hasHydrated || !isAuthenticated || !accessToken) {
      return;
    }

    const normalizedToken = accessToken.trim();

    if (!normalizedToken) {
      return;
    }

    const socket = createRealtimeSocket(normalizedToken);
    socketRef.current = socket;
    joinedProjectIdsRef.current.clear();

    socket.on(
      realtimeEvent.incidentCreated,
      (payload: IncidentCreatedPayload) => {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.incidents.all,
        });

        void queryClient.invalidateQueries({
          queryKey: ['projects'],
        });

        void queryClient.invalidateQueries({
          queryKey: queryKeys.notifications.all,
        });

        void queryClient.invalidateQueries({
          queryKey: queryKeys.notifications.unreadCount,
        });

        void queryClient.invalidateQueries({
          queryKey: queryKeys.dashboard.summary,
        });

        showIncidentToast({
          incident: payload,
          onClick: () => {
            void router.push('/incidents');
          },
        });
      },
    );

    socket.on(realtimeEvent.incidentResolved, () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.incidents.all,
      });

      void queryClient.invalidateQueries({
        queryKey: queryKeys.dashboard.summary,
      });
    });

    socket.on(realtimeEvent.notificationCreated, () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.all,
      });

      void queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.unreadCount,
      });

      void queryClient.invalidateQueries({
        queryKey: queryKeys.dashboard.summary,
      });
    });

    socket.on(realtimeEvent.notificationUnreadCountUpdated, () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.unreadCount,
      });

      void queryClient.invalidateQueries({
        queryKey: queryKeys.dashboard.summary,
      });
    });

    socket.on(realtimeEvent.taskAssignmentStatusChanged, () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.dashboard.summary,
      });

      void queryClient.invalidateQueries({
        queryKey: ['projects'],
      });

      void queryClient.invalidateQueries({
        queryKey: ['tasks'],
      });

      void queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.all,
      });

      void queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.unreadCount,
      });
    });

    return () => {
      joinedProjectIdsRef.current.clear();
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
    };
  }, [accessToken, hasHydrated, isAuthenticated, queryClient, router]);

  useEffect(() => {
    const socket = socketRef.current;

    if (!socket || !socket.connected || projectIds.length === 0) {
      return;
    }

    for (const projectId of projectIds) {
      if (joinedProjectIdsRef.current.has(projectId)) {
        continue;
      }

      socket.emit(realtimeEvent.projectJoin, { projectId });
      joinedProjectIdsRef.current.add(projectId);
    }
  }, [projectIds]);

  useEffect(() => {
  const socketInstance = socketRef.current;

  if (!socketInstance) {
    return;
  }

  function handleConnected(): void {
    const activeSocket = socketRef.current;

    if (!activeSocket) {
      return;
    }

    joinedProjectIdsRef.current.clear();

    for (const projectId of projectIds) {
      activeSocket.emit(realtimeEvent.projectJoin, { projectId });
      joinedProjectIdsRef.current.add(projectId);
    }
  }

  socketInstance.on(realtimeEvent.connectionEstablished, handleConnected);

  return () => {
    socketInstance.off(realtimeEvent.connectionEstablished, handleConnected);
  };
}, [projectIds]);

  return <>{children}</>;
}