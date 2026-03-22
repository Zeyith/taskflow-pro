import type { UserRole } from './common';

export type SidebarItem = {
  title: string;
  href: string;
  roles: UserRole[];
};