'use client';

import { LogOut, Menu } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { appRoutes } from '@/constants/routes';
import { useAuth } from '@/features/auth/hooks/use-auth';

type AppHeaderProps = {
  onOpenMobileSidebar: () => void;
};

export function AppHeader({
  onOpenMobileSidebar,
}: AppHeaderProps): React.JSX.Element {
  const router = useRouter();
  const { user, clearSession } = useAuth();

  function handleLogout(): void {
    clearSession();
    router.replace(appRoutes.login);
  }

  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-5 lg:px-8">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onOpenMobileSidebar}
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="space-y-0.5">
            <h1 className="text-base font-semibold tracking-tight text-foreground">
              Welcome back
            </h1>
            <p className="text-sm text-muted-foreground">
              {user?.email ?? 'Authenticated user'}
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          className="border-border/70 bg-background/70 shadow-sm hover:bg-accent"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </header>
  );
}