'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/constants/query-keys';
import { markAllNotificationsAsReadRequest } from '@/features/notifications/api/mark-all-notifications-as-read';

export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAllNotificationsAsReadRequest,
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