"use client";

import Link from "next/link";
import { ArrowLeft, Check, ChevronDown, Plus, UserPlus } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { AddProjectMemberDialog } from "@/features/projects/components/add-project-member-dialog";
import { useAddProjectMember } from "@/features/projects/hooks/use-add-project-member";
import { useProjectById } from "@/features/projects/hooks/use-project-by-id";
import { useProjectMembers } from "@/features/projects/hooks/use-project-members";
import { useProjectTasks } from "@/features/projects/hooks/use-project-tasks";
import {
  getTaskStatusClassName,
  getTaskStatusLabel,
} from "@/features/projects/lib/task-status";
import { AddTaskAssigneeDialog } from "@/features/tasks/components/add-task-assignee-dialog";
import { CreateTaskDialog } from "@/features/tasks/components/create-task-dialog";
import { useAddTaskAssignee } from "@/features/tasks/hooks/use-add-task-assignee";
import { useCreateTask } from "@/features/tasks/hooks/use-create-task";
import { useUpdateTaskAssigneeStatus } from "@/features/tasks/hooks/use-update-task-assignee-status";
import type { CreateTaskFormValues } from "@/features/tasks/schema/create-task.schema";
import { useUsers } from "@/features/users/hooks/use-users";
import { getSocket } from "@/lib/socket/socket-client";
import {
  socketClientEvents,
  socketServerEvents,
} from "@/lib/socket/socket-events";
import { formatDateTime } from "@/lib/utils/format-date";
import {
  taskStatuses,
  type Task,
  type TaskAssignee,
  type TaskStatus,
} from "@/types/task";

