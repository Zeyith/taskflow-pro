'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Plus, RefreshCcw, ShieldAlert } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { useCreateIncident } from '@/features/incidents/hooks/use-create-incident';
import { useProjectIncidents } from '@/features/incidents/hooks/use-project-incidents';
import {
  getIncidentSeverityClassName,
  getIncidentSeverityLabel,
  getIncidentStatusClassName,
  getIncidentStatusLabel,
} from '@/features/incidents/lib/incident-badges';
import {
  createIncidentSchema,
  type CreateIncidentSchemaValues,
} from '@/features/incidents/schemas/create-incident.schema';
import { useProjects } from '@/features/projects/hooks/use-projects';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { formatDateTime } from '@/lib/utils/format-date';

export default function IncidentsPage(): React.JSX.Element {
  const projectsQuery = useProjects();
  const projects = projectsQuery.data?.data ?? [];

  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);

  const createIncidentMutation = useCreateIncident();

  const form = useForm<CreateIncidentSchemaValues>({
    resolver: zodResolver(createIncidentSchema),
    defaultValues: {
      projectId: '',
      title: '',
      description: '',
      severity: 'HIGH',
    },
  });

  useEffect(() => {
    if (!selectedProjectId && projects.length > 0) {
      const initialProjectId = projects[0].id;
      setSelectedProjectId(initialProjectId);
      form.setValue('projectId', initialProjectId);
    }
  }, [form, projects, selectedProjectId]);

  const incidentsQuery = useProjectIncidents(selectedProjectId);

  const selectedProject = useMemo(
    () => projects.find((project) => project.id === selectedProjectId) ?? null,
    [projects, selectedProjectId],
  );

  async function onSubmit(values: CreateIncidentSchemaValues): Promise<void> {
    try {
      await createIncidentMutation.mutateAsync(values);
      toast.success('Incident created successfully.');

      form.reset({
        projectId: values.projectId,
        title: '',
        description: '',
        severity: values.severity,
      });

      setIsCreateFormOpen(false);
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

  if (projectsQuery.isLoading) {
    return (
      <section className="space-y-6">
        <div className="space-y-2">
          <div className="h-5 w-40 animate-pulse rounded bg-white/10" />
          <div className="h-8 w-64 animate-pulse rounded bg-white/10" />
          <div className="h-4 w-80 animate-pulse rounded bg-white/5" />
        </div>

        <Card className="rounded-3xl border border-white/10 bg-white/[0.03]">
          <CardContent className="space-y-4 p-6">
            <div className="h-10 w-full animate-pulse rounded-2xl bg-white/10" />
            <div className="h-40 w-full animate-pulse rounded-3xl bg-white/5" />
          </CardContent>
        </Card>
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
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div className="space-y-2">
          <div className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs font-medium text-zinc-300">
            Incident rooms
          </div>

          <h2 className="text-3xl font-semibold tracking-tight text-white">
            Incidents
          </h2>

          <p className="text-sm leading-7 text-zinc-400">
            Review urgent project-specific incidents and resolution status.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {incidentsQuery.data?.meta?.isCached ? (
            <span className="text-xs text-zinc-500">Cached response</span>
          ) : null}

          <Button
            variant="outline"
            className="border-white/10 bg-transparent text-white hover:bg-white hover:text-black"
            onClick={() => {
              void incidentsQuery.refetch();
            }}
            disabled={incidentsQuery.isFetching || !selectedProjectId}
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      <Card className="rounded-3xl border border-white/10 bg-white/[0.03]">
        <CardContent className="p-6">
          <label
            htmlFor="projectId"
            className="mb-2 block text-sm font-medium text-zinc-200"
          >
            Project
          </label>
          <select
            id="projectId"
            value={selectedProjectId}
            onChange={(event) => {
              const nextProjectId = event.target.value;
              setSelectedProjectId(nextProjectId);
              form.setValue('projectId', nextProjectId, {
                shouldValidate: true,
              });
            }}
            className="h-12 w-full rounded-2xl border border-white/10 bg-[#0b0d12] px-4 text-sm text-white outline-none"
          >
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </CardContent>
      </Card>

      <Card className="rounded-3xl border border-white/10 bg-white/[0.03]">
        <CardContent className="p-6">
          {!isCreateFormOpen ? (
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">
                  Create Incident
                </h3>
                <p className="mt-1 text-sm text-zinc-400">
                  Open a new high-priority incident for the selected project.
                </p>
              </div>

              <Button
                type="button"
                className="bg-white text-black hover:bg-zinc-200"
                disabled={!selectedProjectId}
                onClick={() => {
                  form.setValue('projectId', selectedProjectId, {
                    shouldValidate: true,
                  });
                  setIsCreateFormOpen(true);
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Incident
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    Create Incident
                  </h3>
                  <p className="mt-1 text-sm text-zinc-400">
                    Open a new high-priority incident for the selected project.
                  </p>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="border-white/10 bg-transparent text-white hover:bg-white hover:text-black"
                  onClick={() => {
                    form.reset({
                      projectId: selectedProjectId,
                      title: '',
                      description: '',
                      severity: 'HIGH',
                    });
                    setIsCreateFormOpen(false);
                  }}
                >
                  Cancel
                </Button>
              </div>

              <Form {...form}>
                <form
                  className="space-y-5"
                  onSubmit={form.handleSubmit(onSubmit)}
                >
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-zinc-200">
                          Title
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Production outage"
                            className="h-12 rounded-2xl border-white/10 bg-[#0b0d12] text-white placeholder:text-zinc-500"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="severity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-zinc-200">
                          Severity
                        </FormLabel>
                        <FormControl>
                          <select
                            value={field.value}
                            onChange={field.onChange}
                            className="h-12 w-full rounded-2xl border border-white/10 bg-[#0b0d12] px-4 text-sm text-white outline-none"
                          >
                            <option value="LOW">Low</option>
                            <option value="MEDIUM">Medium</option>
                            <option value="HIGH">High</option>
                            <option value="CRITICAL">Critical</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-zinc-200">
                          Description
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe the impact, scope, and urgency..."
                            className="min-h-28 rounded-2xl border-white/10 bg-[#0b0d12] text-white placeholder:text-zinc-500"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="bg-white text-black hover:bg-zinc-200"
                    disabled={
                      createIncidentMutation.isPending || !selectedProjectId
                    }
                  >
                    {createIncidentMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Incident
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </>
          )}
        </CardContent>
      </Card>

      {incidentsQuery.isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card
              key={index}
              className="rounded-3xl border border-white/10 bg-white/[0.03]"
            >
              <CardContent className="space-y-3 p-6">
                <div className="h-5 w-44 animate-pulse rounded bg-white/10" />
                <div className="h-4 w-full animate-pulse rounded bg-white/5" />
                <div className="h-4 w-2/3 animate-pulse rounded bg-white/5" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : incidentsQuery.isError ? (
        <Card className="rounded-3xl border border-white/10 bg-white/[0.03]">
          <CardContent className="flex flex-col items-center justify-center gap-4 p-10 text-center">
            <p className="text-sm text-zinc-400">
              Something went wrong while loading incidents for{' '}
              {selectedProject?.name ?? 'the selected project'}.
            </p>
            <Button
              variant="outline"
              className="border-white/10 bg-transparent text-white hover:bg-white hover:text-black"
              onClick={() => {
                void incidentsQuery.refetch();
              }}
            >
              <RefreshCcw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : incidents.length === 0 ? (
        <Card className="rounded-3xl border border-white/10 bg-white/[0.03]">
          <CardContent className="flex flex-col items-center justify-center gap-4 p-12 text-center">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
              <ShieldAlert className="h-5 w-5 text-zinc-300" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-white">
                No incidents found
              </h3>
              <p className="text-sm text-zinc-400">
                There are no active or historical incidents for this project
                yet.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {incidents.map((incident) => (
            <Card
              key={incident.id}
              className="rounded-3xl border border-white/10 bg-white/[0.03]"
            >
              <CardContent className="p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-semibold text-white">
                        {incident.title}
                      </h3>

                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${getIncidentStatusClassName(
                            incident.status,
                          )}`}
                        >
                          {getIncidentStatusLabel(incident.status)}
                        </span>

                        <span
                          className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${getIncidentSeverityClassName(
                            incident.severity,
                          )}`}
                        >
                          {getIncidentSeverityLabel(incident.severity)}
                        </span>
                      </div>
                    </div>

                    <p className="text-sm leading-6 text-zinc-400">
                      {incident.description ??
                        'No incident description provided.'}
                    </p>
                  </div>

                  <div className="text-xs text-zinc-500">
                    {formatDateTime(incident.createdAt)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}