export type IncidentResolvedEventProps = Readonly<{
  incidentId: string;
  projectId: string;
  title: string;
  description: string | null;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'ACTIVE' | 'RESOLVED';
  createdBy: string;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
}>;

export class IncidentResolvedEvent {
  constructor(readonly props: IncidentResolvedEventProps) {}
}
