import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { locationApi, Location, CreateLocationRequest } from '../services/api';

// Query keys for cache management
export const locationKeys = {
  all: ['locations'] as const,
  lists: () => [...locationKeys.all, 'list'] as const,
  list: (filters?: any) => [...locationKeys.lists(), { filters }] as const,
  details: () => [...locationKeys.all, 'detail'] as const,
  detail: (id: number) => [...locationKeys.details(), id] as const,
  stats: () => [...locationKeys.all, 'stats'] as const,
};

// Hook to fetch all locations with automatic caching
export function useLocations() {
  return useQuery({
    queryKey: locationKeys.lists(),
    queryFn: async () => {
      const response = await locationApi.getLocations();
      return response.locations;
    },
    staleTime: 30000, // Consider data fresh for 30 seconds
    refetchOnWindowFocus: true,
  });
}

// Hook to fetch a single location
export function useLocation(id: number) {
  return useQuery({
    queryKey: locationKeys.detail(id),
    queryFn: async () => {
      const response = await locationApi.getLocation(id);
      return response.location;
    },
    enabled: !!id,
    staleTime: 60000,
  });
}

// Hook to fetch location statistics
export function useLocationStats() {
  return useQuery({
    queryKey: locationKeys.stats(),
    queryFn: async () => {
      const response = await locationApi.getStats();
      return response.stats;
    },
    staleTime: 30000,
    refetchOnWindowFocus: true,
  });
}

// Hook to create a new location
export function useCreateLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: locationApi.createLocation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: locationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: locationKeys.stats() });
    },
  });
}

// Hook to update a location
export function useUpdateLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CreateLocationRequest }) =>
      locationApi.updateLocation(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: locationKeys.lists() });

      // Snapshot previous value
      const previousLocations = queryClient.getQueryData<Location[]>(locationKeys.lists());

      // Optimistically update
      queryClient.setQueryData<Location[]>(locationKeys.lists(), (old) =>
        old?.map((location) =>
          location.id === id
            ? { ...location, ...data, code: data.code, name: data.name, type: data.type }
            : location
        )
      );

      return { previousLocations };
    },
    onError: (_err, _vars, context) => {
      // Rollback on error
      if (context?.previousLocations) {
        queryClient.setQueryData(locationKeys.lists(), context.previousLocations);
      }
    },
    onSettled: () => {
      // Refetch after mutation
      queryClient.invalidateQueries({ queryKey: locationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: locationKeys.stats() });
    },
  });
}

// Hook to delete a location
export function useDeleteLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: locationApi.deleteLocation,
    onMutate: async (id: number) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: locationKeys.lists() });

      // Snapshot previous value
      const previousLocations = queryClient.getQueryData<Location[]>(locationKeys.lists());

      // Optimistically remove
      queryClient.setQueryData<Location[]>(locationKeys.lists(), (old) =>
        old?.filter((location) => location.id !== id)
      );

      return { previousLocations };
    },
    onError: (_err, _vars, context) => {
      // Rollback on error
      if (context?.previousLocations) {
        queryClient.setQueryData(locationKeys.lists(), context.previousLocations);
      }
    },
    onSettled: () => {
      // Refetch after mutation
      queryClient.invalidateQueries({ queryKey: locationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: locationKeys.stats() });
    },
  });
}
