import { Hono } from 'hono';
import { cors } from 'hono/cors';
import auth from './routes/auth';
import onboardingRouter from './routes/onboarding';
import productsRouter from './routes/products';
import inventoryRouter from './routes/inventory';
import locationsRouter from './routes/locations';
import ordersRouter from './routes/orders';

const app = new Hono();

app.use('/*', cors());

app.get('/health', (c) => c.json({ status: 'ok' }));

app.route('/auth', auth);
app.route('/api/onboarding', onboardingRouter);
app.route('/api/products', productsRouter);
app.route('/api/inventory', inventoryRouter);
app.route('/api/locations', locationsRouter);
app.route('/api/orders', ordersRouter);

export default app;
