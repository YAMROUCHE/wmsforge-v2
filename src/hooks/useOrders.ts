import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderApi, Order, CreateOrderRequest } from '../services/api';

// Query keys for cache management
export const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: (filters?: any) => [...orderKeys.lists(), { filters }] as const,
  details: () => [...orderKeys.all, 'detail'] as const,
  detail: (id: number) => [...orderKeys.details(), id] as const,
  stats: () => [...orderKeys.all, 'stats'] as const,
};

// Hook to fetch all orders with automatic caching
export function useOrders() {
  return useQuery({
    queryKey: orderKeys.lists(),
    queryFn: async () => {
      const response = await orderApi.getOrders();
      return response.orders;
    },
    staleTime: 30000, // Consider data fresh for 30 seconds
    refetchOnWindowFocus: true,
  });
}

// Hook to fetch a single order
export function useOrder(id: number) {
  return useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: async () => {
      const response = await orderApi.getOrder(id);
      return response.order;
    },
    enabled: !!id,
    staleTime: 60000,
  });
}

// Hook to fetch order statistics
export function useOrderStats() {
  return useQuery({
    queryKey: orderKeys.stats(),
    queryFn: async () => {
      const response = await orderApi.getStats();
      return response.stats;
    },
    staleTime: 30000,
    refetchOnWindowFocus: true,
  });
}

// Hook to create a new order
export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: orderApi.createOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: orderKeys.stats() });
    },
  });
}

// Hook to update order status with optimistic updates
export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      orderApi.updateOrderStatus(id, status),
    onMutate: async ({ id, status }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: orderKeys.lists() });

      // Snapshot previous value
      const previousOrders = queryClient.getQueryData<Order[]>(orderKeys.lists());

      // Optimistically update
      queryClient.setQueryData<Order[]>(orderKeys.lists(), (old) =>
        old?.map((order) => (order.id === id ? { ...order, status } : order))
      );

      return { previousOrders };
    },
    onError: (_err, _vars, context) => {
      // Rollback on error
      if (context?.previousOrders) {
        queryClient.setQueryData(orderKeys.lists(), context.previousOrders);
      }
    },
    onSettled: () => {
      // Refetch after mutation
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: orderKeys.stats() });
    },
  });
}

// Hook to delete an order
export function useDeleteOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: orderApi.deleteOrder,
    onMutate: async (id: number) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: orderKeys.lists() });

      // Snapshot previous value
      const previousOrders = queryClient.getQueryData<Order[]>(orderKeys.lists());

      // Optimistically remove
      queryClient.setQueryData<Order[]>(orderKeys.lists(), (old) =>
        old?.filter((order) => order.id !== id)
      );

      return { previousOrders };
    },
    onError: (_err, _vars, context) => {
      // Rollback on error
      if (context?.previousOrders) {
        queryClient.setQueryData(orderKeys.lists(), context.previousOrders);
      }
    },
    onSettled: () => {
      // Refetch after mutation
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: orderKeys.stats() });
    },
  });
}

// Hook to add an item to an order
export function useAddOrderItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      item,
    }: {
      id: number;
      item: { productId: number; quantity: number; unitPrice: number };
    }) => orderApi.addOrderItem(id, item),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: orderKeys.stats() });
    },
  });
}
