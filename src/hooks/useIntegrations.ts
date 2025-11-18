import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787';

export interface Integration {
  id: number;
  name: string;
  type: 'ecommerce' | 'crm' | 'erp' | 'shipping' | 'custom';
  status: 'active' | 'inactive' | 'error' | 'pending';
  last_sync_at?: string;
  last_error?: string;
  created_at: string;
}

export interface IntegrationLog {
  id: number;
  integration_id: number;
  action: string;
  status: 'success' | 'error' | 'pending';
  entity_type?: string;
  entity_count: number;
  details?: string;
  duration_ms: number;
  created_at: string;
}

// Hook pour récupérer toutes les intégrations
export function useIntegrations() {
  return useQuery({
    queryKey: ['integrations'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/api/integrations`);
      if (!response.ok) throw new Error('Failed to fetch integrations');
      return response.json();
    },
    staleTime: 30000,
  });
}

// Hook pour configurer Shopify
export function useSetupShopify() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { shop_domain: string; access_token: string }) => {
      const response = await fetch(`${API_BASE_URL}/api/integrations/shopify/setup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to setup Shopify');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
    },
  });
}

// Hook pour configurer WooCommerce
export function useSetupWooCommerce() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { store_url: string; consumer_key: string; consumer_secret: string }) => {
      const response = await fetch(`${API_BASE_URL}/api/integrations/woocommerce/setup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to setup WooCommerce');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
    },
  });
}

// Hook pour configurer Salesforce
export function useSetupSalesforce() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      instance_url: string;
      access_token: string;
      refresh_token?: string;
      client_id?: string;
      client_secret?: string;
    }) => {
      const response = await fetch(`${API_BASE_URL}/api/integrations/salesforce/setup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to setup Salesforce');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
    },
  });
}

// Hook pour déclencher une synchro manuelle
export function useTriggerSync() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ integrationId, entityType }: { integrationId: number; entityType: string }) => {
      const response = await fetch(`${API_BASE_URL}/api/integrations/${integrationId}/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entity_type: entityType }),
      });
      if (!response.ok) throw new Error('Sync failed');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      queryClient.invalidateQueries({ queryKey: ['integration-logs'] });
    },
  });
}

// Hook pour récupérer les logs
export function useIntegrationLogs(integrationId: number | null) {
  return useQuery({
    queryKey: ['integration-logs', integrationId],
    queryFn: async () => {
      if (!integrationId) return { logs: [] };
      const response = await fetch(`${API_BASE_URL}/api/integrations/${integrationId}/logs`);
      if (!response.ok) throw new Error('Failed to fetch logs');
      return response.json();
    },
    enabled: !!integrationId,
    staleTime: 10000,
  });
}

// Hook pour supprimer une intégration
export function useDeleteIntegration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (integrationId: number) => {
      const response = await fetch(`${API_BASE_URL}/api/integrations/${integrationId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete integration');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
    },
  });
}
