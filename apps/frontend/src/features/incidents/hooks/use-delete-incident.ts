'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteIncidentRequest } from '@/features/incidents/api/delete-incident';

export function useDeleteIncident() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteIncidentRequest,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['incidents'],
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