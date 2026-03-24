'use client';

import { RefreshCcw, ShieldAlert } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { IncidentDeleteDialog } from '@/features/incidents/components/incident-delete-dialog';
import { IncidentEditDialog } from '@/features/incidents/components/incident-edit-dialog';
import { IncidentsCreatePanel } from '@/features/incidents/components/incidents-create-panel';
import { IncidentsList } from '@/features/incidents/components/incidents-list';
import { IncidentsPageHeader } from '@/features/incidents/components/incidents-page-header';
import { IncidentsPrioritySidebar } from '@/features/incidents/components/incidents-priority-sidebar';
import { IncidentsProjectFilterCard } from '@/features/incidents/components/incidents-project-filter-card';
import { useAccessibleIncidents } from '@/features/incidents/hooks/use-accessible-incidents';
import { useCreateIncident } from '@/features/incidents/hooks/use-create-incident';
import { useDeleteIncident } from '@/features/incidents/hooks/use-delete-incident';
import { useUpdateIncident } from '@/features/incidents/hooks/use-update-incident';
import type { CreateIncidentSchemaValues } from '@/features/incidents/schemas/create-incident.schema';
import type { UpdateIncidentSchemaValues } from '@/features/incidents/schemas/update-incident.schema';
import { useProjects } from '@/features/projects/hooks/use-projects';
import { useAuthStore } from '@/stores/auth.store';
import type { Incident } from '@/types/incident';

