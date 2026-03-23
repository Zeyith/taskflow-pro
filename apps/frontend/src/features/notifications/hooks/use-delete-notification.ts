'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteNotificationRequest } from '@/features/notifications/api/delete-notification';

export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteNotificationRequest,
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