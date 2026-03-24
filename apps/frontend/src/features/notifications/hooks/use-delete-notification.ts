'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/constants/query-keys';
import { deleteNotificationRequest } from '@/features/notifications/api/delete-notification';

export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteNotificationRequest,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.all,
      });

      void queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.unreadCount,
      });

      void queryClient.invalidateQueries({
        queryKey: queryKeys.dashboard.summary,
      });
    },
  });
}