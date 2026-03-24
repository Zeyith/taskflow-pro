'use client';

import { Pencil, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuthStore } from '@/stores/auth.store';
import {
  getIncidentSeverityClassName,
  getIncidentSeverityLabel,
  getIncidentStatusClassName,
  getIncidentStatusLabel,
} from '@/features/incidents/lib/incident-badges';
import { formatDateTime } from '@/lib/utils/format-date';
import type { Incident } from '@/types/incident';

type IncidentListItemProps = {
  incident: Incident;
  projectName?: string | null;
  onEdit?: (incident: Incident) => void;
  onDelete?: (incident: Incident) => void;
  isEditDisabled?: boolean;
  isDeleteDisabled?: boolean;
};

export function IncidentListItem({
  incident,
  projectName,
  onEdit,
  onDelete,
  isEditDisabled = false,
  isDeleteDisabled = false,
}: IncidentListItemProps): React.JSX.Element {
  const user = useAuthStore((state) => state.user);
  const canManageIncident = user?.role === 'TEAM_LEAD';

  return (
    <Card className="rounded-3xl border border-white/10 bg-white/[0.03]">
      <CardContent className="p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-semibold text-white">
                {incident.title}
              </h3>

              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${getIncidentStatusClassName(
                    incident.status,
                  )}`}
                >
                  {getIncidentStatusLabel(incident.status)}
                </span>

                <span
                  className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${getIncidentSeverityClassName(
                    incident.severity,
                  )}`}
                >
                  {getIncidentSeverityLabel(incident.severity)}
                </span>
              </div>
            </div>

            {projectName ? (
              <p className="text-xs font-medium text-zinc-500">
                Project: {projectName}
              </p>
            ) : null}

            <p className="text-sm leading-6 text-zinc-400">
              {incident.description ?? 'No incident description provided.'}
            </p>
          </div>

          <div className="flex flex-col items-end gap-3">
            <div className="text-xs text-zinc-500">
              {formatDateTime(incident.createdAt)}
            </div>

            {canManageIncident ? (
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="border-white/10 bg-transparent text-white hover:bg-white hover:text-black"
                  disabled={isEditDisabled}
                  onClick={() => {
                    onEdit?.(incident);
                  }}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="border-red-500/30 bg-transparent text-red-300 hover:bg-red-500 hover:text-white"
                  disabled={isDeleteDisabled}
                  onClick={() => {
                    onDelete?.(incident);
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}