export default function IncidentsPage(): React.JSX.Element {
  const user = useAuthStore((state) => state.user);
  const canCreateIncident = user?.role === 'TEAM_LEAD';

  const projectsQuery = useProjects();
  const projects = projectsQuery.data?.data ?? [];

  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [editingIncident, setEditingIncident] = useState<Incident | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deletingIncident, setDeletingIncident] = useState<Incident | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const createIncidentMutation = useCreateIncident();
  const updateIncidentMutation = useUpdateIncident();
  const deleteIncidentMutation = useDeleteIncident();

  const incidentsQuery = useAccessibleIncidents({
    projectId: selectedProjectId || undefined,
    limit: 20,
    offset: 0,
  });

  const selectedProject = useMemo(
    () => projects.find((project) => project.id === selectedProjectId) ?? null,
    [projects, selectedProjectId],
  );

  async function handleCreateIncident(
    values: CreateIncidentSchemaValues,
  ): Promise<void> {
    try {
      await createIncidentMutation.mutateAsync(values);
      toast.success('Incident created successfully.');
      void incidentsQuery.refetch();
    } catch (error) {
      const apiError = error as {
        response?: {
          data?: {
            message?: string;
          };
        };
      };

      toast.error(
        apiError.response?.data?.message ?? 'Failed to create the incident.',
      );
    }
  }

  function handleDeleteIncident(incident: Incident): void {
    setDeletingIncident(incident);
    setIsDeleteDialogOpen(true);
  }

  async function confirmDeleteIncident(): Promise<void> {
    if (!deletingIncident) {
      return;
    }

    try {
      await deleteIncidentMutation.mutateAsync({
        incidentId: deletingIncident.id,
      });

      toast.success('Incident deleted successfully.');

      if (editingIncident?.id === deletingIncident.id) {
        setEditingIncident(null);
        setIsEditDialogOpen(false);
      }

      setDeletingIncident(null);
      setIsDeleteDialogOpen(false);
      void incidentsQuery.refetch();
    } catch (error) {
      const apiError = error as {
        response?: {
          data?: {
            message?: string;
          };
        };
      };

      toast.error(
        apiError.response?.data?.message ?? 'Failed to delete the incident.',
      );
    }
  }

  function handleEditIncident(incident: Incident): void {
    setEditingIncident(incident);
    setIsEditDialogOpen(true);
  }

  async function handleUpdateIncident(
    values: UpdateIncidentSchemaValues,
  ): Promise<void> {
    if (!editingIncident) {
      return;
    }

    try {
      await updateIncidentMutation.mutateAsync({
        incidentId: editingIncident.id,
        values,
      });

      toast.success('Incident updated successfully.');
      setIsEditDialogOpen(false);
      setEditingIncident(null);
      void incidentsQuery.refetch();
    } catch (error) {
      const apiError = error as {
        response?: {
          data?: {
            message?: string;
          };
        };
      };

      toast.error(
        apiError.response?.data?.message ?? 'Failed to update the incident.',
      );
    }
  }

  if (projectsQuery.isLoading) {
    return (
      <section className="space-y-6">
        <div className="space-y-2">
          <div className="h-5 w-40 animate-pulse rounded bg-white/10" />
          <div className="h-8 w-64 animate-pulse rounded bg-white/10" />
          <div className="h-4 w-80 animate-pulse rounded bg-white/5" />
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-6">
            <Card className="rounded-3xl border border-white/10 bg-white/[0.03]">
              <CardContent className="space-y-4 p-6">
                <div className="h-10 w-full animate-pulse rounded-2xl bg-white/10" />
                <div className="h-40 w-full animate-pulse rounded-3xl bg-white/5" />
              </CardContent>
            </Card>

            <Card className="rounded-3xl border border-white/10 bg-white/[0.03]">
              <CardContent className="space-y-4 p-6">
                <div className="h-6 w-48 animate-pulse rounded bg-white/10" />
                <div className="h-28 w-full animate-pulse rounded-2xl bg-white/5" />
                <div className="h-28 w-full animate-pulse rounded-2xl bg-white/5" />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="rounded-3xl border border-white/10 bg-white/[0.03]">
              <CardContent className="space-y-4 p-6">
                <div className="h-5 w-32 animate-pulse rounded bg-white/10" />
                <div className="h-10 w-full animate-pulse rounded-2xl bg-white/10" />
              </CardContent>
            </Card>

            <Card className="rounded-3xl border border-white/10 bg-white/[0.03]">
              <CardContent className="space-y-4 p-6">
                <div className="h-5 w-36 animate-pulse rounded bg-white/10" />
                <div className="h-24 w-full animate-pulse rounded-2xl bg-white/5" />
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    );
  }

  if (projectsQuery.isError) {
    return (
      <section className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-3xl font-semibold tracking-tight text-white">
            Incidents
          </h2>
          <p className="text-sm text-zinc-400">
            We could not load your projects for incident management.
          </p>
        </div>

        <Card className="rounded-3xl border border-white/10 bg-white/[0.03]">
          <CardContent className="flex flex-col items-center justify-center gap-4 p-10 text-center">
            <p className="text-sm text-zinc-400">
              Something went wrong while loading available projects.
            </p>
            <Button
              variant="outline"
              className="border-white/10 bg-transparent text-white hover:bg-white hover:text-black"
              onClick={() => {
                void projectsQuery.refetch();
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

  if (projects.length === 0) {
    return (
      <section className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-3xl font-semibold tracking-tight text-white">
            Incidents
          </h2>
          <p className="text-sm text-zinc-400">
            You need at least one accessible project to view incidents.
          </p>
        </div>

        <Card className="rounded-3xl border border-white/10 bg-white/[0.03]">
          <CardContent className="flex flex-col items-center justify-center gap-4 p-12 text-center">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
              <ShieldAlert className="h-5 w-5 text-zinc-300" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-white">
                No projects available
              </h3>
              <p className="text-sm text-zinc-400">
                Incident rooms are scoped to projects you can access.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }

  const incidents = incidentsQuery.data?.data ?? [];

  return (
    <section className="space-y-6">
      <IncidentsPageHeader
        isCached={incidentsQuery.data?.meta?.isCached ?? false}
        isRefreshing={incidentsQuery.isFetching}
        onRefresh={() => {
          void incidentsQuery.refetch();
        }}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          {canCreateIncident ? (
            <IncidentsCreatePanel
              projects={projects.map((project) => ({
                id: project.id,
                name: project.name,
              }))}
              selectedProjectId={selectedProjectId}
              isOpen={isCreateFormOpen}
              isSubmitting={createIncidentMutation.isPending}
              onOpenChange={setIsCreateFormOpen}
              onSubmit={handleCreateIncident}
            />
          ) : null}

          <IncidentsList
            incidents={incidents}
            isLoading={incidentsQuery.isLoading}
            isError={incidentsQuery.isError}
            selectedProjectName={selectedProject?.name ?? null}
            projects={projects}
            onRetry={() => {
              void incidentsQuery.refetch();
            }}
            onEditIncident={handleEditIncident}
            onDeleteIncident={handleDeleteIncident}
            isEditDisabled={
              updateIncidentMutation.isPending || deleteIncidentMutation.isPending
            }
            isDeleteDisabled={deleteIncidentMutation.isPending}
          />
        </div>

        <div className="space-y-6">
          <IncidentsProjectFilterCard
            projects={projects}
            selectedProjectId={selectedProjectId}
            onProjectChange={(nextProjectId) => {
              setSelectedProjectId(nextProjectId);
            }}
          />
          <IncidentsPrioritySidebar
            incidents={incidents}
            projects={projects}
          />
        </div>
      </div>

      <IncidentEditDialog
        incident={editingIncident}
        isOpen={isEditDialogOpen}
        isSubmitting={updateIncidentMutation.isPending}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);

          if (!open) {
            setEditingIncident(null);
          }
        }}
        onSubmit={handleUpdateIncident}
      />

      <IncidentDeleteDialog
        incident={deletingIncident}
        isOpen={isDeleteDialogOpen}
        isSubmitting={deleteIncidentMutation.isPending}
        onOpenChange={(open) => {
          setIsDeleteDialogOpen(open);

          if (!open) {
            setDeletingIncident(null);
          }
        }}
        onConfirm={confirmDeleteIncident}
      />
    </section>
  );
}