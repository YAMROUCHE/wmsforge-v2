import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { users, organizations } from '../../../db/schema';
import { hashPassword, verifyPassword } from '../utils/password';
import { createToken, verifyToken } from '../utils/jwt';

const auth = new Hono();

// POST /auth/register - Créer un compte
auth.post('/register', async (c) => {
  try {
    const body = await c.req.json();
    const { name, email, password, organizationName } = body;

    if (!name || !email || !password || !organizationName) {
      return c.json({ error: 'Tous les champs sont requis' }, 400);
    }

    const db = drizzle(c.env.DB);

    const existingUser = await db.select().from(users).where(eq(users.email, email)).get();
    if (existingUser) {
      return c.json({ error: 'Cet email est déjà utilisé' }, 400);
    }

    const passwordHash = await hashPassword(password);

    const organization = await db
      .insert(organizations)
      .values({ name: organizationName })
      .returning()
      .get();

    const user = await db
      .insert(users)
      .values({
        organizationId: organization.id,
        email,
        passwordHash,
        name,
        role: 'admin',
        onboardingCompleted: 0,
      })
      .returning()
      .get();

    const token = await createToken(
      { userId: user.id, organizationId: user.organizationId },
      c.env.JWT_SECRET
    );

    return c.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        organizationId: user.organizationId,
        onboardingCompleted: Boolean(user.onboardingCompleted),
      },
    }, 201);
  } catch (error) {
    console.error('Erreur /auth/register:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
});

// POST /auth/login - Se connecter
auth.post('/login', async (c) => {
  try {
    const body = await c.req.json();
    const { email, password } = body;

    if (!email || !password) {
      return c.json({ error: 'Email et mot de passe requis' }, 400);
    }

    const db = drizzle(c.env.DB);
    const user = await db.select().from(users).where(eq(users.email, email)).get();

    if (!user) {
      return c.json({ error: 'Email ou mot de passe incorrect' }, 401);
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return c.json({ error: 'Email ou mot de passe incorrect' }, 401);
    }

    const token = await createToken(
      { userId: user.id, organizationId: user.organizationId },
      c.env.JWT_SECRET
    );

    return c.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        organizationId: user.organizationId,
        onboardingCompleted: Boolean(user.onboardingCompleted),
      },
    }, 200);
  } catch (error) {
    console.error('Erreur /auth/login:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
});

// GET /auth/me - Vérifier le token et récupérer l'utilisateur
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
    return c.json({
      id: user.id,
      name: user.name,
      email: user.email,
      organizationId: user.organizationId,
      onboardingCompleted: Boolean(user.onboardingCompleted),
    }, 200);
  } catch (error) {
    console.error('Erreur /auth/me:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
});

export default auth;
