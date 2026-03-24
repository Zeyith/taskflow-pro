'use client';

import { RefreshCcw, ShieldAlert } from 'lucide-react';
import { useMemo } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { IncidentListItem } from '@/features/incidents/components/incident-list-item';
import type { Incident } from '@/types/incident';
import type { Project } from '@/types/project';

type IncidentsListProps = {
  incidents: Incident[];
  isLoading: boolean;
  isError: boolean;
  selectedProjectName: string | null;
  projects: Project[];
  onRetry: () => void;
  onEditIncident?: (incident: Incident) => void;
  onDeleteIncident?: (incident: Incident) => void;
  isEditDisabled?: boolean;
  isDeleteDisabled?: boolean;
};

export function IncidentsList({
  incidents,
  isLoading,
  isError,
  selectedProjectName,
  projects,
  onRetry,
  onEditIncident,
  onDeleteIncident,
  isEditDisabled = false,
  isDeleteDisabled = false,
}: IncidentsListProps): React.JSX.Element {
  const isAllProjectsView = selectedProjectName === null;

  const projectNameById = useMemo(() => {
    return new Map(projects.map((project) => [project.id, project.name]));
  }, [projects]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card
            key={index}
            className="rounded-3xl border border-white/10 bg-white/[0.03]"
          >
            <CardContent className="space-y-3 p-6">
              <div className="h-5 w-44 animate-pulse rounded bg-white/10" />
              <div className="h-4 w-full animate-pulse rounded bg-white/5" />
              <div className="h-4 w-2/3 animate-pulse rounded bg-white/5" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <Card className="rounded-3xl border border-white/10 bg-white/[0.03]">
        <CardContent className="flex flex-col items-center justify-center gap-4 p-10 text-center">
          <p className="text-sm text-zinc-400">
            {isAllProjectsView
              ? 'Something went wrong while loading incidents across your accessible projects.'
              : `Something went wrong while loading incidents for ${selectedProjectName}.`}
          </p>

          <Button
            variant="outline"
            className="border-white/10 bg-transparent text-white hover:bg-white hover:text-black"
            onClick={onRetry}
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (incidents.length === 0) {
    return (
      <Card className="rounded-3xl border border-white/10 bg-white/[0.03]">
        <CardContent className="flex flex-col items-center justify-center gap-4 p-12 text-center">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
            <ShieldAlert className="h-5 w-5 text-zinc-300" />
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-white">
              No incidents found
            </h3>
            <p className="text-sm text-zinc-400">
              {isAllProjectsView
                ? 'There are no active or historical incidents across your accessible projects yet.'
                : 'There are no active or historical incidents for this project yet.'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {incidents.map((incident) => (
        <IncidentListItem
          key={incident.id}
          incident={incident}
          projectName={
            isAllProjectsView
              ? projectNameById.get(incident.projectId) ?? null
              : null
          }
          onEdit={onEditIncident}
          onDelete={onDeleteIncident}
          isEditDisabled={isEditDisabled}
          isDeleteDisabled={isDeleteDisabled}
        />
      ))}
    </div>
  );
}