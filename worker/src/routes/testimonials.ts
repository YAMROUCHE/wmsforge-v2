import { Hono } from 'hono';
import { optionalAuthMiddleware, authMiddleware } from '../middleware/auth';

const app = new Hono<{
  Bindings: {
    DB: D1Database;
  };
}>();

// Public routes
app.use('/public/*', optionalAuthMiddleware);

// Protected routes
app.use('/*', authMiddleware);

// GET /api/testimonials/public - Get public testimonials for landing page
app.get('/public', async (c) => {
  try {
    const result = await c.env.DB.prepare(`
      SELECT
        id, rating, title, comment,
        author_name, author_role, author_company,
        is_featured, published_at
      FROM testimonials
      WHERE is_public = true
      ORDER BY is_featured DESC, rating DESC, published_at DESC
      LIMIT 20
    `).all();

    return c.json({ testimonials: result.results || [] });
  } catch (error) {
    console.error('Error fetching public testimonials:', error);
    return c.json({ error: 'Failed to fetch testimonials' }, 500);
  }
});

// GET /api/testimonials/stats - Get statistics
app.get('/stats', async (c) => {
  const authUser = c.get('user');
  const organizationId = authUser?.organizationId;

  try {
    const stats = await c.env.DB.prepare(`
      SELECT
        COUNT(*) as total,
        AVG(rating) as average_rating,
        SUM(CASE WHEN is_public = true THEN 1 ELSE 0 END) as public_count,
        SUM(CASE WHEN is_featured = true THEN 1 ELSE 0 END) as featured_count
      FROM testimonials
      WHERE organization_id = ?
    `).bind(organizationId).first();

    return c.json({ stats });
  } catch (error) {
    console.error('Error fetching testimonial stats:', error);
    return c.json({ error: 'Failed to fetch stats' }, 500);
  }
});

// GET /api/testimonials - List all testimonials (admin)
app.get('/', async (c) => {
  const authUser = c.get('user');
  const organizationId = authUser?.organizationId;

  try {
    const result = await c.env.DB.prepare(`
      SELECT
        t.*,
        u.name as user_name,
        u.email as user_email
      FROM testimonials t
      LEFT JOIN users u ON t.user_id = u.id
      WHERE t.organization_id = ?
      ORDER BY t.created_at DESC
    `).bind(organizationId).all();

    return c.json({ testimonials: result.results || [] });
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    return c.json({ error: 'Failed to fetch testimonials' }, 500);
  }
});

// GET /api/testimonials/:id - Get single testimonial
app.get('/:id', async (c) => {
  const authUser = c.get('user');
  const organizationId = authUser?.organizationId;
  const id = c.req.param('id');

  try {
    const testimonial = await c.env.DB.prepare(`
      SELECT
        t.*,
        u.name as user_name,
        u.email as user_email
      FROM testimonials t
      LEFT JOIN users u ON t.user_id = u.id
      WHERE t.id = ? AND t.organization_id = ?
    `).bind(id, organizationId).first();

    if (!testimonial) {
      return c.json({ error: 'Testimonial not found' }, 404);
    }

    return c.json({ testimonial });
  } catch (error) {
    console.error('Error fetching testimonial:', error);
    return c.json({ error: 'Failed to fetch testimonial' }, 500);
  }
});

// POST /api/testimonials - Create a new testimonial
app.post('/', async (c) => {
  const authUser = c.get('user');
  const organizationId = authUser?.organizationId;
  const userId = authUser?.userId;

  try {
    const body = await c.req.json();
    const { rating, title, comment, author_name, author_role, author_company } = body;

    // Validation
    if (!rating || rating < 1 || rating > 5) {
      return c.json({ error: 'Rating must be between 1 and 5' }, 400);
    }
    if (!comment || comment.trim().length < 10) {
      return c.json({ error: 'Comment must be at least 10 characters' }, 400);
    }
    if (!author_name || author_name.trim().length < 2) {
      return c.json({ error: 'Author name is required' }, 400);
    }

    const result = await c.env.DB.prepare(`
      INSERT INTO testimonials (
        organization_id, user_id,
        rating, title, comment,
        author_name, author_role, author_company,
        is_verified, is_public, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, true, false, datetime('now'), datetime('now'))
    `).bind(
      organizationId,
      userId,
      rating,
      title || null,
      comment.trim(),
      author_name.trim(),
      author_role?.trim() || null,
      author_company?.trim() || null
    ).run();

    // Track that user submitted a review
    await c.env.DB.prepare(`
      UPDATE review_prompts
      SET review_submitted = true
      WHERE user_id = ? AND organization_id = ?
    `).bind(userId, organizationId).run();

    return c.json({
      success: true,
      message: 'Thank you for your review! It will be reviewed by our team.',
      testimonialId: result.meta.last_row_id
    });
  } catch (error) {
    console.error('Error creating testimonial:', error);
    return c.json({ error: 'Failed to create testimonial' }, 500);
  }
});

// PATCH /api/testimonials/:id - Update testimonial (admin)
app.patch('/:id', async (c) => {
  const authUser = c.get('user');
  const organizationId = authUser?.organizationId;
  const id = c.req.param('id');

  try {
    const body = await c.req.json();
    const { is_public, is_featured, title, comment } = body;

    // Build dynamic update query
    const updates: string[] = [];
    const values: any[] = [];

    if (typeof is_public === 'boolean') {
      updates.push('is_public = ?');
      values.push(is_public);
      if (is_public && !body.published_at) {
        updates.push('published_at = datetime("now")');
      }
    }
    if (typeof is_featured === 'boolean') {
      updates.push('is_featured = ?');
      values.push(is_featured);
    }
    if (title !== undefined) {
      updates.push('title = ?');
      values.push(title);
    }
    if (comment !== undefined) {
      updates.push('comment = ?');
      values.push(comment);
    }

    if (updates.length === 0) {
      return c.json({ error: 'No fields to update' }, 400);
    }

    updates.push('updated_at = datetime("now")');
    values.push(id, organizationId);

    await c.env.DB.prepare(`
      UPDATE testimonials
      SET ${updates.join(', ')}
      WHERE id = ? AND organization_id = ?
    `).bind(...values).run();

    return c.json({ success: true, message: 'Testimonial updated' });
  } catch (error) {
    console.error('Error updating testimonial:', error);
    return c.json({ error: 'Failed to update testimonial' }, 500);
  }
});

