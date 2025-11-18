import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787';

interface SettingsData {
  profile: {
    name: string;
    email: string;
    role: string;
  };
  organization: {
    name: string;
    address: string;
    phone: string;
    email: string;
  };
  notifications: {
    emailNotifications: boolean;
    orderNotifications: boolean;
    inventoryAlerts: boolean;
    lowStockAlerts: boolean;
  };
  appearance: {
    theme: string;
    language: string;
    dateFormat: string;
  };
}

// Hook pour récupérer tous les settings
export function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: async (): Promise<SettingsData> => {
      const response = await fetch(`${API_BASE_URL}/api/settings`);
      if (!response.ok) {
        throw new Error('Failed to fetch settings');
      }
      return response.json();
    },
    staleTime: 60000,
  });
}

// Hook pour mettre à jour le profil
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name: string; email: string; role: string }) => {
      const response = await fetch(`${API_BASE_URL}/api/settings/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to update profile');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });
}

// Hook pour mettre à jour l'organisation
export function useUpdateOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name: string; address: string; phone: string; email: string }) => {
      const response = await fetch(`${API_BASE_URL}/api/settings/organization`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to update organization');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });
}

// Hook pour mettre à jour les notifications
export function useUpdateNotifications() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      emailNotifications: boolean;
      orderNotifications: boolean;
      inventoryAlerts: boolean;
      lowStockAlerts: boolean;
    }) => {
      const response = await fetch(`${API_BASE_URL}/api/settings/notifications`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to update notifications');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });
}

// Hook pour mettre à jour l'apparence
export function useUpdateAppearance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { theme: string; language: string; dateFormat: string }) => {
      const response = await fetch(`${API_BASE_URL}/api/settings/appearance`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to update appearance');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });
}
