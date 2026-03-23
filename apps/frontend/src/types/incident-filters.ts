export type AccessibleIncidentsFilters = {
  projectId?: string;
  severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status?: 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED';
  limit?: number;
  offset?: number;
};