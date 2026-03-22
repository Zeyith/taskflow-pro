'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

import { cn } from '@/lib/utils';

export function ThemeToggle(): React.JSX.Element {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? resolvedTheme === 'dark' : true;

  function handleToggle(): void {
    setTheme(isDark ? 'light' : 'dark');
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={cn(
        'flex w-full items-center justify-between rounded-xl border px-3 py-2 transition-colors',
        'border-border bg-background/60 hover:bg-accent hover:text-accent-foreground',
      )}
    >
      <div className="flex items-center gap-2">
        <div className="rounded-lg bg-muted p-2">
          {isDark ? (
            <Moon className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Sun className="h-4 w-4" aria-hidden="true" />
          )}
        </div>

        <div className="text-left">
          <p className="text-sm font-medium text-foreground">Appearance</p>
          <p className="text-xs text-muted-foreground">
            {isDark ? 'Dark mode' : 'Light mode'}
          </p>
        </div>
      </div>

      <div
        className={cn(
          'relative h-6 w-11 rounded-full border transition-colors',
          isDark
            ? 'border-primary/30 bg-primary/20'
            : 'border-border bg-muted',
        )}
      >
        <span
          className={cn(
            'absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-foreground transition-all',
            isDark ? 'left-6' : 'left-1',
          )}
        />
      </div>
    </button>
  );
}