// DELETE /api/testimonials/:id - Delete testimonial
app.delete('/:id', async (c) => {
  const authUser = c.get('user');
  const organizationId = authUser?.organizationId;
  const id = c.req.param('id');

  try {
    await c.env.DB.prepare(`
      DELETE FROM testimonials
      WHERE id = ? AND organization_id = ?
    `).bind(id, organizationId).run();

    return c.json({ success: true, message: 'Testimonial deleted' });
  } catch (error) {
    console.error('Error deleting testimonial:', error);
    return c.json({ error: 'Failed to delete testimonial' }, 500);
  }
});

// POST /api/testimonials/prompt/track - Track review prompt shown
app.post('/prompt/track', async (c) => {
  const authUser = c.get('user');
  const organizationId = authUser?.organizationId;
  const userId = authUser?.userId;

  try {
    const body = await c.req.json();
    const { prompt_type, was_clicked } = body;

    // Calculate metrics
    const userStats = await c.env.DB.prepare(`
      SELECT
        julianday('now') - julianday(u.created_at) as days_since_signup,
        (SELECT COUNT(*) FROM orders WHERE organization_id = ?) as orders_processed,
        (SELECT COUNT(*) FROM tasks WHERE organization_id = ?) as tasks_completed
      FROM users u
      WHERE u.id = ?
    `).bind(organizationId, organizationId, userId).first();

    await c.env.DB.prepare(`
      INSERT INTO review_prompts (
        user_id, organization_id,
        prompt_type, was_clicked,
        days_since_signup, orders_processed, tasks_completed,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `).bind(
      userId,
      organizationId,
      prompt_type || 'in_app',
      was_clicked || false,
      Math.floor((userStats as any)?.days_since_signup || 0),
      (userStats as any)?.orders_processed || 0,
      (userStats as any)?.tasks_completed || 0
    ).run();

    return c.json({ success: true });
  } catch (error) {
    console.error('Error tracking review prompt:', error);
    return c.json({ error: 'Failed to track prompt' }, 500);
  }
});

// GET /api/testimonials/prompt/should-show - Check if should show prompt
app.get('/prompt/should-show', async (c) => {
  const authUser = c.get('user');
  const userId = authUser?.userId;
  const organizationId = authUser?.organizationId;

  try {
    // Check if user already left a review
    const existingReview = await c.env.DB.prepare(`
      SELECT id FROM testimonials WHERE user_id = ? AND organization_id = ?
    `).bind(userId, organizationId).first();

    if (existingReview) {
      return c.json({ shouldShow: false, reason: 'already_reviewed' });
    }

    // Check how many times prompt was shown (max 3 times)
    const promptCount = await c.env.DB.prepare(`
      SELECT COUNT(*) as count FROM review_prompts
      WHERE user_id = ? AND organization_id = ?
    `).bind(userId, organizationId).first();

    if (promptCount && (promptCount as any).count >= 3) {
      return c.json({ shouldShow: false, reason: 'max_prompts_reached' });
    }

    // Check if user dismissed recently (within 7 days)
    const recentPrompt = await c.env.DB.prepare(`
      SELECT prompt_shown_at FROM review_prompts
      WHERE user_id = ? AND organization_id = ? AND was_clicked = false
      ORDER BY prompt_shown_at DESC LIMIT 1
    `).bind(userId, organizationId).first();

    if (recentPrompt) {
      const daysSince = (Date.now() - new Date((recentPrompt as any).prompt_shown_at).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSince < 7) {
        return c.json({ shouldShow: false, reason: 'dismissed_recently' });
      }
    }

    // Check if user is active enough (30+ days, 5+ orders OR 20+ tasks)
    const userStats = await c.env.DB.prepare(`
      SELECT
        julianday('now') - julianday(u.created_at) as days_since_signup,
        (SELECT COUNT(*) FROM orders WHERE organization_id = ?) as orders_count,
        (SELECT COUNT(*) FROM tasks WHERE organization_id = ?) as tasks_count
      FROM users u
      WHERE u.id = ?
    `).bind(organizationId, organizationId, userId).first();

    const daysSinceSignup = (userStats as any)?.days_since_signup || 0;
    const ordersCount = (userStats as any)?.orders_count || 0;
    const tasksCount = (userStats as any)?.tasks_count || 0;

    const isActiveEnough = daysSinceSignup >= 30 && (ordersCount >= 5 || tasksCount >= 20);

    if (!isActiveEnough) {
      return c.json({
        shouldShow: false,
        reason: 'not_active_enough',
        meta: { daysSinceSignup, ordersCount, tasksCount }
      });
    }

    return c.json({
      shouldShow: true,
      meta: { daysSinceSignup, ordersCount, tasksCount }
    });
  } catch (error) {
    // If tables don't exist (testimonials, review_prompts, tasks), gracefully return false
    console.error('Error checking if should show prompt (tables may not exist):', error);
    return c.json({ shouldShow: false, reason: 'tables_not_found' });
  }
});

export default app;
