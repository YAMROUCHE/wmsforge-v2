// API Client - Communication Frontend/Backend

const API_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:8787'
  : 'https://api.1wms.io';

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

async function fetchAPI<T>(
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
  const response = await fetchAPI<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  setToken(response.token);
  return response;
}

export async function login(data: LoginData): Promise<AuthResponse> {
  const response = await fetchAPI<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  setToken(response.token);
  return response;
}

export async function getCurrentUser(): Promise<User> {
  return fetchAPI<User>('/auth/me');
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
