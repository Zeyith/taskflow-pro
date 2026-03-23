'use client';

import { RefreshCcw } from 'lucide-react';

import { Button } from '@/components/ui/button';

type IncidentsPageHeaderProps = {
  isCached: boolean;
  isRefreshing: boolean;
  onRefresh: () => void;
};

export function IncidentsPageHeader({
  isCached,
  isRefreshing,
  onRefresh,
}: IncidentsPageHeaderProps): React.JSX.Element {
  return (
    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div className="space-y-2">
        <div className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs font-medium text-zinc-300">
          Incident rooms
        </div>

        <h2 className="text-3xl font-semibold tracking-tight text-white">
          Incidents
        </h2>

        <p className="text-sm leading-7 text-zinc-400">
          Review urgent project-specific incidents and resolution status.
        </p>
      </div>

      <div className="flex items-center gap-3">
        {isCached ? (
          <span className="text-xs text-zinc-500">Cached response</span>
        ) : null}

        <Button
          variant="outline"
          className="border-white/10 bg-transparent text-white hover:bg-white hover:text-black"
          onClick={onRefresh}
          disabled={isRefreshing}
        >
          <RefreshCcw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>
    </div>
  );
}