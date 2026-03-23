'use client';

import { Card, CardContent } from '@/components/ui/card';
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
};

export function IncidentListItem({
  incident,
  projectName,
}: IncidentListItemProps): React.JSX.Element {
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

          <div className="text-xs text-zinc-500">
            {formatDateTime(incident.createdAt)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}