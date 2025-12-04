// API Base URL - points to Cloudflare Worker
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787';

// Helper function for API calls
async function apiCall<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('wms_auth_token');
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  return response.json();
}

// ============================================================================
// WAVE MANAGEMENT API
// ============================================================================

export interface Wave {
  id: number;
  organization_id: number;
  name: string;
  status: string;
  priority: string;
  zone: string | null;
  total_orders: number;
  total_lines: number;
  total_units: number;
  estimated_time_minutes: number;
  created_at: string;
  released_at: string | null;
  completed_at: string | null;
  actual_orders?: number;
  orders?: any[];
}

export interface CreateWaveRequest {
  name: string;
  priority?: string;
  zone?: string;
  orderIds: number[];
}

export const waveApi = {
  // GET /api/waves - Liste toutes les vagues
  getWaves: async (): Promise<{ waves: Wave[] }> => {
    return apiCall('/api/waves');
  },

  // GET /api/waves/:id - Détails d'une vague
  getWave: async (id: number): Promise<{ wave: Wave }> => {
    return apiCall(`/api/waves/${id}`);
  },

  // POST /api/waves - Créer une vague
  createWave: async (data: CreateWaveRequest): Promise<{ success: boolean; waveId: number }> => {
    return apiCall('/api/waves', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // PUT /api/waves/:id/status - Modifier le statut
  updateWaveStatus: async (id: number, status: string): Promise<{ success: boolean }> => {
    return apiCall(`/api/waves/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },
};

// ============================================================================
// TASK MANAGEMENT API
// ============================================================================

export interface Task {
  id: number;
  organization_id: number;
  wave_id: number | null;
  order_id: number | null;
  type: string;
  priority: string;
  status: string;
  product_id: number;
  product_name: string;
  quantity: number;
  from_location_id: number | null;
  to_location_id: number | null;
  assigned_to: number | null;
  estimated_time_seconds: number;
  actual_time_seconds: number | null;
  zone: string | null;
  created_at: string;
  assigned_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  operator_name?: string | null;
}

export interface CreateTaskRequest {
  waveId?: number;
  orderId?: number;
  type: string;
  priority?: string;
  productId: number;
  productName: string;
  quantity: number;
  fromLocationId?: number;
  toLocationId?: number;
  estimatedTimeSeconds?: number;
  zone?: string;
}

export interface TaskMetrics {
  total: number;
  pending: number;
  in_progress: number;
  completed: number;
  avg_time: number;
}

export const taskApi = {
  // GET /api/tasks - Liste toutes les tâches
  getTasks: async (filters?: { status?: string; operatorId?: number }): Promise<{ tasks: Task[] }> => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.operatorId) params.append('operatorId', filters.operatorId.toString());

    const queryString = params.toString();
    return apiCall(`/api/tasks${queryString ? '?' + queryString : ''}`);
  },

  // POST /api/tasks - Créer des tâches
  createTasks: async (tasks: CreateTaskRequest[]): Promise<{ success: boolean; tasks: { id: number }[] }> => {
    return apiCall('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(tasks),
    });
  },

  // PUT /api/tasks/:id/status - Mettre à jour le statut
  updateTaskStatus: async (
    id: number,
    status: string,
    actualTimeSeconds?: number
  ): Promise<{ success: boolean }> => {
    return apiCall(`/api/tasks/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, actualTimeSeconds }),
    });
  },

  // GET /api/tasks/metrics - Métriques des tâches
  getMetrics: async (): Promise<{ metrics: TaskMetrics }> => {
    return apiCall('/api/tasks/metrics');
  },
};

// ============================================================================
// LABOR MANAGEMENT API
// ============================================================================

export interface Operator {
  id: number;
  organization_id: number;
  user_id: number | null;
  name: string;
  employee_id: string | null;
  current_zone: string | null;
  status: string;
  productivity_score: number;
  created_at: string;
}

export interface OperatorPerformance {
  id: number;
  organization_id: number;
  operator_id: number;
  date: string;
  tasks_completed: number;
  picks_per_hour: number;
  lines_per_hour: number;
  accuracy_rate: number;
  total_hours_worked: number;
  avg_task_time_seconds: number;
  efficiency_score: number;
  daily_score: number;
  rank: number;
  streak_days: number;
  operator_name?: string;
  employee_id?: string;
}

export interface LeaderboardEntry {
  rank: number;
  operator_id: number;
  operator_name: string;
  score: number;
  picks_per_hour: number;
  accuracy_rate: number;
  badges_count: number;
}

export interface Badge {
  id: number;
  code: string;
  name: string;
  description: string;
  icon: string;
  rarity: string;
  criteria: string | null;
  created_at: string;
}

export interface TeamStats {
  total_operators: number;
  total_picks: number;
  avg_picks_per_hour: number;
  avg_accuracy: number;
  avg_efficiency: number;
  total_badges: number;
}

export interface SavePerformanceRequest {
  operatorId: number;
  date: string;
  tasksCompleted: number;
  picksPerHour: number;
  linesPerHour: number;
  accuracyRate: number;
  totalHoursWorked: number;
  avgTaskTimeSeconds: number;
  efficiencyScore: number;
  dailyScore: number;
  rank?: number;
  streakDays?: number;
}

