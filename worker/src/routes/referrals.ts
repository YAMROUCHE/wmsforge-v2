import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth';

const app = new Hono<{
  Bindings: {
    DB: D1Database;
  };
}>();

// Toutes les routes nécessitent authentification
app.use('/*', authMiddleware);

// Générer un code de parrainage unique
function generateReferralCode(userName: string): string {
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
  const namePart = userName.substring(0, 3).toUpperCase();
  return `${namePart}${randomPart}`;
}

// GET /api/referrals - Récupérer les infos de parrainage de l'utilisateur
app.get('/', async (c) => {
  const authUser = c.get('user');
  const userId = authUser?.userId;
  const organizationId = authUser?.organizationId;

  try {
    // Vérifier si l'utilisateur a déjà un code de parrainage
    let referral = await c.env.DB.prepare(`
      SELECT * FROM referrals
      WHERE user_id = ? AND organization_id = ?
    `).bind(userId, organizationId).first();

    // Si pas de code, en créer un
    if (!referral) {
      const user = await c.env.DB.prepare(`
        SELECT name FROM users WHERE id = ?
      `).bind(userId).first();

      const referralCode = generateReferralCode((user as any)?.name || 'USER');

      const result = await c.env.DB.prepare(`
        INSERT INTO referrals (user_id, organization_id, referral_code, created_at, updated_at)
        VALUES (?, ?, ?, datetime('now'), datetime('now'))
      `).bind(userId, organizationId, referralCode).run();

      referral = {
        id: result.meta.last_row_id,
        user_id: userId,
        organization_id: organizationId,
        referral_code: referralCode,
        referrals_count: 0,
        credits_earned: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    }

    // Récupérer les conversions
    const conversions = await c.env.DB.prepare(`
      SELECT
        rc.*,
        u.name as referred_user_name,
        u.email as referred_user_email,
        o.name as referred_org_name
      FROM referral_conversions rc
      LEFT JOIN users u ON rc.referred_user_id = u.id
      LEFT JOIN organizations o ON rc.referred_organization_id = o.id
      WHERE rc.referrer_user_id = ?
      ORDER BY rc.converted_at DESC
    `).bind(userId).all();

    return c.json({
      referral,
      conversions: conversions.results || [],
      share_url: `${c.req.header('origin') || 'https://1wms.io'}/auth?ref=${referral.referral_code}`
    });
  } catch (error) {
    console.error('Error fetching referral data:', error);
    return c.json({ error: 'Failed to fetch referral data' }, 500);
  }
});

// GET /api/referrals/stats - Statistiques de parrainage
app.get('/stats', async (c) => {
  const authUser = c.get('user');
  const userId = authUser?.userId;

  try {
    const stats = await c.env.DB.prepare(`
      SELECT
        COUNT(*) as total_referrals,
        SUM(reward_amount) as total_credits,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_referrals,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_referrals
      FROM referral_conversions
      WHERE referrer_user_id = ?
    `).bind(userId).first();

    return c.json({ stats });
  } catch (error) {
    console.error('Error fetching referral stats:', error);
    return c.json({ error: 'Failed to fetch stats' }, 500);
  }
});

// POST /api/referrals/validate - Valider un code de parrainage (lors de l'inscription)
app.post('/validate', async (c) => {
  try {
    const body = await c.req.json();
    const { referral_code } = body;

    if (!referral_code) {
      return c.json({ valid: false, error: 'No referral code provided' }, 400);
    }

    const referral = await c.env.DB.prepare(`
      SELECT
        r.*,
        u.name as referrer_name
      FROM referrals r
      LEFT JOIN users u ON r.user_id = u.id
      WHERE r.referral_code = ?
    `).bind(referral_code.toUpperCase()).first();

    if (!referral) {
      return c.json({ valid: false, error: 'Invalid referral code' }, 404);
    }

    return c.json({
      valid: true,
      referral: {
        code: referral.referral_code,
        referrer_name: referral.referrer_name
      }
    });
  } catch (error) {
    console.error('Error validating referral code:', error);
    return c.json({ error: 'Failed to validate code' }, 500);
  }
});

// POST /api/referrals/track - Tracker une conversion de parrainage
app.post('/track', async (c) => {
  const authUser = c.get('user');
  const userId = authUser?.userId;
  const organizationId = authUser?.organizationId;

  try {
    const body = await c.req.json();
    const { referral_code } = body;

    if (!referral_code) {
      return c.json({ error: 'No referral code provided' }, 400);
    }

    // Récupérer le parrain
    const referral = await c.env.DB.prepare(`
      SELECT * FROM referrals WHERE referral_code = ?
    `).bind(referral_code.toUpperCase()).first();

    if (!referral) {
      return c.json({ error: 'Invalid referral code' }, 404);
    }

    // Vérifier qu'on ne se parraine pas soi-même
    if (referral.user_id === userId) {
      return c.json({ error: 'Cannot refer yourself' }, 400);
    }

    // Créer la conversion
    const rewardAmount = 50; // 50€ de crédit pour le parrain
    await c.env.DB.prepare(`
      INSERT INTO referral_conversions (
        referrer_user_id, referred_user_id, referred_organization_id,
        referral_code, reward_amount, reward_type, status, converted_at
      ) VALUES (?, ?, ?, ?, ?, 'credit', 'pending', datetime('now'))
    `).bind(
      referral.user_id,
      userId,
      organizationId,
      referral_code.toUpperCase(),
      rewardAmount
    ).run();

    // Incrémenter le compteur de parrainages
    await c.env.DB.prepare(`
      UPDATE referrals
      SET referrals_count = referrals_count + 1,
          credits_earned = credits_earned + ?,
          updated_at = datetime('now')
      WHERE id = ?
    `).bind(rewardAmount, referral.id).run();

    // Marquer l'utilisateur comme parrainé
    await c.env.DB.prepare(`
      UPDATE users
      SET referred_by_code = ?
      WHERE id = ?
    `).bind(referral_code.toUpperCase(), userId).run();

    return c.json({
      success: true,
      message: `You've been referred by ${referral_code}! They'll receive ${rewardAmount}€ credit.`,
      reward_amount: rewardAmount
    });
  } catch (error) {
    console.error('Error tracking referral:', error);
    return c.json({ error: 'Failed to track referral' }, 500);
  }
});

export default app;
