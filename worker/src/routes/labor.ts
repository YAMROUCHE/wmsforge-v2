import { optionalAuthMiddleware, getAuthUser } from '../middleware/auth';
import { Hono } from 'hono';

const app = new Hono<{ Bindings: { DB: D1Database } }>();

app.use('/*', optionalAuthMiddleware);

// GET /api/labor/operators - Liste des opérateurs
app.get('/operators', async (c) => {
    const authUser = c.get("user");
    const organizationId = authUser?.organizationId || 1;
  try {
    const result = await c.env.DB.prepare(`
      SELECT * FROM operators
      WHERE organization_id = ?
      ORDER BY name
    `).bind(organizationId).all();

    return c.json({ operators: result.results || [] });
  } catch (error) {
    return c.json({ error: 'Failed to fetch operators' }, 500);
  }
});

// GET /api/labor/performance - Performances quotidiennes
app.get('/performance', async (c) => {
    const authUser = c.get("user");
    const organizationId = authUser?.organizationId || 1;
  try {
    const { date } = c.req.query();
    const targetDate = date || new Date().toISOString().split('T')[0];

    const result = await c.env.DB.prepare(`
      SELECT
        op.*,
        o.name as operator_name,
        o.employee_id
      FROM operator_performance op
      JOIN operators o ON op.operator_id = o.id
      WHERE op.organization_id = ? AND op.date = ?
      ORDER BY op.daily_score DESC
    `).bind(1, targetDate).all();

    return c.json({ performances: result.results || [] });
  } catch (error) {
    return c.json({ error: 'Failed to fetch performance' }, 500);
  }
});

// GET /api/labor/leaderboard - Leaderboard du jour
app.get('/leaderboard', async (c) => {
    const authUser = c.get("user");
    const organizationId = authUser?.organizationId || 1;
  try {
    const { date } = c.req.query();
    const targetDate = date || new Date().toISOString().split('T')[0];

    const result = await c.env.DB.prepare(`
      SELECT
        op.rank,
        op.operator_id,
        o.name as operator_name,
        op.daily_score as score,
        op.picks_per_hour,
        op.accuracy_rate,
        (SELECT COUNT(*) FROM operator_badges ob WHERE ob.operator_id = op.operator_id AND ob.date = op.date) as badges_count
      FROM operator_performance op
      JOIN operators o ON op.operator_id = o.id
      WHERE op.organization_id = ? AND op.date = ?
      ORDER BY op.daily_score DESC
      LIMIT 10
    `).bind(1, targetDate).all();

    return c.json({ leaderboard: result.results || [] });
  } catch (error) {
    return c.json({ error: 'Failed to fetch leaderboard' }, 500);
  }
});

// GET /api/labor/badges - Liste des badges disponibles
app.get('/badges', async (c) => {
    const authUser = c.get("user");
    const organizationId = authUser?.organizationId || 1;
  try {
    const result = await c.env.DB.prepare(`
      SELECT * FROM badges
      ORDER BY rarity DESC, name
    `).all();

    return c.json({ badges: result.results || [] });
  } catch (error) {
    return c.json({ error: 'Failed to fetch badges' }, 500);
  }
});

// GET /api/labor/team-stats - Statistiques d'équipe
app.get('/team-stats', async (c) => {
    const authUser = c.get("user");
    const organizationId = authUser?.organizationId || 1;
  try {
    const { date } = c.req.query();
    const targetDate = date || new Date().toISOString().split('T')[0];

    const stats = await c.env.DB.prepare(`
      SELECT
        COUNT(DISTINCT operator_id) as total_operators,
        SUM(tasks_completed) as total_picks,
        AVG(picks_per_hour) as avg_picks_per_hour,
        AVG(accuracy_rate) as avg_accuracy,
        AVG(efficiency_score) as avg_efficiency,
        SUM((SELECT COUNT(*) FROM operator_badges ob WHERE ob.operator_id = operator_performance.operator_id AND ob.date = ?)) as total_badges
      FROM operator_performance
      WHERE organization_id = ? AND date = ?
    `).bind(targetDate, 1, targetDate).first();

    return c.json({ stats: stats || {} });
  } catch (error) {
    return c.json({ error: 'Failed to fetch team stats' }, 500);
  }
});

// POST /api/labor/performance - Enregistrer une performance
app.post('/performance', async (c) => {
    const authUser = c.get("user");
    const organizationId = authUser?.organizationId || 1;
  try {
    const perf = await c.req.json();

    await c.env.DB.prepare(`
      INSERT OR REPLACE INTO operator_performance (
        organization_id, operator_id, date, tasks_completed, picks_per_hour,
        lines_per_hour, accuracy_rate, total_hours_worked, avg_task_time_seconds,
        efficiency_score, daily_score, rank, streak_days
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      1, perf.operatorId, perf.date, perf.tasksCompleted, perf.picksPerHour,
      perf.linesPerHour, perf.accuracyRate, perf.totalHoursWorked,
      perf.avgTaskTimeSeconds, perf.efficiencyScore, perf.dailyScore,
      perf.rank || 0, perf.streakDays || 0
    ).run();

    return c.json({ success: true }, 201);
  } catch (error) {
    return c.json({ error: 'Failed to save performance' }, 500);
  }
});

export default app;
