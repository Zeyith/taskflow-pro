'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/constants/query-keys';
import { markNotificationAsReadRequest } from '@/features/notifications/api/mark-notification-as-read';

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markNotificationAsReadRequest,
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