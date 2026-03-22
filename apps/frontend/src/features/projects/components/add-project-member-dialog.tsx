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
import type { User } from '@/types/user';

type AddProjectMemberDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  users: User[];
  members: ProjectMember[];
  isSubmitting?: boolean;
  onSubmit: (userId: string) => Promise<void> | void;
};

export function AddProjectMemberDialog({
  open,
  onOpenChange,
  users,
  members,
  isSubmitting = false,
  onSubmit,
}: AddProjectMemberDialogProps): React.JSX.Element {
  const [selectedUserId, setSelectedUserId] = useState('');

  const existingMemberUserIds = useMemo(
    () => new Set(members.map((member) => member.userId)),
    [members],
  );

  const availableUsers = users.filter(
    (user) => !existingMemberUserIds.has(user.id),
  );

  const selectableUsers = availableUsers.map((user) => ({
    value: user.id,
    label: `${user.firstName} ${user.lastName}`.trim(),
    description: user.email,
  }));

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
          <DialogTitle>Add project member</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Select an active user to add to this project.
          </DialogDescription>
        </DialogHeader>

        {availableUsers.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-6 text-center">
            <p className="text-sm text-zinc-400">
              No available users to add.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <label
              htmlFor="project-member-select"
              className="text-sm font-medium text-zinc-200"
            >
              User
            </label>

            <SearchableSelect
              value={selectedUserId}
              onChange={setSelectedUserId}
              options={selectableUsers}
              placeholder="Select a user"
              searchPlaceholder="Search users..."
              emptyText="No user found."
              disabled={isSubmitting}
            />
          </div>
        )}

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
              availableUsers.length === 0
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
                Add member
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}