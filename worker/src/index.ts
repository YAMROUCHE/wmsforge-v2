import { Hono } from 'hono';
import { cors } from 'hono/cors';
import './types'; // Load type definitions
import auth from './routes/auth';
import onboardingRouter from './routes/onboarding';
import productsRouter from './routes/products';
import inventoryRouter from './routes/inventory';
import locationsRouter from './routes/locations';
import ordersRouter from './routes/orders';
import settingsRouter from './routes/settings';
import wavesRouter from './routes/waves';
import tasksRouter from './routes/tasks';
import laborRouter from './routes/labor';
import integrationsRouter from './routes/integrations';
import testimonialsRouter from './routes/testimonials';
import referralsRouter from './routes/referrals';

const app = new Hono();

app.use('/*', cors());

app.get('/health', (c) => c.json({ status: 'ok' }));

app.route('/api/auth', auth);
app.route('/api/onboarding', onboardingRouter);
app.route('/api/products', productsRouter);
app.route('/api/inventory', inventoryRouter);
app.route('/api/locations', locationsRouter);
app.route('/api/orders', ordersRouter);
app.route('/api/settings', settingsRouter);
app.route('/api/waves', wavesRouter);
app.route('/api/tasks', tasksRouter);
app.route('/api/labor', laborRouter);
app.route('/api/integrations', integrationsRouter);
app.route('/api/testimonials', testimonialsRouter);
app.route('/api/referrals', referralsRouter);

export default app;
