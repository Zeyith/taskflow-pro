'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';

import { queryKeys } from '@/constants/query-keys';
import { useProjects } from '@/features/projects/hooks/use-projects';
import { createRealtimeSocket } from '@/features/realtime/lib/create-realtime-socket';
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

    const socket = createRealtimeSocket(accessToken);

    socket.on(realtimeEvent.connectionEstablished, () => {
      for (const projectId of projectIds) {
        socket.emit(realtimeEvent.projectJoin, {
          projectId,
        });
      }
    });

    socket.on(
      realtimeEvent.incidentCreated,
      (payload: IncidentCreatedPayload) => {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.incidents.all,
        });

        void queryClient.invalidateQueries({
          queryKey: queryKeys.projects.all,
        });

        void queryClient.invalidateQueries({
          queryKey: queryKeys.notifications.all,
        });

        void queryClient.invalidateQueries({
          queryKey: queryKeys.notifications.unreadCount,
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
    });

    return () => {
      socket.disconnect();
    };
  }, [
    accessToken,
    hasHydrated,
    isAuthenticated,
    projectIds,
    queryClient,
    router,
  ]);

  return <>{children}</>;
}