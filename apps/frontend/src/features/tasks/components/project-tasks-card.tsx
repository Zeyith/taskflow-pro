'use client';

import { ProjectTaskItem } from '@/features/tasks/components/project-task-item';
import type { Task, TaskStatus } from '@/types/task';

type ProjectTasksCardProps = {
  tasks: Task[];
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

export function ProjectTasksCard({
  tasks,
  isTeamLead,
  isUpdatingTaskId,
  isUpdatingUserId,
  getAssigneeLabel,
  canUpdateAssigneeStatus,
  onAssignmentStatusChange,
  onAddAssignee,
}: ProjectTasksCardProps): React.JSX.Element {
  return (
    <div className="rounded-3xl border border-border/60 bg-card/95 p-6 shadow-sm lg:col-span-2">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Tasks</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {tasks.length} task{tasks.length === 1 ? '' : 's'} in this project
          </p>
        </div>
      </div>

      {tasks.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-border/60 bg-muted/20 p-6 text-sm text-muted-foreground">
          No tasks found for this project.
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {tasks.map((task) => (
            <ProjectTaskItem
              key={task.id}
              task={task}
              isTeamLead={isTeamLead}
              isUpdatingTaskId={isUpdatingTaskId}
              isUpdatingUserId={isUpdatingUserId}
              getAssigneeLabel={getAssigneeLabel}
              canUpdateAssigneeStatus={canUpdateAssigneeStatus}
              onAssignmentStatusChange={onAssignmentStatusChange}
              onAddAssignee={onAddAssignee}
            />
          ))}
        </div>
      )}
    </div>
  );
}