'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';

import { createQueryClient } from '@/lib/query/query-client';

type QueryProviderProps = {
  children: ReactNode;
};

export function QueryProvider({
  children,
}: QueryProviderProps): React.JSX.Element {
  const [queryClient] = useState(() => createQueryClient());

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}