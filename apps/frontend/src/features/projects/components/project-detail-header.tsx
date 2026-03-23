'use client';

import { useState } from 'react';
import {
  Archive,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  UserPlus,
} from 'lucide-react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import type { Project } from '@/types/project';

type ProjectDetailHeaderProps = {
  project: Project;
  isTeamLead: boolean;
  onAddMember: () => void;
  onCreateTask: () => void;
  onEditProject: () => void;
  onArchiveProject: () => Promise<void> | void;
  onDeleteProject: () => Promise<void> | void;
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
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  return (
    <>
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
                    onClick={() => {
                      setIsArchiveDialogOpen(true);
                    }}
                    disabled={isArchiving}
                  >
                    {isArchiving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Archiving...
                      </>
                    ) : (
                      <>
                        <Archive className="mr-2 h-4 w-4" />
                        Archive Project
                      </>
                    )}
                  </Button>
                ) : null}

                {project.isArchived ? (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => {
                      setIsDeleteDialogOpen(true);
                    }}
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Project
                      </>
                    )}
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

      <AlertDialog
        open={isArchiveDialogOpen}
        onOpenChange={(nextOpen) => {
          if (!isArchiving) {
            setIsArchiveDialogOpen(nextOpen);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive project?</AlertDialogTitle>
            <AlertDialogDescription>
              This project will be archived. Team members will still be able to
              review it, but active work and new task creation should stop.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isArchiving}>Cancel</AlertDialogCancel>

            <AlertDialogAction
              disabled={isArchiving}
              onClick={async (event) => {
                event.preventDefault();
                await onArchiveProject();
                setIsArchiveDialogOpen(false);
              }}
            >
              {isArchiving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Archiving...
                </>
              ) : (
                'Archive Project'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={(nextOpen) => {
          if (!isDeleting) {
            setIsDeleteDialogOpen(nextOpen);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete project?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The archived project and its related
              data will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>

            <AlertDialogAction
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async (event) => {
                event.preventDefault();
                await onDeleteProject();
                setIsDeleteDialogOpen(false);
              }}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Project'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}