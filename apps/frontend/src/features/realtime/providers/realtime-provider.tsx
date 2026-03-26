'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef } from 'react';

import { queryKeys } from '@/constants/query-keys';
import { useProjects } from '@/features/projects/hooks/use-projects';
import { showIncidentToast } from '@/features/realtime/lib/show-incident-toast';
import { realtimeEvent } from '@/features/realtime/realtime.constants';
import {
  connectSocket,
  disconnectSocket,
  getSocket,
} from '@/lib/socket/socket-client';
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
    if (!hasHydrated) {
      return;
    }

    if (!isAuthenticated || !accessToken) {
      disconnectSocket();
      return;
    }

    const normalizedToken = accessToken.trim();

    if (!normalizedToken) {
      disconnectSocket();
      return;
    }

    const socket = connectSocket(normalizedToken);
    joinedProjectIdsRef.current.clear();

    function joinProjects(currentProjectIds: string[]): void {
      for (const projectId of currentProjectIds) {
        if (joinedProjectIdsRef.current.has(projectId)) {
          continue;
        }

        socket.emit(realtimeEvent.projectJoin, { projectId });
        joinedProjectIdsRef.current.add(projectId);
      }
    }

    function handleConnectionEstablished(): void {
      joinedProjectIdsRef.current.clear();
      joinProjects(projectIds);
    }

    function handleIncidentCreated(payload: IncidentCreatedPayload): void {
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
    }

    function handleIncidentResolved(): void {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.incidents.all,
      });

      void queryClient.invalidateQueries({
        queryKey: queryKeys.dashboard.summary,
      });
    }

    function handleNotificationCreated(): void {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.all,
      });

      void queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.unreadCount,
      });

      void queryClient.invalidateQueries({
        queryKey: queryKeys.dashboard.summary,
      });
    }

    function handleNotificationUnreadCountUpdated(): void {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.unreadCount,
      });

      void queryClient.invalidateQueries({
        queryKey: queryKeys.dashboard.summary,
      });
    }

    function handleTaskAssignmentStatusChanged(): void {
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
    }

    socket.on(
      realtimeEvent.connectionEstablished,
      handleConnectionEstablished,
    );
    socket.on(realtimeEvent.incidentCreated, handleIncidentCreated);
    socket.on(realtimeEvent.incidentResolved, handleIncidentResolved);
    socket.on(realtimeEvent.notificationCreated, handleNotificationCreated);
    socket.on(
      realtimeEvent.notificationUnreadCountUpdated,
      handleNotificationUnreadCountUpdated,
    );
    socket.on(
      realtimeEvent.taskAssignmentStatusChanged,
      handleTaskAssignmentStatusChanged,
    );

    if (socket.connected) {
      handleConnectionEstablished();
    }

    return () => {
      joinedProjectIdsRef.current.clear();

      socket.off(
        realtimeEvent.connectionEstablished,
        handleConnectionEstablished,
      );
      socket.off(realtimeEvent.incidentCreated, handleIncidentCreated);
      socket.off(realtimeEvent.incidentResolved, handleIncidentResolved);
      socket.off(realtimeEvent.notificationCreated, handleNotificationCreated);
      socket.off(
        realtimeEvent.notificationUnreadCountUpdated,
        handleNotificationUnreadCountUpdated,
      );
      socket.off(
        realtimeEvent.taskAssignmentStatusChanged,
        handleTaskAssignmentStatusChanged,
      );
    };
  }, [accessToken, hasHydrated, isAuthenticated, projectIds, queryClient, router]);

  useEffect(() => {
    const socket = getSocket();

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
    return () => {
      disconnectSocket();
    };
  }, []);

  return <>{children}</>;
}