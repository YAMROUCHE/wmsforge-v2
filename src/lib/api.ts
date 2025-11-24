// API Client - Communication Frontend/Backend

const API_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:8787'
  : 'https://wmsforge-api.youssef-amrouche.workers.dev';

const TOKEN_KEY = 'wms_auth_token';

export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const removeToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  organizationName: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  organizationId: number;
  onboardingCompleted?: boolean;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: { ...headers, ...(options.headers as Record<string, string> || {}) },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: 'Une erreur est survenue'
    }));
    throw new ApiError(response.status, error.message || error.error);
  }

  return response.json();
}

export async function register(data: RegisterData): Promise<AuthResponse> {
  const response = await fetchAPI<AuthResponse>('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  setToken(response.token);
  return response;
}

export async function login(data: LoginData): Promise<AuthResponse> {
  const response = await fetchAPI<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  setToken(response.token);
  return response;
}

export async function getCurrentUser(): Promise<User> {
  return fetchAPI<User>('/api/auth/me');
}

export async function logout(): Promise<void> {
  removeToken();
}

export const api = {
  register,
  login,
  getCurrentUser,
  logout,
  getToken,
  setToken,
  removeToken,
};

// ===== ONBOARDING API =====

export interface OnboardingData {
  warehouseName: string;
  product: {
    sku: string;
    name: string;
    description?: string;
    category?: string;
    unitPrice?: string;
    reorderPoint?: string;
  };
}

export async function completeOnboarding(data: OnboardingData): Promise<{ message: string }> {
  return fetchAPI<{ message: string }>('/api/onboarding/complete', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ===== PRODUCTS API =====

export interface Product {
  id: number;
  organizationId: number;
  sku: string;
  name: string;
  description?: string | null;
  category?: string | null;
  unitPrice?: number | null;
  reorderPoint: number;
  imageUrl?: string | null;
  createdAt: string;
}

export async function getProducts(search?: string): Promise<Product[]> {
  const queryParams = search ? `?search=${encodeURIComponent(search)}` : '';
  return fetchAPI<Product[]>(`/api/products${queryParams}`);
}

export async function getProduct(id: number): Promise<Product> {
  return fetchAPI<Product>(`/api/products/${id}`);
}

export interface CreateProductData {
  sku: string;
  name: string;
  description?: string;
  category?: string;
  unitPrice?: string;
  reorderPoint?: string;
  imageUrl?: string;
}

export async function createProduct(data: CreateProductData): Promise<Product> {
  return fetchAPI<Product>('/api/products', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateProduct(id: number, data: Partial<CreateProductData>): Promise<Product> {
  return fetchAPI<Product>(`/api/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteProduct(id: number): Promise<{ message: string }> {
  return fetchAPI<{ message: string }>(`/api/products/${id}`, {
    method: 'DELETE',
  });
}

export interface ImportCSVResult {
  created: number;
  failed: number;
  errors: string[];
}

export async function importProductsCSV(products: CreateProductData[]): Promise<ImportCSVResult> {
  return fetchAPI<ImportCSVResult>('/api/products/import-csv', {
    method: 'POST',
    body: JSON.stringify({ products }),
  });
}

// ============================================
// INVENTORY API
// ============================================

export interface InventoryItem {
  productId: number;
  sku: string;
  name: string;
  category: string | null;
  reorderPoint: number;
  totalQuantity: number;
}

export interface InventoryDetail {
  id: number;
  productId: number;
  locationId: number;
  locationName: string;
  locationCode: string;
  quantity: number;
  updatedAt: string;
}

export interface StockMovement {
  id: number;
  type: string;
  quantity: number;
  notes: string | null;
  createdAt: string;
  productSku: string;
  productName: string;
  locationName: string | null;
}

export interface AdjustStockData {
  productId: number;
  locationId: number;
  quantity: number;
  type: 'in' | 'out' | 'adjustment';
  notes?: string;
}

export async function getInventory(): Promise<InventoryItem[]> {
  const response = await fetchAPI('/api/inventory');
  return response as InventoryItem[];
}

export async function getInventoryByProduct(productId: number): Promise<InventoryDetail[]> {
  const response = await fetchAPI(`/api/inventory/${productId}`);
  return response as InventoryDetail[];
}

export async function adjustStock(data: AdjustStockData): Promise<{ message: string; newQuantity: number }> {
  const response = await fetchAPI('/api/inventory/adjust', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return response as { message: string; newQuantity: number };
}

export async function getStockMovements(): Promise<StockMovement[]> {
  const response = await fetchAPI('/api/inventory/movements/list');
  return response as StockMovement[];
}
