'use client';

import { Loader2, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Incident } from '@/types/incident';

type IncidentDeleteDialogProps = {
  incident: Incident | null;
  isOpen: boolean;
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
};

export function IncidentDeleteDialog({
  incident,
  isOpen,
  isSubmitting,
  onOpenChange,
  onConfirm,
}: IncidentDeleteDialogProps): React.JSX.Element {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="border-white/10 bg-[#05060a] text-white sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Delete incident</DialogTitle>
          <DialogDescription className="text-zinc-400">
            This action will remove the incident from active lists. You can’t
            undo this from the interface.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4">
          <p className="text-sm text-zinc-200">
            <span className="font-semibold text-white">Incident:</span>{' '}
            {incident?.title ?? 'Unknown incident'}
          </p>
        </div>

        <DialogFooter className="gap-3 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            className="border-white/10 bg-transparent text-white hover:bg-white hover:text-black"
            onClick={() => {
              onOpenChange(false);
            }}
            disabled={isSubmitting}
          >
            Cancel
          </Button>

          <Button
            type="button"
            className="bg-red-600 text-white hover:bg-red-500"
            onClick={() => {
              void onConfirm();
            }}
            disabled={isSubmitting || incident === null}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete incident
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}