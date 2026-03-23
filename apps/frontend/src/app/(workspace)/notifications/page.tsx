'use client';

import { useEffect, useState, type JSX } from 'react';
import { isAxiosError } from 'axios';
import { BellRing, RefreshCcw, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { useDeleteNotification } from '@/features/notifications/hooks/use-delete-notification';
import { useMarkAllNotificationsAsRead } from '@/features/notifications/hooks/use-mark-all-notifications-as-read';
import { useMarkNotificationAsRead } from '@/features/notifications/hooks/use-mark-notification-as-read';
import { useNotifications } from '@/features/notifications/hooks/use-notifications';
import { useUnreadNotificationsCount } from '@/features/notifications/hooks/use-unread-notifications-count';
import type { Notification } from '@/types/notification';
import { formatDateTime } from '@/lib/utils/format-date';

const PAGE_SIZE = 20;

function getApiErrorMessage(
  error: unknown,
  fallbackMessage: string,
): string {
  if (!isAxiosError(error)) {
    return fallbackMessage;
  }

  const responseData = error.response?.data;

  if (
    typeof responseData === 'object' &&
    responseData !== null &&
    'message' in responseData &&
    typeof responseData.message === 'string'
  ) {
    return responseData.message;
  }

  return fallbackMessage;
}

function getNotificationActorLabel(notification: Notification): string {
  const firstName = notification.createdByUser?.firstName?.trim() ?? '';
  const lastName = notification.createdByUser?.lastName?.trim() ?? '';
  const fullName = `${firstName} ${lastName}`.trim();

  if (fullName.length > 0) {
    return fullName;
  }

  return 'Someone';
}

export default function NotificationsPage(): JSX.Element {
  const [offset, setOffset] = useState(0);
  const limit = PAGE_SIZE;

  const notificationsQuery = useNotifications({ limit, offset });
  const unreadCountQuery = useUnreadNotificationsCount();
  const markAsReadMutation = useMarkNotificationAsRead();
  const markAllAsReadMutation = useMarkAllNotificationsAsRead();
  const deleteNotificationMutation = useDeleteNotification();

  const notifications = notificationsQuery.data?.data ?? [];
  const unreadCount = unreadCountQuery.data?.count ?? 0;
  const total = notificationsQuery.data?.meta?.total ?? 0;

  useEffect(() => {
    if (notificationsQuery.isLoading || notificationsQuery.data === undefined) {
      return;
    }

    const lastValidOffset =
      total > 0 ? Math.floor((total - 1) / limit) * limit : 0;

    if (offset > lastValidOffset) {
      setOffset(lastValidOffset);
    }
  }, [limit, notificationsQuery.data, notificationsQuery.isLoading, offset, total]);

  async function handleMarkAsRead(notificationId: string): Promise<void> {
    try {
      await markAsReadMutation.mutateAsync(notificationId);
      toast.success('Notification marked as read.');
    } catch (error: unknown) {
      toast.error(
        getApiErrorMessage(error, 'Failed to mark notification as read.'),
      );
    }
  }

  async function handleMarkAllAsRead(): Promise<void> {
    try {
      const result = await markAllAsReadMutation.mutateAsync();

      toast.success(
        result.updatedCount > 0
          ? `${result.updatedCount} notification${result.updatedCount === 1 ? '' : 's'} marked as read.`
          : 'All notifications are already read.',
      );
    } catch (error: unknown) {
      toast.error(
        getApiErrorMessage(error, 'Failed to mark all notifications as read.'),
      );
    }
  }

  async function handleDeleteNotification(
    notificationId: string,
  ): Promise<void> {
    try {
      await deleteNotificationMutation.mutateAsync(notificationId);
      toast.success('Notification deleted.');
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, 'Failed to delete notification.'));
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
                <div className="h-4 w-48 animate-pulse rounded bg-white/10" />
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

  const hasUnreadNotifications = unreadCount > 0;
  const isRefreshing =
    notificationsQuery.isFetching || unreadCountQuery.isFetching;
  const isAnyMutationPending =
    markAsReadMutation.isPending ||
    markAllAsReadMutation.isPending ||
    deleteNotificationMutation.isPending;
  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = total > 0 ? Math.ceil(total / limit) : 1;
  const hasPreviousPage = offset > 0;
  const hasNextPage = offset + limit < total;

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

        <div className="flex flex-wrap items-center gap-3">
          {notificationsQuery.data?.meta?.isCached ? (
            <span className="text-xs text-zinc-500">Cached response</span>
          ) : null}

          <div className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-zinc-300">
            {unreadCount} unread
          </div>

          <Button
            type="button"
            variant="outline"
            className="border-white/10 bg-transparent text-white hover:bg-white hover:text-black"
            onClick={() => {
              void handleMarkAllAsRead();
            }}
            disabled={!hasUnreadNotifications || isAnyMutationPending}
          >
            Mark all as read
          </Button>

          <Button
            variant="outline"
            className="border-white/10 bg-transparent text-white hover:bg-white hover:text-black"
            onClick={() => {
              void notificationsQuery.refetch();
              void unreadCountQuery.refetch();
            }}
            disabled={isRefreshing}
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
        <>
          <div className="space-y-4">
            {notifications.map((notification) => {
              const actorLabel = getNotificationActorLabel(notification);
              const hasProjectName =
                typeof notification.projectName === 'string' &&
                notification.projectName.trim().length > 0;

              return (
                <Card
                  key={notification.id}
                  className="rounded-3xl border border-white/10 bg-white/[0.03]"
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                          <span className="font-medium text-zinc-300">
                            {actorLabel}
                          </span>

                          {hasProjectName ? (
                            <>
                              <span>•</span>
                              <span>{notification.projectName}</span>
                            </>
                          ) : null}
                        </div>

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

                        <div className="flex flex-wrap items-center gap-2">
                          {!notification.isRead ? (
                            <Button
                              type="button"
                              variant="outline"
                              className="border-white/10 bg-transparent text-white hover:bg-white hover:text-black"
                              disabled={isAnyMutationPending}
                              onClick={() => {
                                void handleMarkAsRead(notification.id);
                              }}
                            >
                              Mark as read
                            </Button>
                          ) : null}

                          <Button
                            type="button"
                            variant="outline"
                            className="border-white/10 bg-transparent text-white hover:bg-white hover:text-black"
                            disabled={isAnyMutationPending}
                            onClick={() => {
                              void handleDeleteNotification(notification.id);
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
            <div className="mb-3 text-sm text-zinc-400">
              Page {currentPage} of {totalPages} · {total} total notifications
            </div>

            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(event) => {
                      event.preventDefault();

                      if (isRefreshing || !hasPreviousPage) {
                        return;
                      }

                      setOffset((currentOffset) =>
                        Math.max(0, currentOffset - limit),
                      );
                    }}
                    className={
                      !hasPreviousPage || isRefreshing
                        ? 'pointer-events-none opacity-50'
                        : undefined
                    }
                  />
                </PaginationItem>

                <PaginationItem>
                  <PaginationLink
                    href="#"
                    isActive
                    onClick={(event) => {
                      event.preventDefault();
                    }}
                  >
                    {currentPage}
                  </PaginationLink>
                </PaginationItem>

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(event) => {
                      event.preventDefault();

                      if (isRefreshing || !hasNextPage) {
                        return;
                      }

                      setOffset((currentOffset) => currentOffset + limit);
                    }}
                    className={
                      !hasNextPage || isRefreshing
                        ? 'pointer-events-none opacity-50'
                        : undefined
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </>
      )}
    </section>
  );
}