/**
 * Type definitions for Hono context variables
 */

import { AuthUser } from './middleware/auth';

/**
 * Extend Hono's ContextVariableMap to include our custom context variables
 */
declare module 'hono' {
  interface ContextVariableMap {
    user: AuthUser;
  }
}
