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
  updateTaskSchema,
  type UpdateTaskFormValues,
} from '@/features/tasks/schema/update-task.schema';
import type { Task } from '@/types/task';

type EditTaskDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
  onSubmit: (values: UpdateTaskFormValues) => Promise<void>;
  isSubmitting: boolean;
};

export function EditTaskDialog({
  open,
  onOpenChange,
  task,
  onSubmit,
  isSubmitting,
}: EditTaskDialogProps): React.JSX.Element {
  const form = useForm<UpdateTaskFormValues>({
    resolver: zodResolver(updateTaskSchema),
    defaultValues: {
      title: '',
      description: '',
    },
  });

  useEffect(() => {
    if (!task) {
      return;
    }

    form.reset({
      title: task.title,
      description: task.description ?? '',
    });
  }, [form, task]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-white/10 bg-[#05060a] text-white sm:max-w-[640px]">
        <DialogHeader>
          <DialogTitle>Edit task</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Update the task title and description.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            className="space-y-5"
            onSubmit={form.handleSubmit(async (values) => {
              await onSubmit(values);
            })}
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-zinc-200">
                    Task title
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Task title"
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-zinc-200">
                    Description
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the task..."
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
                  onOpenChange(false);
                }}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                className="bg-white text-black hover:bg-zinc-200"
                disabled={isSubmitting || task === null}
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