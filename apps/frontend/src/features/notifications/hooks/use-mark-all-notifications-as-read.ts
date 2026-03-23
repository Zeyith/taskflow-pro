'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { markAllNotificationsAsReadRequest } from '@/features/notifications/api/mark-all-notifications-as-read';

export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAllNotificationsAsReadRequest,
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