import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { D1Database } from '@cloudflare/workers-types';
import auth from './routes/auth';

type Bindings = {
  DB: D1Database;
  JWT_SECRET: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// CORS configuration
app.use('*', cors({
  origin: ['http://localhost:5173', 'https://*.pages.dev'],
  credentials: true,
}));

// Health check
app.get('/health', (c) => {
  return c.json({ ok: true, timestamp: new Date().toISOString() });
});

// Auth routes
app.route('/auth', auth);

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not found' }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error('Error:', err);
  return c.json({ 
    error: 'Internal server error',
    message: err.message 
  }, 500);
});

export default app;
