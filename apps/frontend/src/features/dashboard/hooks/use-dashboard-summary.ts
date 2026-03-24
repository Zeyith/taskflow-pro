'use client';

import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/constants/query-keys';
import { getProjectIncidentsRequest } from '@/features/incidents/api/get-project-incidents';
import { getUnreadNotificationsCountRequest } from '@/features/notifications/api/get-unread-notifications-count';
import { getProjectTasks } from '@/features/projects/api/get-project-tasks';
import { getProjectsRequest } from '@/features/projects/api/get-projects';

type DashboardSummary = {
  activeProjectsCount: number;
  openTasksCount: number;
  unreadNotificationsCount: number;
  activeIncidentsCount: number;
};

export function useDashboardSummary() {
  return useQuery({
    queryKey: queryKeys.dashboard.summary,
    queryFn: async (): Promise<DashboardSummary> => {
      const [projectsResponse, unreadCountResponse] = await Promise.all([
        getProjectsRequest(),
        getUnreadNotificationsCountRequest(),
      ]);

      const projects = projectsResponse.data;

      const [tasksByProject, incidentsByProject] = await Promise.all([
        Promise.all(projects.map((project) => getProjectTasks(project.id))),
        Promise.all(
          projects.map((project) => getProjectIncidentsRequest(project.id)),
        ),
      ]);

      const openTasksCount = tasksByProject
        .flat()
        .filter((task) => task.status !== 'COMPLETED').length;

      const activeIncidentsCount = incidentsByProject
        .flatMap((response) => response.data)
        .filter((incident) => incident.status === 'ACTIVE').length;

      return {
        activeProjectsCount: projects.filter((project) => !project.isArchived)
          .length,
        openTasksCount,
        unreadNotificationsCount: unreadCountResponse.count,
        activeIncidentsCount,
      };
    },
  });
}