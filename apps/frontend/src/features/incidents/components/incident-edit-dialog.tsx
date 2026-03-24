'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Pencil } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
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
  updateIncidentSchema,
  type UpdateIncidentSchemaValues,
} from '@/features/incidents/schemas/update-incident.schema';
import type { Incident } from '@/types/incident';

type IncidentEditDialogProps = {
  incident: Incident | null;
  isOpen: boolean;
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: UpdateIncidentSchemaValues) => Promise<void>;
};

export function IncidentEditDialog({
  incident,
  isOpen,
  isSubmitting,
  onOpenChange,
  onSubmit,
}: IncidentEditDialogProps): React.JSX.Element {
  const form = useForm<UpdateIncidentSchemaValues>({
    resolver: zodResolver(updateIncidentSchema),
    defaultValues: {
      title: '',
      description: '',
      severity: 'HIGH',
      status: 'ACTIVE',
    },
  });

  useEffect(() => {
    if (!incident) {
      return;
    }

    form.reset({
      title: incident.title,
      description: incident.description ?? '',
      severity:
        incident.severity === 'LOW' ||
        incident.severity === 'MEDIUM' ||
        incident.severity === 'HIGH' ||
        incident.severity === 'CRITICAL'
          ? incident.severity
          : 'HIGH',
      status: incident.status === 'RESOLVED' ? 'RESOLVED' : 'ACTIVE',
    });
  }, [form, incident]);

  const handleDialogOpenChange = (open: boolean): void => {
    if (!open && incident) {
      form.reset({
        title: incident.title,
        description: incident.description ?? '',
        severity:
          incident.severity === 'LOW' ||
          incident.severity === 'MEDIUM' ||
          incident.severity === 'HIGH' ||
          incident.severity === 'CRITICAL'
            ? incident.severity
            : 'HIGH',
        status: incident.status === 'RESOLVED' ? 'RESOLVED' : 'ACTIVE',
      });
    }

    onOpenChange(open);
  };

  const handleSubmit = async (
    values: UpdateIncidentSchemaValues,
  ): Promise<void> => {
    await onSubmit(values);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="border-white/10 bg-[#05060a] text-white sm:max-w-[640px]">
        <DialogHeader>
          <DialogTitle>Edit incident</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Update incident details and current resolution state.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            className="space-y-5"
            onSubmit={form.handleSubmit(handleSubmit)}
          >
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
                      value={field.value ?? ''}
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
                      value={field.value ?? 'HIGH'}
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
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-zinc-200">
                    Status
                  </FormLabel>
                  <FormControl>
                    <select
                      value={field.value ?? 'ACTIVE'}
                      onChange={field.onChange}
                      className="h-12 w-full rounded-2xl border border-white/10 bg-[#0b0d12] px-4 text-sm text-white outline-none"
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="RESOLVED">Resolved</option>
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
                      value={field.value ?? ''}
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
                disabled={isSubmitting || incident === null}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Pencil className="mr-2 h-4 w-4" />
                    Save changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}