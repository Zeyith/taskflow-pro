import type { Incident } from '@/types/incident';

import { AlertTriangle, Siren } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  getIncidentSeverityLabel,
  getIncidentStatusLabel,
} from '@/features/incidents/lib/incident-badges';

type IncidentsPrioritySidebarProps = {
  incidents: Incident[];
};

function getSeverityBadgeClassName(severity: Incident['severity']): string {
  switch (severity) {
    case 'CRITICAL':
      return 'border border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300';
    case 'HIGH':
      return 'border border-orange-500/30 bg-orange-500/10 text-orange-700 dark:text-orange-300';
    case 'MEDIUM':
      return 'border border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300';
    case 'LOW':
      return 'border border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-300';
    default:
      return '';
  }
}

function getStatusBadgeClassName(status: Incident['status']): string {
  switch (status) {
    case 'OPEN':
      return 'border border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300';
    case 'ACKNOWLEDGED':
      return 'border border-yellow-500/30 bg-yellow-500/10 text-yellow-700 dark:text-yellow-300';
    case 'RESOLVED':
      return 'border border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-300';
    default:
      return '';
  }
}

function PriorityIncidentCard({ incident }: { incident: Incident }) {
  return (
    <div className="rounded-xl border bg-background p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-sm font-semibold leading-none">{incident.title}</p>
          <p className="text-xs text-muted-foreground">
            Project ID: {incident.projectId}
          </p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <Badge className={getSeverityBadgeClassName(incident.severity)}>
            {getIncidentSeverityLabel(incident.severity)}
          </Badge>

          <Badge className={getStatusBadgeClassName(incident.status)}>
            {getIncidentStatusLabel(incident.status)}
          </Badge>
        </div>
      </div>

      {incident.description ? (
        <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">
          {incident.description}
        </p>
      ) : null}
    </div>
  );
}

export function IncidentsPrioritySidebar({
  incidents,
}: IncidentsPrioritySidebarProps) {
  const criticalIncidents = incidents.filter(
    (incident) => incident.severity === 'CRITICAL',
  );

  const highIncidents = incidents.filter(
    (incident) => incident.severity === 'HIGH',
  );

  return (
    <aside className="space-y-6">
      <Card className="border-destructive/30">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Siren className="h-4 w-4" />
            Critical Incidents
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
          {criticalIncidents.length > 0 ? (
            criticalIncidents.map((incident) => (
              <PriorityIncidentCard key={incident.id} incident={incident} />
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
              No critical incidents right now.
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="border-orange-500/30">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className="h-4 w-4" />
            High Severity
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
          {highIncidents.length > 0 ? (
            highIncidents.map((incident) => (
              <PriorityIncidentCard key={incident.id} incident={incident} />
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
              No high severity incidents right now.
            </p>
          )}
        </CardContent>
      </Card>
    </aside>
  );
}