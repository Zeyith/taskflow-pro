export type Project = {
  id: string;
  name: string;
  description: string | null;
  isArchived: boolean;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
};

export type ProjectsListMeta = {
  isCached: boolean;
  limit?: number;
  offset?: number;
  total?: number;
};

export type ProjectsListResponse = {
  data: Project[];
  meta: ProjectsListMeta;
};