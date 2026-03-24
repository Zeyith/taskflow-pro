'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Plus } from 'lucide-react';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import {
  createIncidentSchema,
  type CreateIncidentSchemaValues,
} from '@/features/incidents/schemas/create-incident.schema';

type IncidentProjectOption = {
  id: string;
  name: string;
};

type IncidentsCreatePanelProps = {
  projects: IncidentProjectOption[];
  selectedProjectId: string;
  isOpen: boolean;
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: CreateIncidentSchemaValues) => Promise<void>;
};

export function IncidentsCreatePanel({
  projects,
  selectedProjectId,
  isOpen,
  isSubmitting,
  onOpenChange,
  onSubmit,
}: IncidentsCreatePanelProps): React.JSX.Element {
  const fallbackProjectId = useMemo(() => {
    if (selectedProjectId.length > 0) {
      return selectedProjectId;
    }

    return projects[0]?.id ?? '';
  }, [projects, selectedProjectId]);

  const form = useForm<CreateIncidentSchemaValues>({
    resolver: zodResolver(createIncidentSchema),
    defaultValues: {
      projectId: fallbackProjectId,
      title: '',
      description: '',
      severity: 'HIGH',
    },
  });

  const handleOpen = (): void => {
    form.reset({
      projectId: fallbackProjectId,
      title: '',
      description: '',
      severity: 'HIGH',
    });

    onOpenChange(true);
  };

  const handleDialogOpenChange = (open: boolean): void => {
    if (!open) {
      form.reset({
        projectId: fallbackProjectId,
        title: '',
        description: '',
        severity: 'HIGH',
      });
    }

    onOpenChange(open);
  };

  const handleSubmit = async (
    values: CreateIncidentSchemaValues,
  ): Promise<void> => {
    await onSubmit(values);

    form.reset({
      projectId: fallbackProjectId,
      title: '',
      description: '',
      severity: 'HIGH',
    });

    onOpenChange(false);
  };

  return (
    <>
      <Card className="rounded-3xl border border-white/10 bg-white/[0.03]">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">
                Create Incident
              </h3>
              <p className="mt-1 text-sm text-zinc-400">
                Open a new incident and choose the target project inside the
                form.
              </p>
            </div>

            <Button
              type="button"
              className="bg-white text-black hover:bg-zinc-200"
              disabled={projects.length === 0}
              onClick={handleOpen}
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Incident
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="border-white/10 bg-[#05060a] text-white sm:max-w-[640px]">
          <DialogHeader>
            <DialogTitle>Create incident</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Open a new incident room for a selected project.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form
              className="space-y-5"
              onSubmit={form.handleSubmit(handleSubmit)}
            >
              <FormField
                control={form.control}
                name="projectId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-zinc-200">
                      Project
                    </FormLabel>
                    <FormControl>
                      <select
                        value={field.value}
                        onChange={field.onChange}
                        className="h-12 w-full rounded-2xl border border-white/10 bg-[#0b0d12] px-4 text-sm text-white outline-none"
                      >
                        <option value="" disabled>
                          Select a project
                        </option>

                        {projects.map((project) => (
                          <option key={project.id} value={project.id}>
                            {project.name}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-zinc-200">
                      Incident title
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Production API outage"
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

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="border-white/10 bg-transparent text-white hover:bg-white hover:text-black"
                  onClick={() => {
                    handleDialogOpenChange(false);
                  }}
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  className="bg-white text-black hover:bg-zinc-200"
                  disabled={isSubmitting || projects.length === 0}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Create incident
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}