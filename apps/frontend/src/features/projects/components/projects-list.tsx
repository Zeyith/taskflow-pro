'use client';

import Link from 'next/link';
import { FolderKanban, Plus, RefreshCcw } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { CreateProjectDialog } from '@/features/projects/components/create-project-dialog';
import { useCreateProject } from '@/features/projects/hooks/use-create-project';
import { useProjects } from '@/features/projects/hooks/use-projects';
import type { CreateProjectFormValues } from '@/features/projects/schemas/create-project.schema';

export function ProjectsList(): React.JSX.Element {
  const { user } = useAuth();
  const { data, isLoading, isError, refetch, isFetching } = useProjects();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const createProjectMutation = useCreateProject();

  const isTeamLead = user?.role === 'TEAM_LEAD';

  const handleCreateProject = async (
    values: CreateProjectFormValues,
  ): Promise<void> => {
    await createProjectMutation.mutateAsync(values);
    setIsCreateDialogOpen(false);
  };

  if (isLoading) {
    return (
      <section className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground">
            Projects
          </h2>
          <p className="text-sm text-muted-foreground">
            Loading project workspace data...
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card
              key={index}
              className="rounded-3xl border border-border/60 bg-card/95 shadow-sm"
            >
              <CardContent className="space-y-4 p-6">
                <div className="h-5 w-32 animate-pulse rounded bg-muted" />
                <div className="h-4 w-full animate-pulse rounded bg-muted/70" />
                <div className="h-4 w-2/3 animate-pulse rounded bg-muted/70" />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground">
            Projects
          </h2>
          <p className="text-sm text-muted-foreground">
            We could not load your projects.
          </p>
        </div>

        <Card className="rounded-3xl border border-border/60 bg-card/95 shadow-sm">
          <CardContent className="flex flex-col items-center justify-center gap-4 p-10 text-center">
            <p className="text-sm text-muted-foreground">
              Something went wrong while fetching project data.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                void refetch();
              }}
            >
              <RefreshCcw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </section>
    );
  }

  const projects = data?.data ?? [];

  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div className="space-y-2">
          <div className="inline-flex items-center rounded-full border border-border/60 bg-muted/60 px-3 py-1 text-xs font-medium text-muted-foreground">
            Project workspace
          </div>

          <h2 className="text-3xl font-semibold tracking-tight text-foreground">
            Projects
          </h2>

          <p className="text-sm leading-7 text-muted-foreground">
            Browse active project spaces, track scope, and open details for task
            and member management.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {data?.meta?.isCached ? (
            <span className="text-xs text-muted-foreground">
              Cached response
            </span>
          ) : null}

          <Button
            variant="outline"
            onClick={() => {
              void refetch();
            }}
            disabled={isFetching}
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            Refresh
          </Button>

          {isTeamLead ? (
            <Button
              onClick={() => {
                setIsCreateDialogOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Button>
          ) : null}
        </div>
      </div>

      {projects.length === 0 ? (
        <Card className="rounded-3xl border border-border/60 bg-card/95 shadow-sm">
          <CardContent className="flex flex-col items-center justify-center gap-4 p-12 text-center">
            <div className="rounded-2xl border border-border/60 bg-muted/30 p-3">
              <FolderKanban className="h-5 w-5 text-muted-foreground" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-foreground">
                No projects found
              </h3>
              <p className="text-sm text-muted-foreground">
                {isTeamLead
                  ? 'Create your first project to start assigning work.'
                  : 'You are not assigned to any project yet.'}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <Link key={project.id} href={`/projects/${project.id}`}>
              <Card className="h-full rounded-3xl border border-border/60 bg-card/95 shadow-sm transition hover:border-border hover:bg-card">
                <CardHeader className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <CardTitle className="line-clamp-1 text-lg font-semibold text-foreground">
                      {project.name}
                    </CardTitle>

                    {project.isArchived ? (
                      <span className="rounded-full border border-border/60 bg-muted/40 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                        Archived
                      </span>
                    ) : (
                      <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-300">
                        Active
                      </span>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="line-clamp-3 min-h-[60px] text-sm leading-6 text-muted-foreground">
                    {project.description?.trim() || 'No description provided.'}
                  </p>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Created</span>
                    <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <CreateProjectDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreateProject}
        isSubmitting={createProjectMutation.isPending}
      />
    </section>
  );
}