import { Hono } from 'hono';
import type { Env } from '../index';
import { hashPassword, verifyPassword } from '../utils/password';
import { createToken, verifyToken } from '../utils/jwt';
import { drizzle } from 'drizzle-orm/d1';
import { users, organizations } from '../../../db/schema';
import { eq } from 'drizzle-orm';

const auth = new Hono<{ Bindings: Env }>();

auth.post('/register', async (c) => {
  try {
    const { name, email, password, organizationName } = await c.req.json();
    if (!name || !email || !password || !organizationName) {
      return c.json({ error: 'Tous les champs sont obligatoires' }, 400);
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return c.json({ error: 'Email invalide' }, 400);
    }
    if (password.length < 6) {
      return c.json({ error: 'Le mot de passe doit contenir au moins 6 caractères' }, 400);
    }
    const db = drizzle(c.env.DB);
    const existingUser = await db.select().from(users).where(eq(users.email, email)).get();
    if (existingUser) {
      return c.json({ error: 'Cet email est déjà utilisé' }, 409);
    }
    const newOrg = await db.insert(organizations).values({ name: organizationName }).returning().get();
    const passwordHash = await hashPassword(password);
    const newUser = await db.insert(users).values({ name, email, passwordHash, organizationId: newOrg.id, role: 'admin' }).returning().get();
    const token = await createToken({ userId: newUser.id, organizationId: newOrg.id }, c.env.JWT_SECRET);
    return c.json({ token, user: { id: newUser.id, name: newUser.name, email: newUser.email, organizationId: newUser.organizationId } }, 201);
  } catch (error) {
    console.error('Erreur inscription:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
});

auth.post('/login', async (c) => {
  try {
    const { email, password } = await c.req.json();
    if (!email || !password) {
      return c.json({ error: 'Email et mot de passe requis' }, 400);
    }
    const db = drizzle(c.env.DB);
    const user = await db.select().from(users).where(eq(users.email, email)).get();
    if (!user) {
      return c.json({ error: 'Email ou mot de passe incorrect' }, 401);
    }
    const isValidPassword = await verifyPassword(password, user.passwordHash);
    if (!isValidPassword) {
      return c.json({ error: 'Email ou mot de passe incorrect' }, 401);
    }
    const token = await createToken({ userId: user.id, organizationId: user.organizationId }, c.env.JWT_SECRET);
    return c.json({ token, user: { id: user.id, name: user.name, email: user.email, organizationId: user.organizationId } }, 200);
  } catch (error) {
    console.error('Erreur connexion:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
});

auth.get('/me', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ error: 'Token manquant' }, 401);
    }
    const token = authHeader.substring(7);
    const payload = await verifyToken(token, c.env.JWT_SECRET);
    if (!payload) {
      return c.json({ error: 'Token invalide ou expiré' }, 401);
    }
    const db = drizzle(c.env.DB);
    const user = await db.select().from(users).where(eq(users.id, payload.userId)).get();
    if (!user) {
      return c.json({ error: 'Utilisateur non trouvé' }, 404);
    }
    return c.json({ id: user.id, name: user.name, email: user.email, organizationId: user.organizationId }, 200);
  } catch (error) {
    console.error('Erreur /auth/me:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
});

export default auth;
