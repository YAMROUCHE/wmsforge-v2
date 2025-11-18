import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { laborApi } from '../services/api';

// Query keys
export const laborKeys = {
  all: ['labor'] as const,
  operators: () => [...laborKeys.all, 'operators'] as const,
  performance: (date?: string) => [...laborKeys.all, 'performance', { date }] as const,
  leaderboard: (date?: string) => [...laborKeys.all, 'leaderboard', { date }] as const,
  teamStats: (date?: string) => [...laborKeys.all, 'team-stats', { date }] as const,
  badges: () => [...laborKeys.all, 'badges'] as const,
};

// Hook to fetch operators
export function useOperators() {
  return useQuery({
    queryKey: laborKeys.operators(),
    queryFn: async () => {
      const response = await laborApi.getOperators();
      return response.operators;
    },
    staleTime: 60000, // Operators don't change often
  });
}

// Hook to fetch performance data
export function usePerformance(date?: string) {
  return useQuery({
    queryKey: laborKeys.performance(date),
    queryFn: async () => {
      const response = await laborApi.getPerformance(date);
      return response.performances;
    },
    staleTime: 30000,
    refetchInterval: 60000, // Auto-refresh every minute
  });
}

// Hook to fetch leaderboard
export function useLeaderboard(date?: string) {
  return useQuery({
    queryKey: laborKeys.leaderboard(date),
    queryFn: async () => {
      const response = await laborApi.getLeaderboard(date);
      return response.leaderboard;
    },
    staleTime: 20000,
    refetchInterval: 30000, // More frequent refresh for leaderboard
  });
}

// Hook to fetch team stats
export function useTeamStats(date?: string) {
  return useQuery({
    queryKey: laborKeys.teamStats(date),
    queryFn: async () => {
      const response = await laborApi.getTeamStats(date);
      return response.stats;
    },
    staleTime: 30000,
    refetchInterval: 60000,
  });
}

// Hook to fetch badges
export function useBadges() {
  return useQuery({
    queryKey: laborKeys.badges(),
    queryFn: async () => {
      const response = await laborApi.getBadges();
      return response.badges;
    },
    staleTime: 300000, // Badges rarely change
  });
}

// Hook to save performance
export function useSavePerformance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: laborApi.savePerformance,
    onSuccess: (_, variables) => {
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: laborKeys.performance(variables.date) });
      queryClient.invalidateQueries({ queryKey: laborKeys.leaderboard(variables.date) });
      queryClient.invalidateQueries({ queryKey: laborKeys.teamStats(variables.date) });
    },
  });
}
