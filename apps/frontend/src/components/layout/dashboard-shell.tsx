'use client';

import * as React from 'react';

import { AppHeader } from '@/components/layout/app-header';
import { AppSidebar } from '@/components/layout/app-sidebar';

type DashboardShellProps = {
  children: React.ReactNode;
};

export function DashboardShell({
  children,
}: DashboardShellProps): React.JSX.Element {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = React.useState(false);

  function handleOpenMobileSidebar(): void {
    setIsMobileSidebarOpen(true);
  }

  function handleCloseMobileSidebar(): void {
    setIsMobileSidebarOpen(false);
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen">
        <AppSidebar
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={handleCloseMobileSidebar}
        />

        <div className="flex min-h-screen flex-1 flex-col">
          <AppHeader onOpenMobileSidebar={handleOpenMobileSidebar} />

          <main className="flex-1 bg-[radial-gradient(circle_at_top_left,hsl(var(--muted))_0%,transparent_28%),radial-gradient(circle_at_top_right,hsl(var(--accent))_0%,transparent_22%)] px-4 py-6 md:px-6 lg:px-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}