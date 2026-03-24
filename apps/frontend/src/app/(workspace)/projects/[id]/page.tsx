'use client';

import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { queryKeys } from '@/constants/query-keys';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { AddProjectMemberDialog } from '@/features/projects/components/add-project-member-dialog';
import { EditProjectDialog } from '@/features/projects/components/edit-project-dialog';
import { ProjectDetailHeader } from '@/features/projects/components/project-detail-header';
import { ProjectInfoCard } from '@/features/projects/components/project-info-card';
import { ProjectMembersCard } from '@/features/projects/components/project-members-card';
import { useAddProjectMember } from '@/features/projects/hooks/use-add-project-member';
import { useArchiveProject } from '@/features/projects/hooks/use-archive-project';
import { useDeleteProject } from '@/features/projects/hooks/use-delete-project';
import { useProjectById } from '@/features/projects/hooks/use-project-by-id';
import { useProjectMembers } from '@/features/projects/hooks/use-project-members';
import { useProjectTasks } from '@/features/projects/hooks/use-project-tasks';
import { useRemoveProjectMember } from '@/features/projects/hooks/use-remove-project-member';
import { useUpdateProject } from '@/features/projects/hooks/use-update-project';
import type { UpdateProjectFormValues } from '@/features/projects/schemas/update-project.schema';
import { AddTaskAssigneeDialog } from '@/features/tasks/components/add-task-assignee-dialog';
import { CreateTaskDialog } from '@/features/tasks/components/create-task-dialog';
import { DeleteTaskDialog } from '@/features/tasks/components/delete-task-dialog';
import { EditTaskDialog } from '@/features/tasks/components/edit-task-dialog';
import { ProjectTasksCard } from '@/features/tasks/components/project-tasks-card';
import { useAddTaskAssignee } from '@/features/tasks/hooks/use-add-task-assignee';
import { useCreateTask } from '@/features/tasks/hooks/use-create-task';
import { useDeleteTask } from '@/features/tasks/hooks/use-delete-task';
import { useRemoveTaskAssignee } from '@/features/tasks/hooks/use-remove-task-assignee';
import { useUpdateTask } from '@/features/tasks/hooks/use-update-task';
import { useUpdateTaskAssigneeStatus } from '@/features/tasks/hooks/use-update-task-assignee-status';
import type { CreateTaskFormValues } from '@/features/tasks/schema/create-task.schema';
import type { UpdateTaskFormValues } from '@/features/tasks/schema/update-task.schema';
import { useUsers } from '@/features/users/hooks/use-users';
import { getSocket } from '@/lib/socket/socket-client';
import {
  socketClientEvents,
  socketServerEvents,
} from '@/lib/socket/socket-events';
import type { ProjectMember } from '@/types/project-member';
import type { Task, TaskStatus } from '@/types/task';

