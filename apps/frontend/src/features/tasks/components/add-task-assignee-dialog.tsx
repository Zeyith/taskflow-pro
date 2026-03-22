'use client';

import { Loader2, UserPlus } from 'lucide-react';
import { useMemo, useState } from 'react';

import { SearchableSelect } from '@/components/shared/searchable-select';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { ProjectMember } from '@/types/project-member';
import type { Task } from '@/types/task';

type AddTaskAssigneeDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task;
  members: ProjectMember[];
  isSubmitting?: boolean;
  onSubmit: (userId: string) => Promise<void> | void;
};

export function AddTaskAssigneeDialog({
  open,
  onOpenChange,
  task,
  members,
  isSubmitting = false,
  onSubmit,
}: AddTaskAssigneeDialogProps): React.JSX.Element {
  const [selectedUserId, setSelectedUserId] = useState('');

  const safeAssignees = Array.isArray(task.assignees) ? task.assignees : [];

  const assignedUserIds = useMemo(
    () => new Set(safeAssignees.map((assignee) => assignee.userId)),
    [safeAssignees],
  );

  const availableMembers = members.filter((member) => {
    if (!member.user) {
      return false;
    }

    return !assignedUserIds.has(member.userId);
  });

  const selectableMembers = availableMembers.map((member) => {
    const fullName = member.user
      ? `${member.user.firstName} ${member.user.lastName}`.trim()
      : member.userId;

    return {
      value: member.userId,
      label: fullName,
      description: member.user?.email ?? undefined,
    };
  });

  const handleClose = (): void => {
    setSelectedUserId('');
    onOpenChange(false);
  };

  const handleSubmit = async (): Promise<void> => {
    if (!selectedUserId) {
      return;
    }

    await onSubmit(selectedUserId);
    setSelectedUserId('');
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          setSelectedUserId('');
        }

        onOpenChange(nextOpen);
      }}
    >
      <DialogContent className="border-white/10 bg-zinc-950 text-white sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add assignee</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Select a project member to assign to this task.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-xs text-zinc-500">Task</p>
            <p className="mt-1 text-sm font-semibold text-white">
              {task.title}
            </p>
          </div>

          {availableMembers.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-6 text-center">
              <p className="text-sm text-zinc-400">
                No available project members to assign.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <label
                htmlFor={`assignee-select-${task.id}`}
                className="text-sm font-medium text-zinc-200"
              >
                Project member
              </label>

              <SearchableSelect
                value={selectedUserId}
                onChange={setSelectedUserId}
                options={selectableMembers}
                placeholder="Select a member"
                searchPlaceholder="Search members..."
                emptyText="No member found."
                disabled={isSubmitting}
              />
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            className="border-white/10 bg-transparent text-white hover:bg-white hover:text-black"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>

          <Button
            type="button"
            className="bg-white text-black hover:bg-zinc-200"
            onClick={() => {
              void handleSubmit();
            }}
            disabled={
              isSubmitting ||
              !selectedUserId ||
              availableMembers.length === 0
            }
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                Add assignee
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}