'use client';

import { formatDateTime } from '@/lib/utils/format-date';
import type { Project } from '@/types/project';

type ProjectInfoCardProps = {
  project: Project;
  isTeamLead: boolean;
  memberCount: number;
};

export function ProjectInfoCard({
  project,
  isTeamLead,
  memberCount,
}: ProjectInfoCardProps): React.JSX.Element {
  return (
    <div className="rounded-3xl border border-border/60 bg-card/95 p-6 shadow-sm">
      <h2 className="text-sm font-semibold text-foreground">Project Info</h2>

      <dl className="mt-5 space-y-4">
        <div>
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">
            Created At
          </dt>
          <dd className="mt-1 text-sm text-foreground">
            {formatDateTime(project.createdAt)}
          </dd>
        </div>

        <div>
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">
            Updated At
          </dt>
          <dd className="mt-1 text-sm text-foreground">
            {formatDateTime(project.updatedAt)}
          </dd>
        </div>

        <div>
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">
            Archived
          </dt>
          <dd className="mt-1 text-sm text-foreground">
            {project.isArchived ? 'Yes' : 'No'}
          </dd>
        </div>

        {isTeamLead ? (
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">
              Members
            </dt>
            <dd className="mt-1 text-sm text-foreground">{memberCount}</dd>
          </div>
        ) : null}
      </dl>
    </div>
  );
}