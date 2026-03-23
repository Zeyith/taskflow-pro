'use client';

import { Card, CardContent } from '@/components/ui/card';
import type { Project } from '@/types/project';

type IncidentsProjectFilterCardProps = {
  projects: Project[];
  selectedProjectId: string;
  onProjectChange: (projectId: string) => void;
};

export function IncidentsProjectFilterCard({
  projects,
  selectedProjectId,
  onProjectChange,
}: IncidentsProjectFilterCardProps): React.JSX.Element {
  return (
    <Card className="rounded-3xl border border-white/10 bg-white/[0.03]">
      <CardContent className="p-6">
        <div className="mb-3">
          <label
            htmlFor="projectId"
            className="block text-sm font-medium text-zinc-200"
          >
            Project Filter
          </label>
          <p className="mt-1 text-xs text-zinc-400">
            Filter the incident feed by a specific project or view all projects.
          </p>
        </div>

        <select
          id="projectId"
          value={selectedProjectId}
          onChange={(event) => {
            onProjectChange(event.target.value);
          }}
          className="h-12 w-full rounded-2xl border border-white/10 bg-[#0b0d12] px-4 text-sm text-white outline-none"
        >
          <option value="">All projects</option>

          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
      </CardContent>
    </Card>
  );
}