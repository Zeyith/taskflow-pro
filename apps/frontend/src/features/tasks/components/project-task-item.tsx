'use client';

import { Check, ChevronDown, UserPlus } from 'lucide-react';

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
import {
  taskStatuses,
  type Task,
  type TaskStatus,
} from '@/types/task';

type ProjectTaskItemProps = {
  task: Task;
  isTeamLead: boolean;
  isUpdatingTaskId?: string;
  isUpdatingUserId?: string;
  getAssigneeLabel: (assigneeUserId: string) => string;
  canUpdateAssigneeStatus: (assigneeUserId: string) => boolean;
  onAssignmentStatusChange: (
    taskId: string,
    userId: string,
    status: TaskStatus,
  ) => Promise<void> | void;
  onAddAssignee: (task: Task) => void;
};

export function ProjectTaskItem({
  task,
  isTeamLead,
  isUpdatingTaskId,
  isUpdatingUserId,
  getAssigneeLabel,
  canUpdateAssigneeStatus,
  onAssignmentStatusChange,
  onAddAssignee,
}: ProjectTaskItemProps): React.JSX.Element {
  const assignees = Array.isArray(task.assignees) ? task.assignees : [];

  return (
    <article className="rounded-2xl border border-border/60 bg-muted/20 p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-foreground">{task.title}</h3>
          <p className="text-sm text-muted-foreground">
            {task.description ?? 'No task description provided.'}
          </p>
        </div>

        <div
          className={`inline-flex w-fit items-center rounded-full border px-3 py-1 text-xs font-medium ${getTaskStatusClassName(
            task.status,
          )}`}
        >
          {getTaskStatusLabel(task.status)}
        </div>
      </div>

      <div className="mt-4 text-xs text-muted-foreground">
        {assignees.length} assignee{assignees.length === 1 ? '' : 's'}
      </div>

      {assignees.length > 0 ? (
        <div className="mt-4 space-y-3">
          {assignees.map((assignee) => {
            const isUpdatingCurrentAssignee =
              isUpdatingTaskId === task.id && isUpdatingUserId === assignee.userId;

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

                {canUpdateAssigneeStatus(assignee.userId) ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className={`min-w-[220px] justify-between rounded-xl ${getTaskStatusClassName(
                          assignee.status,
                        )}`}
                        disabled={isUpdatingCurrentAssignee}
                      >
                        <span>{getTaskStatusLabel(assignee.status)}</span>
                        <ChevronDown className="ml-2 h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end" className="w-[220px]">
                      {taskStatuses.map((status) => {
                        const isCurrentStatus = status === assignee.status;

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
                            className="flex items-center justify-between"
                          >
                            <span>{getTaskStatusLabel(status)}</span>

                            {isCurrentStatus ? (
                              <Check className="h-4 w-4" />
                            ) : null}
                          </DropdownMenuItem>
                        );
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <div
                    className={`inline-flex w-fit items-center rounded-full border px-3 py-1 text-xs font-medium ${getTaskStatusClassName(
                      assignee.status,
                    )}`}
                  >
                    {getTaskStatusLabel(assignee.status)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : null}

      {isTeamLead ? (
        <div className="mt-4">
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
    </article>
  );
}