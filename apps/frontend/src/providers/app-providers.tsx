'use client';

import * as React from 'react';

import { Toaster } from '@/components/ui/sonner';
import { RealtimeProvider } from '@/features/realtime/providers/realtime-provider';
import { QueryProvider } from '@/providers/query-provider';
import { ThemeProvider } from '@/providers/theme-provider';

type AppProvidersProps = {
  children: React.ReactNode;
};

export function AppProviders({
  children,
}: AppProvidersProps): React.JSX.Element {
  return (
    <ThemeProvider>
      <QueryProvider>
        <RealtimeProvider>
          {children}
          <Toaster richColors position="top-right" />
        </RealtimeProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}