'use client';

import { useRouter } from 'next/navigation';
import { ReactNode, useEffect } from 'react';

import { PageLoader } from '@/components/common/page-loader';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { appRoutes } from '@/constants/routes';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { RealtimeProvider } from '@/features/realtime/providers/realtime-provider';
import { useHydrated } from '@/hooks/use-hydrated';

type DashboardLayoutProps = {
  children: ReactNode;
};

export default function DashboardLayout({
  children,
}: DashboardLayoutProps): React.JSX.Element {
  const router = useRouter();
  const hydrated = useHydrated();
  const { isAuthenticated, hasHydrated } = useAuth();

  useEffect(() => {
    if (!hydrated || !hasHydrated) {
      return;
    }

    if (!isAuthenticated) {
      router.replace(appRoutes.login);
    }
  }, [hasHydrated, hydrated, isAuthenticated, router]);

  if (!hydrated || !hasHydrated) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    return <PageLoader />;
  }

  return (
    <RealtimeProvider>
      <DashboardShell>{children}</DashboardShell>
    </RealtimeProvider>
  );
}