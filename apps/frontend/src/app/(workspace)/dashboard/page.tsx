'use client';

import {
  BellRing,
  BriefcaseBusiness,
  ListTodo,
  RefreshCcw,
  ShieldAlert,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDashboardSummary } from '@/features/dashboard/hooks/use-dashboard-summary';
import { useProjectPresence } from '@/features/presence/hooks/use-project-presence';
import { getProjectsRequest } from '@/features/projects/api/get-projects';

export default function DashboardPage(): React.JSX.Element {
  const summaryQuery = useDashboardSummary();

  const projectsQuery = useQuery({
    queryKey: ['dashboard', 'presence-projects'],
    queryFn: getProjectsRequest,
  });

  const defaultProject = projectsQuery.data?.data.find(
    (project) => !project.isArchived,
  );

  const presenceQuery = useProjectPresence(defaultProject?.id ?? null);

  const onlineUsers =
    presenceQuery.data?.data.filter((member) => member.status === 'ONLINE') ??
    [];

  const focusedUsers = onlineUsers.filter(
    (member) => member.focusedTaskTitle !== null,
  );

  const statCards = [
    {
      title: 'Active Projects',
      value: summaryQuery.data?.activeProjectsCount ?? '--',
      description: 'Projects currently in execution',
      icon: BriefcaseBusiness,
    },
    {
      title: 'Open Tasks',
      value: summaryQuery.data?.openTasksCount ?? '--',
      description: 'Pending and in-progress work',
      icon: ListTodo,
    },
    {
      title: 'Unread Notifications',
      value: summaryQuery.data?.unreadNotificationsCount ?? '--',
      description: 'Updates waiting for review',
      icon: BellRing,
    },
    {
      title: 'Active Incidents',
      value: summaryQuery.data?.activeIncidentsCount ?? '--',
      description: 'Urgent project rooms currently open',
      icon: ShieldAlert,
    },
  ];

  return (
    <section className="space-y-6">
      <div className="grid gap-4 xl:grid-cols-[1.5fr_0.5fr]">
        <Card className="rounded-3xl border border-border/60 bg-card/95 shadow-sm">
          <CardContent className="p-7">
            <div className="inline-flex items-center rounded-full border border-border/60 bg-muted/60 px-3 py-1 text-xs font-medium text-muted-foreground">
              Operations overview
            </div>

            <div className="mt-5 space-y-3">
              <h2 className="text-3xl font-semibold tracking-tight text-foreground">
                Dashboard
              </h2>
              <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
                Monitor projects, tasks, notifications, and incident workflow
                from one centralized enterprise workspace.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-border/60 bg-card/95 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground">
              Status
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-3">
            <div className="rounded-2xl border border-border/60 bg-muted/30 p-4">
              <p className="text-xs text-muted-foreground">Workspace state</p>
              <p className="mt-1 text-sm font-semibold text-foreground">
                Connected
              </p>
            </div>

            <div className="rounded-2xl border border-border/60 bg-muted/30 p-4">
              <p className="text-xs text-muted-foreground">
                Realtime foundation
              </p>
              <p className="mt-1 text-sm font-semibold text-foreground">
                Ready
              </p>
            </div>

            {summaryQuery.isError ? (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  void summaryQuery.refetch();
                }}
              >
                <RefreshCcw className="mr-2 h-4 w-4" />
                Retry summary
              </Button>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;

          return (
            <Card
              key={card.title}
              className="rounded-3xl border border-border/60 bg-card/95 shadow-sm"
            >
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                <div className="space-y-1">
                  <CardTitle className="text-sm font-medium text-foreground">
                    {card.title}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {card.description}
                  </p>
                </div>

                <div className="rounded-2xl border border-border/60 bg-muted/30 p-2">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>

              <CardContent>
                {summaryQuery.isLoading ? (
                  <div className="h-9 w-16 animate-pulse rounded bg-muted" />
                ) : (
                  <p className="text-3xl font-semibold tracking-tight text-foreground">
                    {card.value}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="rounded-3xl border border-border/60 bg-card/95 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-foreground">
              Recent activity
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="rounded-2xl border border-dashed border-border/60 bg-muted/20 p-10 text-center">
              <p className="text-sm text-muted-foreground">
                Activity feed will appear here after realtime dashboard widgets
                are connected.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-border/60 bg-card/95 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-foreground">
              Presence snapshot
            </CardTitle>
          </CardHeader>

          <CardContent>
            {projectsQuery.isLoading || presenceQuery.isLoading ? (
              <div className="space-y-3">
                <div className="h-16 animate-pulse rounded-2xl bg-muted" />
                <div className="h-16 animate-pulse rounded-2xl bg-muted" />
              </div>
            ) : null}

            {projectsQuery.isError ? (
              <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4">
                <p className="text-sm text-destructive">
                  Failed to load projects for presence preview.
                </p>
              </div>
            ) : null}

            {!projectsQuery.isLoading &&
            !projectsQuery.isError &&
            !defaultProject ? (
              <div className="rounded-2xl border border-dashed border-border/60 bg-muted/20 p-10 text-center">
                <p className="text-sm text-muted-foreground">
                  No accessible active project found for presence preview.
                </p>
              </div>
            ) : null}

            {!projectsQuery.isLoading &&
            !projectsQuery.isError &&
            defaultProject &&
            presenceQuery.isError ? (
              <div className="space-y-4">
                <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4">
                  <p className="text-sm text-destructive">
                    Failed to load presence data.
                  </p>
                </div>

                <Button
                  variant="outline"
                  onClick={() => {
                    void presenceQuery.refetch();
                  }}
                >
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Retry presence
                </Button>
              </div>
            ) : null}

            {!projectsQuery.isLoading &&
            !projectsQuery.isError &&
            defaultProject &&
            !presenceQuery.isLoading &&
            !presenceQuery.isError ? (
              <div className="space-y-4">
                <div className="rounded-2xl border border-border/60 bg-muted/30 p-4">
                  <p className="text-xs text-muted-foreground">Project</p>
                  <p className="mt-1 text-sm font-semibold text-foreground">
                    {defaultProject.name}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-border/60 bg-muted/30 p-4">
                    <p className="text-xs text-muted-foreground">Online users</p>
                    <p className="mt-1 text-2xl font-semibold text-foreground">
                      {onlineUsers.length}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-border/60 bg-muted/30 p-4">
                    <p className="text-xs text-muted-foreground">Focused tasks</p>
                    <p className="mt-1 text-2xl font-semibold text-foreground">
                      {focusedUsers.length}
                    </p>
                  </div>
                </div>

                {onlineUsers.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-border/60 bg-muted/20 p-6 text-center">
                    <p className="text-sm text-muted-foreground">
                      No users are currently online in this project.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {onlineUsers.slice(0, 3).map((member) => (
                      <div
                        key={member.userId}
                        className="rounded-2xl border border-border/60 bg-muted/25 p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-foreground">
                              {member.fullName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {member.role}
                            </p>
                          </div>

                          <div className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-300">
                            Online
                          </div>
                        </div>

                        <p className="mt-3 text-xs text-muted-foreground">
                          {member.focusedTaskTitle
                            ? `Focused on: ${member.focusedTaskTitle}`
                            : 'No focused task selected'}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}