export const laborApi = {
  // GET /api/labor/operators - Liste des opérateurs
  getOperators: async (): Promise<{ operators: Operator[] }> => {
    return apiCall('/api/labor/operators');
  },

  // GET /api/labor/performance - Performances quotidiennes
  getPerformance: async (date?: string): Promise<{ performances: OperatorPerformance[] }> => {
    const queryString = date ? `?date=${date}` : '';
    return apiCall(`/api/labor/performance${queryString}`);
  },

  // GET /api/labor/leaderboard - Leaderboard du jour
  getLeaderboard: async (date?: string): Promise<{ leaderboard: LeaderboardEntry[] }> => {
    const queryString = date ? `?date=${date}` : '';
    return apiCall(`/api/labor/leaderboard${queryString}`);
  },

  // GET /api/labor/badges - Liste des badges
  getBadges: async (): Promise<{ badges: Badge[] }> => {
    return apiCall('/api/labor/badges');
  },

  // GET /api/labor/team-stats - Statistiques d'équipe
  getTeamStats: async (date?: string): Promise<{ stats: TeamStats }> => {
    const queryString = date ? `?date=${date}` : '';
    return apiCall(`/api/labor/team-stats${queryString}`);
  },

  // POST /api/labor/performance - Enregistrer une performance
  savePerformance: async (data: SavePerformanceRequest): Promise<{ success: boolean }> => {
    return apiCall('/api/labor/performance', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// ============================================================================
// ORDER MANAGEMENT API
// ============================================================================

export interface Order {
  id: number;
  organization_id: number;
  order_number: string;
  type: 'purchase' | 'sales';
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  customer_name?: string;
  customer_email?: string;
  total_amount: number;
  notes?: string;
  items_count?: number;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id?: number;
  order_id?: number;
  product_id: number;
  productId?: number;
  productName?: string;
  quantity: number;
  unit_price: number;
  unitPrice?: number;
}

export interface OrderStats {
  total_orders: number;
  pending: number;
  confirmed: number;
  shipped: number;
  delivered: number;
  total_revenue: number;
}

export interface CreateOrderRequest {
  type: 'purchase' | 'sales';
  customerName?: string;
  customerEmail?: string;
  items: OrderItem[];
  notes?: string;
}

export const orderApi = {
  // GET /api/orders - Liste toutes les commandes
  getOrders: async (): Promise<{ orders: Order[] }> => {
    return apiCall('/api/orders');
  },

  // GET /api/orders/:id - Détails d'une commande
  getOrder: async (id: number): Promise<{ order: Order }> => {
    return apiCall(`/api/orders/${id}`);
  },

  // GET /api/orders/stats - Statistiques des commandes
  getStats: async (): Promise<{ stats: OrderStats }> => {
    return apiCall('/api/orders/stats');
  },

  // POST /api/orders - Créer une commande
  createOrder: async (data: CreateOrderRequest): Promise<{ orderId: number; orderNumber: string }> => {
    return apiCall('/api/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // PUT /api/orders/:id/status - Modifier le statut
  updateOrderStatus: async (id: number, status: string): Promise<{ success: boolean }> => {
    return apiCall(`/api/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  // POST /api/orders/:id/items - Ajouter des items
  addOrderItem: async (
    id: number,
    item: { productId: number; quantity: number; unitPrice: number }
  ): Promise<{ success: boolean }> => {
    return apiCall(`/api/orders/${id}/items`, {
      method: 'POST',
      body: JSON.stringify(item),
    });
  },

  // DELETE /api/orders/:id - Supprimer une commande
  deleteOrder: async (id: number): Promise<{ success: boolean }> => {
    return apiCall(`/api/orders/${id}`, {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// LOCATION MANAGEMENT API
// ============================================================================

export interface Location {
  id: number;
  organization_id: number;
  code: string;
  name: string;
  type: 'zone' | 'aisle' | 'rack' | 'shelf' | 'location';
  parent_id?: number;
  capacity?: number;
  created_at: string;
}

export interface LocationStats {
  total_locations: number;
  zones: number;
  aisles: number;
  racks: number;
  shelves: number;
  total_capacity: number;
}

export interface CreateLocationRequest {
  code: string;
  name: string;
  type: 'zone' | 'aisle' | 'rack' | 'shelf' | 'location';
  parentId?: number;
  capacity?: number;
}

export const locationApi = {
  // GET /api/locations - Liste tous les emplacements
  getLocations: async (): Promise<{ locations: Location[] }> => {
    return apiCall('/api/locations');
  },

  // GET /api/locations/:id - Détails d'un emplacement
  getLocation: async (id: number): Promise<{ location: Location }> => {
    return apiCall(`/api/locations/${id}`);
  },

  // GET /api/locations/stats - Statistiques des emplacements
  getStats: async (): Promise<{ stats: LocationStats }> => {
    return apiCall('/api/locations/stats');
  },

  // POST /api/locations - Créer un emplacement
  createLocation: async (data: CreateLocationRequest): Promise<{ message: string }> => {
    return apiCall('/api/locations', {
      method: 'POST',
      body: JSON.stringify({
        code: data.code,
        name: data.name,
        type: data.type,
        parent_id: data.parentId,
        capacity: data.capacity,
      }),
    });
  },

  // PUT /api/locations/:id - Modifier un emplacement
  updateLocation: async (id: number, data: CreateLocationRequest): Promise<{ message: string }> => {
    return apiCall(`/api/locations/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        code: data.code,
        name: data.name,
        type: data.type,
        parent_id: data.parentId,
        capacity: data.capacity,
      }),
    });
  },

  // DELETE /api/locations/:id - Supprimer un emplacement
  deleteLocation: async (id: number): Promise<{ message: string }> => {
    return apiCall(`/api/locations/${id}`, {
      method: 'DELETE',
    });
  },
};
