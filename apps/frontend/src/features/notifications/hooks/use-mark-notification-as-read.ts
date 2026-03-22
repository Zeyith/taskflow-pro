'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { markNotificationAsReadRequest } from '@/features/notifications/api/mark-notification-as-read';

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markNotificationAsReadRequest,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['notifications', 'list'],
      });

      void queryClient.invalidateQueries({
        queryKey: ['notifications', 'unread-count'],
      });
    },
  });
}