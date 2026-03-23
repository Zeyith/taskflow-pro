'use client';

import { Archive, Pencil, Plus, Trash2, UserPlus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import type { Project } from '@/types/project';

type ProjectDetailHeaderProps = {
  project: Project;
  isTeamLead: boolean;
  onAddMember: () => void;
  onCreateTask: () => void;
  onEditProject: () => void;
  onArchiveProject: () => void;
  onDeleteProject: () => void;
  isArchiving?: boolean;
  isDeleting?: boolean;
};

export function ProjectDetailHeader({
  project,
  isTeamLead,
  onAddMember,
  onCreateTask,
  onEditProject,
  onArchiveProject,
  onDeleteProject,
  isArchiving = false,
  isDeleting = false,
}: ProjectDetailHeaderProps): React.JSX.Element {
  return (
    <section className="rounded-3xl border border-border/60 bg-card/95 p-6 shadow-sm">
      <div className="space-y-3">
        <div className="inline-flex items-center rounded-full border border-border/60 bg-muted/60 px-3 py-1 text-xs font-medium text-muted-foreground">
          Project Detail
        </div>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                {project.name}
              </h1>

              {project.isArchived ? (
                <span className="inline-flex items-center rounded-full border border-border/60 bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                  Archived
                </span>
              ) : null}
            </div>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              {project.description ?? 'No project description provided.'}
            </p>
          </div>

          {isTeamLead ? (
            <div className="flex flex-wrap items-center gap-3">
              <Button type="button" variant="outline" onClick={onEditProject}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit Project
              </Button>

              {!project.isArchived ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onArchiveProject}
                  disabled={isArchiving}
                >
                  <Archive className="mr-2 h-4 w-4" />
                  {isArchiving ? 'Archiving...' : 'Archive Project'}
                </Button>
              ) : null}

              {project.isArchived ? (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={onDeleteProject}
                  disabled={isDeleting}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {isDeleting ? 'Deleting...' : 'Delete Project'}
                </Button>
              ) : null}

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