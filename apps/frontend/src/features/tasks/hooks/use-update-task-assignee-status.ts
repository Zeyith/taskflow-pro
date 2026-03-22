import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { updateTaskAssigneeStatusRequest } from '@/features/tasks/api/update-task-assignee-status';

type UpdateTaskAssigneeStatusInput = {
  projectId: string;
  taskId: string;
  userId: string;
  status: import('@/types/task').TaskStatus;
};

export function useUpdateTaskAssigneeStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateTaskAssigneeStatusRequest,
    onSuccess: async (_, variables: UpdateTaskAssigneeStatusInput) => {
      await queryClient.invalidateQueries({
        queryKey: ['project', variables.projectId, 'tasks'],
      });

      toast.success('Task status updated successfully.');
    },
    onError: () => {
      toast.error('Failed to update task status.');
    },
  });
}