import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskApi, Task } from '../services/api';

// Query keys
export const taskKeys = {
  all: ['tasks'] as const,
  lists: () => [...taskKeys.all, 'list'] as const,
  list: (filters?: any) => [...taskKeys.lists(), { filters }] as const,
  metrics: () => [...taskKeys.all, 'metrics'] as const,
};

// Hook to fetch tasks with optional filters
export function useTasks(filters?: { status?: string; operatorId?: number }) {
  return useQuery({
    queryKey: taskKeys.list(filters),
    queryFn: async () => {
      const response = await taskApi.getTasks(filters);
      return response.tasks;
    },
    staleTime: 20000,
    refetchOnWindowFocus: true,
  });
}

// Hook to fetch task metrics
export function useTaskMetrics() {
  return useQuery({
    queryKey: taskKeys.metrics(),
    queryFn: async () => {
      const response = await taskApi.getMetrics();
      return response.metrics;
    },
    staleTime: 30000,
    refetchInterval: 60000, // Auto-refresh every minute
  });
}

// Hook to update task status
export function useUpdateTaskStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      status,
      actualTimeSeconds,
    }: {
      id: number;
      status: string;
      actualTimeSeconds?: number;
    }) => taskApi.updateTaskStatus(id, status, actualTimeSeconds),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.lists() });

      const previousTasks = queryClient.getQueryData<Task[]>(taskKeys.lists());

      queryClient.setQueriesData<Task[]>({ queryKey: taskKeys.lists() }, (old) =>
        old?.map((task) => (task.id === id ? { ...task, status } : task))
      );

      return { previousTasks };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(taskKeys.lists(), context.previousTasks);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      queryClient.invalidateQueries({ queryKey: taskKeys.metrics() });
    },
  });
}

// Hook to create tasks
export function useCreateTasks() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: taskApi.createTasks,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      queryClient.invalidateQueries({ queryKey: taskKeys.metrics() });
    },
  });
}
