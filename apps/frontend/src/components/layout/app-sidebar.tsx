'use client';

import {
  BellRing,
  BriefcaseBusiness,
  LayoutDashboard,
  ShieldAlert,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { sidebarItems } from '@/constants/navigation';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/shared/theme-toggle';
import { Button } from '@/components/ui/button';

const sidebarIcons = {
  Dashboard: LayoutDashboard,
  Projects: BriefcaseBusiness,
  Notifications: BellRing,
  Incidents: ShieldAlert,
} as const;

type AppSidebarProps = {
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
};

export function AppSidebar({
  isMobileOpen = false,
  onCloseMobile,
}: AppSidebarProps): React.JSX.Element {
  const pathname = usePathname();
  const { user } = useAuth();

  const filteredItems = sidebarItems.filter((item) =>
    user ? item.roles.includes(user.role) : false,
  );

  return (
    <>
      {isMobileOpen ? (
        <button
          type="button"
          aria-label="Close sidebar overlay"
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={onCloseMobile}
        />
      ) : null}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-72 transform border-r bg-background transition-transform duration-200 lg:static lg:z-auto lg:block lg:translate-x-0',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-start justify-between border-b px-6 py-6 lg:block">
            <div>
              <div className="inline-flex items-center rounded-full border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                TaskFlow Pro
              </div>

              <div className="mt-4 space-y-1">
                <p className="text-lg font-semibold tracking-tight text-foreground">
                  Workspace
                </p>
                <p className="text-sm leading-6 text-muted-foreground">
                  Centralized project, task, and incident management.
                </p>
              </div>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={onCloseMobile}
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <nav className="flex-1 space-y-2 p-4">
            {filteredItems.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(`${item.href}/`);

              const Icon =
                sidebarIcons[item.title as keyof typeof sidebarIcons] ??
                LayoutDashboard;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                  )}
                  onClick={onCloseMobile}
                >
                  <Icon className="h-4 w-4" />
                  <span className="font-medium">{item.title}</span>
                </Link>
              );
            })}
          </nav>

          <div className="border-t p-4">
            <ThemeToggle />
          </div>
        </div>
      </aside>
    </>
  );
}