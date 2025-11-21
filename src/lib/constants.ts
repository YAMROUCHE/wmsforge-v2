/**
 * Application-wide constants
 *
 * Centralizes magic strings and repeated literals to improve maintainability
 * and reduce SonarCloud issues.
 */

// ============================================================================
// Order Status Constants
// ============================================================================

export const ORDER_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  SHIPPED: 'shipped',
  CANCELLED: 'cancelled',
  DELIVERED: 'delivered',
} as const;

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

// ============================================================================
// Task Status Constants
// ============================================================================

export const TASK_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export type TaskStatus = (typeof TASK_STATUS)[keyof typeof TASK_STATUS];

// ============================================================================
// Wave Status Constants
// ============================================================================

export const WAVE_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export type WaveStatus = (typeof WAVE_STATUS)[keyof typeof WAVE_STATUS];

// ============================================================================
// Task Priority Constants
// ============================================================================

export const TASK_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
} as const;

export type TaskPriority = (typeof TASK_PRIORITY)[keyof typeof TASK_PRIORITY];

// ============================================================================
// Task Type Constants
// ============================================================================

export const TASK_TYPE = {
  PICKING: 'picking',
  PACKING: 'packing',
  SHIPPING: 'shipping',
  RECEIVING: 'receiving',
  COUNTING: 'counting',
  MOVING: 'moving',
  REPLENISHMENT: 'replenishment',
} as const;

export type TaskType = (typeof TASK_TYPE)[keyof typeof TASK_TYPE];

// ============================================================================
// Integration Status Constants
// ============================================================================

export const INTEGRATION_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  ERROR: 'error',
  PENDING: 'pending',
} as const;

export type IntegrationStatus = (typeof INTEGRATION_STATUS)[keyof typeof INTEGRATION_STATUS];

// ============================================================================
// Movement Type Constants
// ============================================================================

export const MOVEMENT_TYPE = {
  IN: 'in',
  OUT: 'out',
  TRANSFER: 'transfer',
  ADJUSTMENT: 'adjustment',
} as const;

export type MovementType = (typeof MOVEMENT_TYPE)[keyof typeof MOVEMENT_TYPE];

// ============================================================================
// Error Messages
// ============================================================================

export const ERROR_MESSAGES = {
  GENERIC: 'Une erreur est survenue',
  LOAD_DATA: 'Erreur lors du chargement des données',
  SAVE_DATA: 'Erreur lors de la sauvegarde',
  NETWORK: 'Erreur de connexion au serveur',
  VALIDATION: 'Erreur de validation des données',
  UNAUTHORIZED: 'Non autorisé',
  NOT_FOUND: 'Ressource non trouvée',
} as const;

// ============================================================================
// Success Messages
// ============================================================================

export const SUCCESS_MESSAGES = {
  SAVE: 'Sauvegarde réussie',
  DELETE: 'Suppression réussie',
  UPDATE: 'Mise à jour réussie',
  CREATE: 'Création réussie',
} as const;

// ============================================================================
// Storage Keys
// ============================================================================

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_PREFERENCES: 'user_preferences',
  THEME: 'theme',
  APP_LOGS: 'app_logs',
  ONBOARDING_COMPLETE: 'onboarding_complete',
} as const;

// ============================================================================
// API Configuration
// ============================================================================

export const API_CONFIG = {
  BASE_URL: '/api',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
} as const;

// ============================================================================
// Pagination
// ============================================================================

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;
