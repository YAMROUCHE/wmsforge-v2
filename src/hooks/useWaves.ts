import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { waveApi, Wave } from '../services/api';

// Query keys for cache management
export const waveKeys = {
  all: ['waves'] as const,
  lists: () => [...waveKeys.all, 'list'] as const,
  list: (filters?: any) => [...waveKeys.lists(), { filters }] as const,
  details: () => [...waveKeys.all, 'detail'] as const,
  detail: (id: number) => [...waveKeys.details(), id] as const,
};

// Hook to fetch all waves with automatic caching
export function useWaves() {
  return useQuery({
    queryKey: waveKeys.lists(),
    queryFn: async () => {
      const response = await waveApi.getWaves();
      return response.waves;
    },
    staleTime: 30000, // Consider data fresh for 30 seconds
    refetchOnWindowFocus: true,
  });
}

// Hook to fetch a single wave
export function useWave(id: number) {
  return useQuery({
    queryKey: waveKeys.detail(id),
    queryFn: async () => {
      const response = await waveApi.getWave(id);
      return response.wave;
    },
    enabled: !!id,
    staleTime: 60000,
  });
}

// Hook to update wave status with optimistic updates
export function useUpdateWaveStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      waveApi.updateWaveStatus(id, status),
    onMutate: async ({ id, status }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: waveKeys.lists() });

      // Snapshot previous value
      const previousWaves = queryClient.getQueryData<Wave[]>(waveKeys.lists());

      // Optimistically update
      queryClient.setQueryData<Wave[]>(waveKeys.lists(), (old) =>
        old?.map((wave) => (wave.id === id ? { ...wave, status } : wave))
      );

      return { previousWaves };
    },
    onError: (_err, _vars, context) => {
      // Rollback on error
      if (context?.previousWaves) {
        queryClient.setQueryData(waveKeys.lists(), context.previousWaves);
      }
    },
    onSettled: () => {
      // Refetch after mutation
      queryClient.invalidateQueries({ queryKey: waveKeys.lists() });
    },
  });
}

// Hook to create a wave
export function useCreateWave() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: waveApi.createWave,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: waveKeys.lists() });
    },
  });
}
