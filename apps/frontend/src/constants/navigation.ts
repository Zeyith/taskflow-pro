import { appRoutes } from './routes';
import type { SidebarItem } from '@/types/navigation';

export const sidebarItems: SidebarItem[] = [
  {
    title: 'Dashboard',
    href: appRoutes.dashboard,
    roles: ['TEAM_LEAD', 'EMPLOYEE'],
  },
  {
    title: 'Projects',
    href: appRoutes.projects,
    roles: ['TEAM_LEAD', 'EMPLOYEE'],
  },
  {
    title: 'Notifications',
    href: appRoutes.notifications,
    roles: ['TEAM_LEAD', 'EMPLOYEE'],
  },
  {
    title: 'Incidents',
    href: appRoutes.incidents,
    roles: ['TEAM_LEAD', 'EMPLOYEE'],
  },
];