'use client';

import { useQuery } from '@tanstack/react-query';
import {
  BellRing,
  BriefcaseBusiness,
  ListTodo,
  ShieldAlert,
} from 'lucide-react';
import Link from 'next/link';

import { queryKeys } from '@/constants/query-keys';
import { DashboardActivityCard } from '@/features/dashboard/components/dashboard-activity-card';
import { DashboardHero } from '@/features/dashboard/components/dashboard-hero';
import { DashboardPresenceCard } from '@/features/dashboard/components/dashboard-presence-card';
import { DashboardStatCard } from '@/features/dashboard/components/dashboard-stat-card';
import { DashboardStatusCard } from '@/features/dashboard/components/dashboard-status-card';
import { useDashboardSummary } from '@/features/dashboard/hooks/use-dashboard-summary';
import { useProjectPresence } from '@/features/presence/hooks/use-project-presence';
import { getProjectsRequest } from '@/features/projects/api/get-projects';

export default function DashboardPage(): React.JSX.Element {
  const summaryQuery = useDashboardSummary();

  const projectsQuery = useQuery({
    queryKey: queryKeys.dashboard.presenceProjects,
    queryFn: getProjectsRequest,
  });

  const defaultProject =
    projectsQuery.data?.data.find((project) => !project.isArchived) ?? null;

  const presenceQuery = useProjectPresence(defaultProject?.id ?? null);

  const onlineUsers =
    presenceQuery.data?.data.filter((member) => member.status === 'ONLINE') ??
    [];

  const focusedUsersCount = onlineUsers.filter(
    (member) => member.focusedTaskTitle !== null,
  ).length;

  const statCards = [
    {
      title: 'Active Projects',
      value: summaryQuery.data?.activeProjectsCount ?? '--',
      description: 'Projects currently in execution',
      icon: BriefcaseBusiness,
      href: '/projects',
    },
    {
      title: 'Open Tasks',
      value: summaryQuery.data?.openTasksCount ?? '--',
      description: 'Pending and in-progress work',
      icon: ListTodo,
      href: '/projects',
    },
    {
      title: 'Unread Notifications',
      value: summaryQuery.data?.unreadNotificationsCount ?? '--',
      description: 'Updates waiting for review',
      icon: BellRing,
      href: '/notifications',
    },
    {
      title: 'Active Incidents',
      value: summaryQuery.data?.activeIncidentsCount ?? '--',
      description: 'Urgent project rooms currently open',
      icon: ShieldAlert,
      href: '/incidents',
    },
  ] as const;

  return (
    <section className="space-y-6">
      <div className="grid gap-4 xl:grid-cols-[1.5fr_0.5fr]">
        <DashboardHero />
        <DashboardStatusCard
          hasSummaryError={summaryQuery.isError}
          onRetrySummary={() => {
            void summaryQuery.refetch();
          }}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
        {statCards.map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className="block rounded-[28px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
          >
            <DashboardStatCard
              title={card.title}
              value={card.value}
              description={card.description}
              icon={card.icon}
              isLoading={summaryQuery.isLoading}
            />
          </Link>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <DashboardActivityCard />

        <DashboardPresenceCard
          isProjectsLoading={projectsQuery.isLoading}
          isProjectsError={projectsQuery.isError}
          isPresenceLoading={presenceQuery.isLoading}
          isPresenceError={presenceQuery.isError}
          defaultProject={defaultProject}
          onlineUsers={onlineUsers}
          focusedUsersCount={focusedUsersCount}
          onRetryPresence={() => {
            void presenceQuery.refetch();
          }}
        />
      </div>
    </section>
  );
}