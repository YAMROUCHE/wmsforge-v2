/**
 * Authentication middleware for Cloudflare Workers
 */

import { Context, Next } from 'hono';
import { verifyJWT } from '../auth/crypto';

export interface AuthUser {
  userId: number;
  organizationId: number;
  email: string;
  role: string;
}

/**
 * Middleware to verify JWT token and extract user info
 */
export async function authMiddleware(c: Context, next: Next) {
  try {
    const authHeader = c.req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ error: 'Missing or invalid authorization header' }, 401);
    }

    const token = authHeader.substring(7); // Remove 'Bearer '

    // Get JWT secret from environment
    const jwtSecret = c.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

    // Verify and decode token
    const payload = await verifyJWT(token, jwtSecret);

    // Set user info in context
    const user: AuthUser = {
      userId: payload.userId,
      organizationId: payload.organizationId,
      email: payload.email,
      role: payload.role
    };

    c.set('user', user);

    await next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return c.json({
      error: 'Unauthorized',
      details: (error as Error).message
    }, 401);
  }
}

/**
 * Optional authentication - doesn't fail if no token
 */
export async function optionalAuthMiddleware(c: Context, next: Next) {
  try {
    const authHeader = c.req.header('Authorization');

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const jwtSecret = c.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

      const payload = await verifyJWT(token, jwtSecret);

      const user: AuthUser = {
        userId: payload.userId,
        organizationId: payload.organizationId,
        email: payload.email,
        role: payload.role
      };

      c.set('user', user);
    }
  } catch (error) {
    // Silently fail for optional auth
    console.log('Optional auth failed:', (error as Error).message);
  }

  await next();
}

/**
 * Helper to get authenticated user from context
 */
export function getAuthUser(c: Context): AuthUser {
  const user = c.get('user');
  if (!user) {
    throw new Error('User not authenticated');
  }
  return user;
}
