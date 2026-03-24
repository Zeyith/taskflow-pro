'use client';

import {
  Check,
  ChevronDown,
  ChevronUp,
  Pencil,
  Trash2,
  UserMinus,
  UserPlus,
} from 'lucide-react';
import { useState } from 'react';

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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  getTaskStatusClassName,
  getTaskStatusLabel,
} from '@/features/projects/lib/task-status';
import { taskStatuses, type Task, type TaskStatus } from '@/types/task';

type ProjectTaskItemProps = {
  task: Task;
  isTeamLead: boolean;
  isUpdatingTaskId?: string;
  isUpdatingUserId?: string;
  isRemovingTaskId?: string;
  isRemovingUserId?: string;
  isEditingTaskId?: string;
  isDeletingTaskId?: string;
  getAssigneeLabel: (assigneeUserId: string) => string;
  canUpdateAssigneeStatus: (assigneeUserId: string) => boolean;
  onAssignmentStatusChange: (
    taskId: string,
    userId: string,
    status: TaskStatus,
  ) => Promise<void> | void;
  onAddAssignee: (task: Task) => void;
  onRemoveAssignee: (taskId: string, userId: string) => Promise<void> | void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
};

export function ProjectTaskItem({
  task,
  isTeamLead,
  isUpdatingTaskId,
  isUpdatingUserId,
  isRemovingTaskId,
  isRemovingUserId,
  isEditingTaskId,
  isDeletingTaskId,
  getAssigneeLabel,
  canUpdateAssigneeStatus,
  onAssignmentStatusChange,
  onAddAssignee,
  onRemoveAssignee,
  onEditTask,
  onDeleteTask,
}: ProjectTaskItemProps): React.JSX.Element {
  const [assigneeToRemoveUserId, setAssigneeToRemoveUserId] = useState<
    string | null
  >(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const assignees = Array.isArray(task.assignees) ? task.assignees : [];

  const assigneeToRemove =
    assigneeToRemoveUserId === null
      ? null
      : (assignees.find(
          (assignee) => assignee.userId === assigneeToRemoveUserId,
        ) ?? null);

  const isEditingCurrentTask = isEditingTaskId === task.id;
  const isDeletingCurrentTask = isDeletingTaskId === task.id;

  return (
    <>
      <article className="rounded-2xl border border-border/60 bg-muted/20 p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-foreground">
              {task.title}
            </h3>
            <p className="text-sm text-muted-foreground">
              {task.description ?? 'No task description provided.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div
              className={`inline-flex w-fit items-center rounded-full border px-3 py-1 text-xs font-medium ${getTaskStatusClassName(
                task.status,
              )}`}
            >
              {getTaskStatusLabel(task.status)}
            </div>

            {isTeamLead ? (
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-lg"
                  disabled={isEditingCurrentTask || isDeletingCurrentTask}
                  onClick={() => {
                    onEditTask(task);
                  }}
                >
                  <Pencil className="mr-2 h-3.5 w-3.5" />
                  {isEditingCurrentTask ? 'Editing...' : 'Edit'}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-lg border-red-500/30 text-red-300 hover:bg-red-500 hover:text-white"
                  disabled={isDeletingCurrentTask}
                  onClick={() => {
                    onDeleteTask(task);
                  }}
                >
                  <Trash2 className="mr-2 h-3.5 w-3.5" />
                  {isDeletingCurrentTask ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            {assignees.length} assignee{assignees.length === 1 ? '' : 's'}
          </p>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-fit rounded-lg px-2 text-xs text-muted-foreground hover:text-foreground"
            onClick={() => {
              setIsDetailsOpen((current) => !current);
            }}
          >
            {isDetailsOpen ? (
              <>
                <ChevronUp className="mr-1.5 h-4 w-4" />
                Hide details
              </>
            ) : (
              <>
                <ChevronDown className="mr-1.5 h-4 w-4" />
                View details
              </>
            )}
          </Button>
        </div>

        {isDetailsOpen ? (
          <div className="mt-4 space-y-4">
            {assignees.length > 0 ? (
              <div className="space-y-3">
                {assignees.map((assignee) => {
                  const isUpdatingCurrentAssignee =
                    isUpdatingTaskId === task.id &&
                    isUpdatingUserId === assignee.userId;

                  const isRemovingCurrentAssignee =
                    isRemovingTaskId === task.id &&
                    isRemovingUserId === assignee.userId;

                  return (
                    <div
                      key={assignee.userId}
                      className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-background/60 p-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-foreground">
                          {getAssigneeLabel(assignee.userId)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Current status: {getTaskStatusLabel(assignee.status)}
                        </p>
                      </div>

                      <div className="flex flex-col items-stretch gap-2 sm:items-end">
                        {canUpdateAssigneeStatus(assignee.userId) ? (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                type="button"
                                variant="outline"
                                className={`h-8 min-w-[180px] justify-between rounded-lg px-2.5 text-[11px] ${getTaskStatusClassName(
                                  assignee.status,
                                )}`}
                                disabled={
                                  isUpdatingCurrentAssignee ||
                                  isRemovingCurrentAssignee
                                }
                              >
                                <span>{getTaskStatusLabel(assignee.status)}</span>
                                <ChevronDown className="ml-2 h-3.5 w-3.5" />
                              </Button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent
                              align="end"
                              className="w-[180px]"
                            >
                              {taskStatuses.map((status) => {
                                const isCurrentStatus =
                                  status === assignee.status;

                                return (
                                  <DropdownMenuItem
                                    key={status}
                                    disabled={isCurrentStatus}
                                    onClick={() => {
                                      if (isCurrentStatus) {
                                        return;
                                      }

                                      void onAssignmentStatusChange(
                                        task.id,
                                        assignee.userId,
                                        status,
                                      );
                                    }}
                                    className="flex items-center justify-between text-xs"
                                  >
                                    <span>{getTaskStatusLabel(status)}</span>

                                    {isCurrentStatus ? (
                                      <Check className="h-3.5 w-3.5" />
                                    ) : null}
                                  </DropdownMenuItem>
                                );
                              })}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        ) : (
                          <div
                            className={`inline-flex h-8 w-fit items-center rounded-full border px-2.5 py-1 text-[11px] font-medium ${getTaskStatusClassName(
                              assignee.status,
                            )}`}
                          >
                            {getTaskStatusLabel(assignee.status)}
                          </div>
                        )}

                        {isTeamLead ? (
                          <div className="flex justify-end">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={isRemovingCurrentAssignee}
                              onClick={() => {
                                setAssigneeToRemoveUserId(assignee.userId);
                              }}
                              className="h-6 rounded-md border-border/25 px-1.5 text-[10px] text-muted-foreground/55 hover:text-foreground"
                            >
                              <UserMinus className="mr-1 h-2.5 w-2.5" />
                              {isRemovingCurrentAssignee
                                ? 'Removing...'
                                : 'Remove assignee'}
                            </Button>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border/60 bg-background/40 p-4 text-sm text-muted-foreground">
                No assignees added yet.
              </div>
            )}

            {isTeamLead ? (
              <div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    onAddAssignee(task);
                  }}
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add assignee
                </Button>
              </div>
            ) : null}
          </div>
        ) : null}
      </article>

      <AlertDialog
        open={assigneeToRemove !== null}
        onOpenChange={(open: boolean) => {
          if (!open) {
            setAssigneeToRemoveUserId(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove assignee?</AlertDialogTitle>
            <AlertDialogDescription>
              {assigneeToRemove
                ? `${getAssigneeLabel(
                    assigneeToRemove.userId,
                  )} will be removed from this task. This action cannot be undone.`
                : 'This action cannot be undone.'}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>

            <AlertDialogAction
              onClick={() => {
                if (!assigneeToRemove) {
                  return;
                }

                void onRemoveAssignee(task.id, assigneeToRemove.userId);
                setAssigneeToRemoveUserId(null);
              }}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}