export default function ProjectDetailPage(): React.JSX.Element {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const projectId = params.id;
  const queryClient = useQueryClient();

  const { user, accessToken, isAuthenticated } = useAuth();
  const isTeamLead = user?.role === 'TEAM_LEAD';

  const [isCreateTaskDialogOpen, setIsCreateTaskDialogOpen] = useState(false);
  const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState(false);
  const [isEditProjectDialogOpen, setIsEditProjectDialogOpen] = useState(false);
  const [selectedTaskForAssignee, setSelectedTaskForAssignee] =
    useState<Task | null>(null);
  const [selectedTaskForEdit, setSelectedTaskForEdit] = useState<Task | null>(
    null,
  );
  const [selectedTaskForDelete, setSelectedTaskForDelete] =
    useState<Task | null>(null);

  const projectQuery = useProjectById(projectId);
  const tasksQuery = useProjectTasks(projectId);
  const membersQuery = useProjectMembers(projectId, {
    enabled: isAuthenticated && projectId.length > 0,
  });
  const usersQuery = useUsers({
    enabled: isTeamLead,
  });

  const createTaskMutation = useCreateTask(projectId);
  const addTaskAssigneeMutation = useAddTaskAssignee();
  const addProjectMemberMutation = useAddProjectMember();
  const removeProjectMemberMutation = useRemoveProjectMember();
  const removeTaskAssigneeMutation = useRemoveTaskAssignee();
  const updateTaskAssigneeStatusMutation = useUpdateTaskAssigneeStatus();
  const updateTaskMutation = useUpdateTask(projectId);
  const deleteTaskMutation = useDeleteTask(projectId);
  const updateProjectMutation = useUpdateProject();
  const archiveProjectMutation = useArchiveProject();
  const deleteProjectMutation = useDeleteProject();

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

        return [member.userId, fullName] as const;
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
        queryKey: queryKeys.projects.tasks(projectId),
      });

      void queryClient.invalidateQueries({
        queryKey: queryKeys.dashboard.summary,
      });
    };

    socket.on('connect', handleConnect);
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
      socket.off('connect', handleConnect);
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
      toast.error('You cannot create tasks in an archived project.');
      return;
    }

    try {
      await createTaskMutation.mutateAsync(values);
      setIsCreateTaskDialogOpen(false);
    } catch {
      // Error toast is already handled in mutation.
    }
  };

  const handleEditProject = async (
    values: UpdateProjectFormValues,
  ): Promise<void> => {
    if (!project) {
      return;
    }

    try {
      await updateProjectMutation.mutateAsync({
        projectId: project.id,
        name: values.name,
        description: values.description?.trim()
          ? values.description.trim()
          : null,
      });

      setIsEditProjectDialogOpen(false);
    } catch {
      // Error toast is already handled in mutation.
    }
  };

    const handleEditTask = async (
    values: UpdateTaskFormValues,
  ): Promise<void> => {
    if (!selectedTaskForEdit) {
      return;
    }

    try {
      await updateTaskMutation.mutateAsync({
        taskId: selectedTaskForEdit.id,
        values,
      });

      toast.success('Task updated successfully.');
      setSelectedTaskForEdit(null);
    } catch (error) {
      console.error('Failed to update task:', error);
      toast.error('Failed to update task.');
    }
  };

  const handleDeleteTask = async (): Promise<void> => {
    if (!selectedTaskForDelete) {
      return;
    }

    try {
      await deleteTaskMutation.mutateAsync({
        taskId: selectedTaskForDelete.id,
      });

      toast.success('Task deleted successfully.');
      setSelectedTaskForDelete(null);
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

  const handleRemoveProjectMember = async (
    member: ProjectMember,
  ): Promise<void> => {
    await removeProjectMemberMutation.mutateAsync({
      projectId,
      userId: member.userId,
    });
  };

  const handleRemoveTaskAssignee = async (
    taskId: string,
    userId: string,
  ): Promise<void> => {
    await removeTaskAssigneeMutation.mutateAsync({
      projectId,
      taskId,
      userId,
    });
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

  const handleArchiveProject = async (): Promise<void> => {
    if (!project) {
      return;
    }

    try {
      await archiveProjectMutation.mutateAsync(project.id);
    } catch {
      // Error toast is already handled in mutation.
    }
  };

  const handleDeleteProject = async (): Promise<void> => {
    if (!project) {
      return;
    }

    if (!project.isArchived) {
      toast.error('Only archived projects can be deleted.');
      return;
    }

    try {
      await deleteProjectMutation.mutateAsync(project.id);
      router.push('/projects');
    } catch {
      // Error toast is already handled in mutation.
    }
  };

  const getAssigneeLabel = (assigneeUserId: string): string => {
    if (assigneeUserId === user?.id) {
      return 'You';
    }

    const memberName = memberNameMap.get(assigneeUserId);

    if (memberName) {
      return memberName;
    }

    return `User ${assigneeUserId.slice(0, 8)}`;
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
    membersQuery.isLoading ||
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

  if (membersQuery.isError) {
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

      <ProjectDetailHeader
        project={project}
        isTeamLead={isTeamLead}
        onAddMember={() => {
          setIsAddMemberDialogOpen(true);
        }}
        onCreateTask={() => {
          setIsCreateTaskDialogOpen(true);
        }}
        onEditProject={() => {
          setIsEditProjectDialogOpen(true);
        }}
        onArchiveProject={handleArchiveProject}
        onDeleteProject={handleDeleteProject}
        isArchiving={archiveProjectMutation.isPending}
        isDeleting={deleteProjectMutation.isPending}
      />

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6">
          <ProjectInfoCard
            project={project}
            isTeamLead={isTeamLead}
            memberCount={members.length}
          />

          {isTeamLead ? (
            <ProjectMembersCard
              members={members}
              canRemoveMembers={isTeamLead}
              isRemovingMemberId={
                removeProjectMemberMutation.isPending
                  ? removeProjectMemberMutation.variables?.userId
                  : undefined
              }
              onRemoveMember={handleRemoveProjectMember}
            />
          ) : null}
        </div>

        <ProjectTasksCard
          tasks={tasks}
          isTeamLead={isTeamLead}
          isUpdatingTaskId={
            updateTaskAssigneeStatusMutation.isPending
              ? updateTaskAssigneeStatusMutation.variables?.taskId
              : undefined
          }
          isUpdatingUserId={
            updateTaskAssigneeStatusMutation.isPending
              ? updateTaskAssigneeStatusMutation.variables?.userId
              : undefined
          }
          isRemovingTaskId={
            removeTaskAssigneeMutation.isPending
              ? removeTaskAssigneeMutation.variables?.taskId
              : undefined
          }
          isRemovingUserId={
            removeTaskAssigneeMutation.isPending
              ? removeTaskAssigneeMutation.variables?.userId
              : undefined
          }
          isEditingTaskId={
            updateTaskMutation.isPending
              ? updateTaskMutation.variables?.taskId
              : undefined
          }
          isDeletingTaskId={
            deleteTaskMutation.isPending
              ? deleteTaskMutation.variables?.taskId
              : undefined
          }
          getAssigneeLabel={getAssigneeLabel}
          canUpdateAssigneeStatus={canUpdateAssigneeStatus}
          onAssignmentStatusChange={handleAssignmentStatusChange}
          onAddAssignee={(task) => {
            setSelectedTaskForAssignee(task);
          }}
          onRemoveAssignee={handleRemoveTaskAssignee}
          onEditTask={(task) => {
            setSelectedTaskForEdit(task);
          }}
          onDeleteTask={(task) => {
            setSelectedTaskForDelete(task);
          }}
        />
      </section>

      <CreateTaskDialog
        open={isCreateTaskDialogOpen}
        onOpenChange={setIsCreateTaskDialogOpen}
        onSubmit={handleCreateTask}
        isSubmitting={createTaskMutation.isPending}
      />

      {project ? (
        <EditProjectDialog
          open={isEditProjectDialogOpen}
          onOpenChange={setIsEditProjectDialogOpen}
          project={project}
          onSubmit={handleEditProject}
          isSubmitting={updateProjectMutation.isPending}
        />
      ) : null}

      <EditTaskDialog
        open={selectedTaskForEdit !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedTaskForEdit(null);
          }
        }}
        task={selectedTaskForEdit}
        onSubmit={handleEditTask}
        isSubmitting={updateTaskMutation.isPending}
      />

      <DeleteTaskDialog
        open={selectedTaskForDelete !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedTaskForDelete(null);
          }
        }}
        task={selectedTaskForDelete}
        onConfirm={handleDeleteTask}
        isSubmitting={deleteTaskMutation.isPending}
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
            id: '',
            projectId,
            title: '',
            description: null,
            status: 'PENDING',
            createdAt: '',
            updatedAt: '',
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