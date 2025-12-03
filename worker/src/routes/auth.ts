/**
 * Authentication routes - Signup, Login, User management
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { hashPassword, verifyPassword, generateJWT } from '../auth/crypto';
import { authMiddleware, getAuthUser } from '../middleware/auth';

type Bindings = {
  DB: D1Database;
  JWT_SECRET?: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// CORS for frontend
app.use('/*', cors());

/**
 * POST /api/auth/signup
 * Create a new organization with first admin user
 */
app.post('/signup', async (c) => {
  try {
    const body = await c.req.json();
    const { organizationName, name, email, password } = body;

    // Validation
    if (!organizationName || !name || !email || !password) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    if (password.length < 6) {
      return c.json({ error: 'Password must be at least 6 characters' }, 400);
    }

    // Check if email already exists
    const existingUser = await c.env.DB.prepare(
      `SELECT id FROM users WHERE email = ?`
    ).bind(email).first();

    if (existingUser) {
      return c.json({ error: 'Email already registered' }, 400);
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create organization
    const orgResult = await c.env.DB.prepare(
      `INSERT INTO organizations (name, created_at) VALUES (?, datetime('now'))`
    ).bind(organizationName).run();

    const organizationId = orgResult.meta.last_row_id;

    // Create user (admin)
    const userResult = await c.env.DB.prepare(
      `INSERT INTO users (organization_id, email, password_hash, name, role, created_at)
       VALUES (?, ?, ?, ?, 'admin', datetime('now'))`
    ).bind(organizationId, email, passwordHash, name).run();

    const userId = userResult.meta.last_row_id;

    // Generate JWT
    const jwtSecret = c.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
    const token = await generateJWT(
      {
        userId,
        organizationId,
        email,
        role: 'admin'
      },
      jwtSecret,
      86400 * 7 // 7 days
    );

    return c.json({
      success: true,
      token,
      user: {
        id: userId,
        organizationId,
        name,
        email,
        role: 'admin'
      }
    }, 201);
  } catch (error) {
    console.error('Signup error:', error);
    return c.json({
      error: 'Signup failed',
      details: (error as Error).message
    }, 500);
  }
});

/**
 * POST /api/auth/login
 * Login with email and password
 */
app.post('/login', async (c) => {
  try {
    const body = await c.req.json();
    const { email, password } = body;

    // Validation
    if (!email || !password) {
      return c.json({ error: 'Missing email or password' }, 400);
    }

    // Find user
    const user = await c.env.DB.prepare(
      `SELECT id, organization_id, email, password_hash, name, role
       FROM users
       WHERE email = ?`
    ).bind(email).first() as any;

    if (!user) {
      return c.json({ error: 'Invalid email or password' }, 401);
    }

    // Verify password
    const isValid = await verifyPassword(password, user.password_hash);

    if (!isValid) {
      return c.json({ error: 'Invalid email or password' }, 401);
    }

    // Generate JWT
    const jwtSecret = c.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
    const token = await generateJWT(
      {
        userId: user.id,
        organizationId: user.organization_id,
        email: user.email,
        role: user.role
      },
      jwtSecret,
      86400 * 7 // 7 days
    );

    return c.json({
      success: true,
      token,
      user: {
        id: user.id,
        organizationId: user.organization_id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return c.json({
      error: 'Login failed',
      details: (error as Error).message
    }, 500);
  }
});

/**
 * GET /api/auth/me
 * Get current authenticated user
 */
app.get('/me', authMiddleware, async (c) => {
  try {
    const authUser = getAuthUser(c);

    // Get full user details from DB
    const user = await c.env.DB.prepare(
      `SELECT id, organization_id, email, name, role, created_at
       FROM users
       WHERE id = ?`
    ).bind(authUser.userId).first() as any;

    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }

    // Get organization details
    const org = await c.env.DB.prepare(
      `SELECT id, name
       FROM organizations
       WHERE id = ?`
    ).bind(user.organization_id).first() as any;

    return c.json({
      user: {
        id: user.id,
        organizationId: user.organization_id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.created_at
      },
      organization: org ? {
        id: org.id,
        name: org.name
      } : null
    });
  } catch (error) {
    console.error('Get me error:', error);
    return c.json({
      error: 'Failed to get user',
      details: (error as Error).message
    }, 500);
  }
});

/**
 * GET /api/auth/test-token
 * Generate a test token for organization 3 (dev/test only)
 */
app.get('/test-token', async (c) => {
  try {
    // Generate JWT for test user
    const jwtSecret = c.env.JWT_SECRET || 'whsec_a8f3b2c1d4e5f6g7h8i9j0k1l2m3n4o5';
    const token = await generateJWT(
      {
        userId: 3,
        organizationId: 3,
        email: 'admin@test.com',
        role: 'admin'
      },
      jwtSecret,
      86400 * 30 // 30 days
    );

    return c.json({
      success: true,
      token,
      user: {
        id: 3,
        organizationId: 3,
        email: 'admin@test.com',
        role: 'admin'
      },
      expiresIn: '30 days'
    });
  } catch (error) {
    console.error('Test token error:', error);
    return c.json({
      error: 'Failed to generate test token',
      details: (error as Error).message
    }, 500);
  }
});

export default app;
