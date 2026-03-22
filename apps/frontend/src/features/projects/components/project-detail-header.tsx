'use client';

import { Plus, UserPlus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import type { Project } from '@/types/project';

type ProjectDetailHeaderProps = {
  project: Project;
  isTeamLead: boolean;
  onAddMember: () => void;
  onCreateTask: () => void;
};

export function ProjectDetailHeader({
  project,
  isTeamLead,
  onAddMember,
  onCreateTask,
}: ProjectDetailHeaderProps): React.JSX.Element {
  return (
    <section className="rounded-3xl border border-border/60 bg-card/95 p-6 shadow-sm">
      <div className="space-y-3">
        <div className="inline-flex items-center rounded-full border border-border/60 bg-muted/60 px-3 py-1 text-xs font-medium text-muted-foreground">
          Project Detail
        </div>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              {project.name}
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              {project.description ?? 'No project description provided.'}
            </p>
          </div>

          {isTeamLead ? (
            <div className="flex flex-wrap items-center gap-3">
              <Button type="button" variant="outline" onClick={onAddMember}>
                <UserPlus className="mr-2 h-4 w-4" />
                Add Member
              </Button>

              <Button type="button" onClick={onCreateTask}>
                <Plus className="mr-2 h-4 w-4" />
                Create Task
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}