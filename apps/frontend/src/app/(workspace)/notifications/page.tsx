'use client';

import { BellRing, RefreshCcw } from 'lucide-react';
import { toast } from 'sonner';

import { useMarkNotificationAsRead } from '@/features/notifications/hooks/use-mark-notification-as-read';
import { useNotifications } from '@/features/notifications/hooks/use-notifications';
import { useUnreadNotificationsCount } from '@/features/notifications/hooks/use-unread-notifications-count';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatDateTime } from '@/lib/utils/format-date';

export default function NotificationsPage(): React.JSX.Element {
  const notificationsQuery = useNotifications();
  const unreadCountQuery = useUnreadNotificationsCount();
  const markAsReadMutation = useMarkNotificationAsRead();

  async function handleMarkAsRead(notificationId: string): Promise<void> {
    try {
      await markAsReadMutation.mutateAsync(notificationId);
      toast.success('Notification marked as read.');
    } catch (error) {
      const apiError = error as {
        response?: {
          data?: {
            message?: string;
          };
        };
      };

      toast.error(
        apiError.response?.data?.message ??
          'Failed to mark notification as read.',
      );
    }
  }

  if (notificationsQuery.isLoading || unreadCountQuery.isLoading) {
    return (
      <section className="space-y-6">
        <div className="space-y-2">
          <div className="h-5 w-40 animate-pulse rounded bg-white/10" />
          <div className="h-8 w-64 animate-pulse rounded bg-white/10" />
          <div className="h-4 w-80 animate-pulse rounded bg-white/5" />
        </div>

        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <Card
              key={index}
              className="rounded-3xl border border-white/10 bg-white/[0.03]"
            >
              <CardContent className="space-y-3 p-6">
                <div className="h-5 w-52 animate-pulse rounded bg-white/10" />
                <div className="h-4 w-full animate-pulse rounded bg-white/5" />
                <div className="h-4 w-2/3 animate-pulse rounded bg-white/5" />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    );
  }

  if (notificationsQuery.isError || unreadCountQuery.isError) {
    return (
      <section className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-3xl font-semibold tracking-tight text-white">
            Notifications
          </h2>
          <p className="text-sm text-zinc-400">
            We could not load your notification feed.
          </p>
        </div>

        <Card className="rounded-3xl border border-white/10 bg-white/[0.03]">
          <CardContent className="flex flex-col items-center justify-center gap-4 p-10 text-center">
            <p className="text-sm text-zinc-400">
              Something went wrong while fetching notifications.
            </p>

            <Button
              variant="outline"
              className="border-white/10 bg-transparent text-white hover:bg-white hover:text-black"
              onClick={() => {
                void notificationsQuery.refetch();
                void unreadCountQuery.refetch();
              }}
            >
              <RefreshCcw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </section>
    );
  }

  const notifications = notificationsQuery.data?.data ?? [];
  const unreadCount = unreadCountQuery.data?.count ?? 0;

  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div className="space-y-2">
          <div className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs font-medium text-zinc-300">
            Activity feed
          </div>

          <h2 className="text-3xl font-semibold tracking-tight text-white">
            Notifications
          </h2>

          <p className="text-sm leading-7 text-zinc-400">
            Review live updates for assignments, task changes, and incidents.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {notificationsQuery.data?.meta?.isCached ? (
            <span className="text-xs text-zinc-500">Cached response</span>
          ) : null}

          <div className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-zinc-300">
            {unreadCount} unread
          </div>

          <Button
            variant="outline"
            className="border-white/10 bg-transparent text-white hover:bg-white hover:text-black"
            onClick={() => {
              void notificationsQuery.refetch();
              void unreadCountQuery.refetch();
            }}
            disabled={
              notificationsQuery.isFetching || unreadCountQuery.isFetching
            }
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {notifications.length === 0 ? (
        <Card className="rounded-3xl border border-white/10 bg-white/[0.03]">
          <CardContent className="flex flex-col items-center justify-center gap-4 p-12 text-center">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
              <BellRing className="h-5 w-5 text-zinc-300" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-white">
                No notifications yet
              </h3>
              <p className="text-sm text-zinc-400">
                New assignments, task updates, and incident alerts will appear
                here.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              className="rounded-3xl border border-white/10 bg-white/[0.03]"
            >
              <CardContent className="p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-semibold text-white">
                        {notification.title}
                      </h3>

                      {notification.isRead ? (
                        <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] font-medium text-zinc-400">
                          Read
                        </span>
                      ) : (
                        <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-2.5 py-1 text-[11px] font-medium text-blue-300">
                          Unread
                        </span>
                      )}
                    </div>

                    <p className="text-sm leading-6 text-zinc-400">
                      {notification.message}
                    </p>
                  </div>

                  <div className="flex flex-col items-start gap-3 md:items-end">
                    <div className="text-xs text-zinc-500">
                      {formatDateTime(notification.createdAt)}
                    </div>

                    {!notification.isRead ? (
                      <Button
                        type="button"
                        variant="outline"
                        className="border-white/10 bg-transparent text-white hover:bg-white hover:text-black"
                        disabled={markAsReadMutation.isPending}
                        onClick={() => {
                          void handleMarkAsRead(notification.id);
                        }}
                      >
                        Mark as read
                      </Button>
                    ) : null}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}