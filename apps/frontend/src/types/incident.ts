export type IncidentSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | string;

export type IncidentStatus = 'OPEN' | 'RESOLVED' | 'CLOSED' | string;

export type Incident = {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  severity: IncidentSeverity;
  status: IncidentStatus;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string | null;
  closedAt?: string | null;
};

export type IncidentsListMeta = {
  isCached?: boolean;
  limit?: number;
  offset?: number;
  total?: number;
};

export type IncidentsListResponse = {
  data: Incident[];
  meta?: IncidentsListMeta;
};