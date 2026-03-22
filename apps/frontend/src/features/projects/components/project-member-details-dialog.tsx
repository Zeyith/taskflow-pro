'use client';

import { useState } from 'react';
import { Loader2, UserMinus } from 'lucide-react';

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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { formatDateTime } from '@/lib/utils/format-date';
import type { ProjectMember } from '@/types/project-member';

type ProjectMemberDetailsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: ProjectMember | null;
  canRemove: boolean;
  isRemoving: boolean;
  onRemove: (member: ProjectMember) => Promise<void> | void;
};

function getMemberFullName(member: ProjectMember): string {
  if (!member.user) {
    return `User ${member.userId.slice(0, 8)}`;
  }

  return `${member.user.firstName} ${member.user.lastName}`.trim();
}

function getRoleLabel(role: 'TEAM_LEAD' | 'EMPLOYEE'): string {
  return role === 'TEAM_LEAD' ? 'Team Lead' : 'Employee';
}

export function ProjectMemberDetailsDialog({
  open,
  onOpenChange,
  member,
  canRemove,
  isRemoving,
  onRemove,
}: ProjectMemberDetailsDialogProps): React.JSX.Element {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  if (!member) {
    return (
      <>
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent />
        </Dialog>

        <AlertDialog open={false}>
          <AlertDialogContent />
        </AlertDialog>
      </>
    );
  }

  const memberFullName = getMemberFullName(member);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Member Details</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-2xl border border-border/60 bg-muted/25 p-4">
              <p className="text-xs text-muted-foreground">Full name</p>
              <p className="mt-1 text-sm font-semibold text-foreground">
                {memberFullName}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-border/60 bg-muted/25 p-4">
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="mt-1 break-all text-sm text-foreground">
                  {member.user?.email ?? 'User data unavailable'}
                </p>
              </div>

              <div className="rounded-2xl border border-border/60 bg-muted/25 p-4">
                <p className="text-xs text-muted-foreground">Role</p>
                <p className="mt-1 text-sm text-foreground">
                  {member.user ? getRoleLabel(member.user.role) : 'Unknown'}
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-border/60 bg-muted/25 p-4">
                <p className="text-xs text-muted-foreground">Added at</p>
                <p className="mt-1 text-sm text-foreground">
                  {formatDateTime(member.createdAt)}
                </p>
              </div>

              <div className="rounded-2xl border border-border/60 bg-muted/25 p-4">
                <p className="text-xs text-muted-foreground">User ID</p>
                <p className="mt-1 break-all text-sm text-foreground">
                  {member.userId}
                </p>
              </div>
            </div>

            {canRemove ? (
              <div className="pt-2">
                <Button
                  type="button"
                  variant="destructive"
                  disabled={isRemoving}
                  onClick={() => {
                    setIsConfirmOpen(true);
                  }}
                >
                  {isRemoving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Removing...
                    </>
                  ) : (
                    <>
                      <UserMinus className="mr-2 h-4 w-4" />
                      Remove from project
                    </>
                  )}
                </Button>
              </div>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={isConfirmOpen}
        onOpenChange={(nextOpen) => {
          if (!isRemoving) {
            setIsConfirmOpen(nextOpen);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove member from project?</AlertDialogTitle>
            <AlertDialogDescription>
              {memberFullName} will be removed from this project and will also be
              removed from the project&apos;s task assignments.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRemoving}>Cancel</AlertDialogCancel>

            <AlertDialogAction
              disabled={isRemoving}
              onClick={async (event) => {
                event.preventDefault();
                await onRemove(member);
                setIsConfirmOpen(false);
              }}
            >
              {isRemoving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Removing...
                </>
              ) : (
                'Remove member'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}