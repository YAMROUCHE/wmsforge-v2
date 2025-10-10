import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import type { D1Database } from '@cloudflare/workers-types';
import { users, organizations } from '../../../db/schema';
import { hashPassword, verifyPassword, validatePassword, validateEmail } from '../utils/password';
import { createToken } from '../utils/jwt';

type Bindings = {
  DB: D1Database;
  JWT_SECRET: string;
};

export const authRoutes = new Hono<{ Bindings: Bindings }>();

// Register
authRoutes.post('/register', async (c) => {
  try {
    const body = await c.req.json();
    const { name, email, password, organizationName } = body;

    // Validation
    if (!name || !email || !password || !organizationName) {
      return c.json({ error: 'Tous les champs sont requis' }, 400);
    }

    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      return c.json({ error: emailValidation.error }, 400);
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return c.json({ error: passwordValidation.error }, 400);
    }

    const db = drizzle(c.env.DB);

    // Vérifier si l'email existe déjà
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .get();

    if (existingUser) {
      return c.json({ error: 'Un compte avec cet email existe déjà' }, 400);
    }

    // Créer l'organisation
    const newOrg = await db
      .insert(organizations)
      .values({
        name: organizationName,
      })
      .returning()
      .get();

    if (!newOrg) {
      return c.json({ error: 'Erreur lors de la création de l\'organisation' }, 500);
    }

    // Hash du mot de passe
    const passwordHash = await hashPassword(password);

    // Créer l'utilisateur
    const newUser = await db
      .insert(users)
      .values({
        organizationId: newOrg.id,
        email,
        passwordHash,
        name,
        role: 'admin', // Premier utilisateur = admin
      })
      .returning({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        organizationId: users.organizationId,
      })
      .get();

    if (!newUser) {
      return c.json({ error: 'Erreur lors de la création de l\'utilisateur' }, 500);
    }

    // Générer le JWT
    const token = await createToken(
      {
        userId: newUser.id,
        email: newUser.email,
        organizationId: newUser.organizationId,
        role: newUser.role,
        exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60), // 7 jours
      },
      c.env.JWT_SECRET
    );

    return c.json({
      message: 'Compte créé avec succès',
      token,
      user: newUser,
    }, 201);

  } catch (error: any) {
    console.error('Register error:', error);
    return c.json({ 
      error: 'Erreur lors de l\'inscription',
      details: error.message 
    }, 500);
  }
});

// Login
authRoutes.post('/login', async (c) => {
  try {
    const body = await c.req.json();
    const { email, password } = body;

    // Validation
    if (!email || !password) {
      return c.json({ error: 'Email et mot de passe requis' }, 400);
    }

    const db = drizzle(c.env.DB);

    // Trouver l'utilisateur
    const user = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        organizationId: users.organizationId,
        passwordHash: users.passwordHash,
      })
      .from(users)
      .where(eq(users.email, email))
      .get();

    if (!user) {
      return c.json({ error: 'Email ou mot de passe incorrect' }, 401);
    }

    // Vérifier le mot de passe
    const isValidPassword = await verifyPassword(password, user.passwordHash);

    if (!isValidPassword) {
      return c.json({ error: 'Email ou mot de passe incorrect' }, 401);
    }

    // Générer le JWT
    const token = await createToken(
      {
        userId: user.id,
        email: user.email,
        organizationId: user.organizationId,
        role: user.role,
        exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60), // 7 jours
      },
      c.env.JWT_SECRET
    );

    // Ne pas retourner le hash du mot de passe
    const { passwordHash, ...userWithoutPassword } = user;

    return c.json({
      message: 'Connexion réussie',
      token,
      user: userWithoutPassword,
    });

  } catch (error: any) {
    console.error('Login error:', error);
    return c.json({ 
      error: 'Erreur lors de la connexion',
      details: error.message 
    }, 500);
  }
});

// Verify token (pour vérifier si l'utilisateur est connecté)
authRoutes.get('/me', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ error: 'Token manquant' }, 401);
    }

    const token = authHeader.substring(7);
    
    // TODO: Vérifier le token et retourner les infos utilisateur
    
    return c.json({ message: 'Token valide' });

  } catch (error: any) {
    return c.json({ error: 'Token invalide' }, 401);
  }
});
