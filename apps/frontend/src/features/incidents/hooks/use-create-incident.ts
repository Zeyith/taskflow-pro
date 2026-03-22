'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createIncidentRequest } from '@/features/incidents/api/create-incident';

export function useCreateIncident() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createIncidentRequest,
    onSuccess: (incident) => {
      void queryClient.invalidateQueries({
        queryKey: ['incidents', 'project', incident.projectId],
      });

      void queryClient.invalidateQueries({
        queryKey: ['notifications', 'list'],
      });

      void queryClient.invalidateQueries({
        queryKey: ['notifications', 'unread-count'],
      });
    },
  });
}