export default function ProjectDetailPage(): React.JSX.Element {
  const params = useParams<{ id: string }>();
  const projectId = params.id;
  const queryClient = useQueryClient();

  const { user, accessToken, isAuthenticated } = useAuth();
  const isTeamLead = user?.role === "TEAM_LEAD";

  const [isCreateTaskDialogOpen, setIsCreateTaskDialogOpen] = useState(false);
  const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState(false);
  const [selectedTaskForAssignee, setSelectedTaskForAssignee] =
    useState<Task | null>(null);

  const projectQuery = useProjectById(projectId);
  const tasksQuery = useProjectTasks(projectId);
  const membersQuery = useProjectMembers(projectId, {
  enabled: isTeamLead,
});
const usersQuery = useUsers({
  enabled: isTeamLead,
});

  const createTaskMutation = useCreateTask(projectId);
  const addTaskAssigneeMutation = useAddTaskAssignee();
  const addProjectMemberMutation = useAddProjectMember();
  const updateTaskAssigneeStatusMutation = useUpdateTaskAssigneeStatus();

  const project = projectQuery.data;
  const tasks = tasksQuery.data ?? [];
  const members = membersQuery.data?.data ?? [];
  const users = usersQuery.data ?? [];

  const memberNameMap = useMemo(() => {
    return new Map(
      members.map((member) => {
        const fullName = member.user
          ? `${member.user.firstName} ${member.user.lastName}`.trim()
          : `User ${member.userId.slice(0, 8)}`;

        return [member.userId, fullName];
      }),
    );
  }, [members]);

  useEffect(() => {
    if (!projectId || !accessToken || !user || !isAuthenticated) {
      return;
    }

    const socket = getSocket();

    if (!socket) {
      return;
    }

    const handleConnect = (): void => {
      socket.emit(socketClientEvents.projectJoin, {
        projectId,
      });
    };

    const handleTaskAssignmentStatusChanged = (event: {
      projectId: string;
      taskId: string;
      assigneeUserId: string;
      oldStatus: TaskStatus;
      newStatus: TaskStatus;
      changedBy: string;
      summaryStatus: TaskStatus;
      occurredAt: string;
    }): void => {
      if (event.projectId !== projectId) {
        return;
      }

      void queryClient.invalidateQueries({
        queryKey: ["project", projectId, "tasks"],
      });
    };

    socket.on("connect", handleConnect);
    socket.on(
      socketServerEvents.taskAssignmentStatusChanged,
      handleTaskAssignmentStatusChanged,
    );

    if (socket.connected) {
      socket.emit(socketClientEvents.projectJoin, {
        projectId,
      });
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off(
        socketServerEvents.taskAssignmentStatusChanged,
        handleTaskAssignmentStatusChanged,
      );

      if (socket.connected) {
        socket.emit(socketClientEvents.projectLeave, {
          projectId,
        });
      }
    };
  }, [accessToken, isAuthenticated, projectId, queryClient, user]);

  const handleCreateTask = async (
    values: CreateTaskFormValues,
  ): Promise<void> => {
    if (!project) {
      return;
    }

    if (project.isArchived) {
      toast.error("You cannot create tasks in an archived project.");
      return;
    }

    try {
      await createTaskMutation.mutateAsync(values);
      setIsCreateTaskDialogOpen(false);
    } catch {
      // Error toast is already handled in mutation.
    }
  };

  const handleAddTaskAssignee = async (userId: string): Promise<void> => {
    if (!selectedTaskForAssignee) {
      return;
    }

    await addTaskAssigneeMutation.mutateAsync({
      projectId,
      taskId: selectedTaskForAssignee.id,
      userId,
    });

    setSelectedTaskForAssignee(null);
  };

  const handleAddProjectMember = async (userId: string): Promise<void> => {
    await addProjectMemberMutation.mutateAsync({
      projectId,
      userId,
    });

    setIsAddMemberDialogOpen(false);
  };

  const handleAssignmentStatusChange = async (
    taskId: string,
    userId: string,
    status: TaskStatus,
  ): Promise<void> => {
    await updateTaskAssigneeStatusMutation.mutateAsync({
      projectId,
      taskId,
      userId,
      status,
    });
  };

  const getAssigneeLabel = (assignee: TaskAssignee): string => {
    if (assignee.userId === user?.id) {
      return "You";
    }

    const memberName = memberNameMap.get(assignee.userId);

    if (memberName) {
      return memberName;
    }

    return `User ${assignee.userId.slice(0, 8)}`;
  };

  const canUpdateAssigneeStatus = (assigneeUserId: string): boolean => {
    if (!user) {
      return false;
    }

    if (isTeamLead) {
      return true;
    }

    return user.id === assigneeUserId;
  };

  if (
    projectQuery.isLoading ||
    tasksQuery.isLoading ||
    (isTeamLead && membersQuery.isLoading) ||
    (isTeamLead && usersQuery.isLoading)
  ) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded-xl bg-muted" />
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="h-48 animate-pulse rounded-3xl bg-muted lg:col-span-1" />
          <div className="h-96 animate-pulse rounded-3xl bg-muted lg:col-span-2" />
        </div>
      </div>
    );
  }

  if (projectQuery.isError) {
    return (
      <div className="rounded-3xl border border-destructive/20 bg-destructive/5 p-6 text-sm text-destructive">
        Failed to load project details.
      </div>
    );
  }

  if (tasksQuery.isError) {
    return (
      <div className="rounded-3xl border border-destructive/20 bg-destructive/5 p-6 text-sm text-destructive">
        Failed to load project tasks.
      </div>
    );
  }

  if (isTeamLead && membersQuery.isError) {
    return (
      <div className="rounded-3xl border border-destructive/20 bg-destructive/5 p-6 text-sm text-destructive">
        Failed to load project members.
      </div>
    );
  }

  if (isTeamLead && usersQuery.isError) {
    return (
      <div className="rounded-3xl border border-destructive/20 bg-destructive/5 p-6 text-sm text-destructive">
        Failed to load users.
      </div>
    );
  }

  if (!project) {
    return (
      <div className="rounded-3xl border border-border/60 bg-card/95 p-6 text-sm text-muted-foreground shadow-sm">
        Project not found.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/95 px-3 py-2 text-sm text-muted-foreground transition hover:bg-accent hover:text-accent-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to projects
        </Link>
      </div>

      <section className="rounded-3xl border border-border/60 bg-card/95 p-6 shadow-sm">
        <div className="space-y-3">
          <div className="inline-flex items-center rounded-full border border-border/60 bg-muted/60 px-3 py-1 text-xs font-medium text-muted-foreground">
            Project Detail
          </div>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                {project.name}
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                {project.description ?? "No project description provided."}
              </p>
            </div>

            {isTeamLead ? (
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsAddMemberDialogOpen(true);
                  }}
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add Member
                </Button>

                <Button
                  onClick={() => {
                    setIsCreateTaskDialogOpen(true);
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Task
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-3xl border border-border/60 bg-card/95 p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-foreground">
            Project Info
          </h2>

          <dl className="mt-5 space-y-4">
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                Created At
              </dt>
              <dd className="mt-1 text-sm text-foreground">
                {formatDateTime(project.createdAt)}
              </dd>
            </div>

            <div>
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                Updated At
              </dt>
              <dd className="mt-1 text-sm text-foreground">
                {formatDateTime(project.updatedAt)}
              </dd>
            </div>

            <div>
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                Archived
              </dt>
              <dd className="mt-1 text-sm text-foreground">
                {project.isArchived ? "Yes" : "No"}
              </dd>
            </div>

            {isTeamLead ? (
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                  Members
                </dt>
                <dd className="mt-1 text-sm text-foreground">
                  {members.length}
                </dd>
              </div>
            ) : null}
          </dl>
        </div>

        <div className="rounded-3xl border border-border/60 bg-card/95 p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Tasks</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {tasks.length} task{tasks.length === 1 ? "" : "s"} in this
                project
              </p>
            </div>
          </div>

          {tasks.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-border/60 bg-muted/20 p-6 text-sm text-muted-foreground">
              No tasks found for this project.
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              {tasks.map((task) => {
                const assignees = Array.isArray(task.assignees)
                  ? task.assignees
                  : [];

                return (
                  <article
                    key={task.id}
                    className="rounded-2xl border border-border/60 bg-muted/20 p-4"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div className="space-y-1">
                        <h3 className="text-sm font-semibold text-foreground">
                          {task.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {task.description ?? "No task description provided."}
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
                      {assignees.length} assignee
                      {assignees.length === 1 ? "" : "s"}
                    </div>

                    {assignees.length > 0 ? (
                      <div className="mt-4 space-y-3">
                        {assignees.map((assignee) => {
                          const isUpdatingCurrentAssignee =
                            updateTaskAssigneeStatusMutation.isPending &&
                            updateTaskAssigneeStatusMutation.variables
                              ?.taskId === task.id &&
                            updateTaskAssigneeStatusMutation.variables
                              ?.userId === assignee.userId;

                          return (
                            <div
                              key={assignee.userId}
                              className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-background/60 p-3 sm:flex-row sm:items-center sm:justify-between"
                            >
                              <div className="space-y-1">
                                <p className="text-sm font-medium text-foreground">
                                  {getAssigneeLabel(assignee)}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Current status:{" "}
                                  {getTaskStatusLabel(assignee.status)}
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
                                      <span>
                                        {getTaskStatusLabel(assignee.status)}
                                      </span>
                                      <ChevronDown className="ml-2 h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>

                                  <DropdownMenuContent
                                    align="end"
                                    className="w-[220px]"
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

                                            void handleAssignmentStatusChange(
                                              task.id,
                                              assignee.userId,
                                              status,
                                            );
                                          }}
                                          className="flex items-center justify-between"
                                        >
                                          <span>
                                            {getTaskStatusLabel(status)}
                                          </span>

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
                            setSelectedTaskForAssignee(task);
                          }}
                        >
                          <UserPlus className="mr-2 h-4 w-4" />
                          Add assignee
                        </Button>
                      </div>
                    ) : null}
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <CreateTaskDialog
        open={isCreateTaskDialogOpen}
        onOpenChange={setIsCreateTaskDialogOpen}
        onSubmit={handleCreateTask}
        isSubmitting={createTaskMutation.isPending}
      />

      <AddProjectMemberDialog
        open={isAddMemberDialogOpen}
        onOpenChange={setIsAddMemberDialogOpen}
        users={users}
        members={members}
        onSubmit={handleAddProjectMember}
        isSubmitting={addProjectMemberMutation.isPending}
      />

      <AddTaskAssigneeDialog
        open={selectedTaskForAssignee !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedTaskForAssignee(null);
          }
        }}
        task={
          selectedTaskForAssignee ?? {
            id: "",
            projectId,
            title: "",
            description: null,
            status: "PENDING",
            createdAt: "",
            updatedAt: "",
            assignees: [],
          }
        }
        members={members}
        onSubmit={handleAddTaskAssignee}
        isSubmitting={addTaskAssigneeMutation.isPending}
      />
    </div>
  );
}