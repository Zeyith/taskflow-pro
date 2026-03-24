'use client';

import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/constants/query-keys';
import { getUnreadNotificationsCountRequest } from '@/features/notifications/api/get-unread-notifications-count';

export function useUnreadNotificationsCount() {
  return useQuery({
    queryKey: queryKeys.notifications.unreadCount,
    queryFn: getUnreadNotificationsCountRequest,
  });
}