'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updateIncidentRequest } from '@/features/incidents/api/update-incident';

export function useUpdateIncident() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateIncidentRequest,
    onSuccess: (incident) => {
      void queryClient.invalidateQueries({
        queryKey: ['incidents'],
      });

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