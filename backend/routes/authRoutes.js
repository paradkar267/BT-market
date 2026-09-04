import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';
import { requireAuth } from '../middlewares/authMiddleware.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'bizleap_jwt_secret_key_neon_2026_super_secure';
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'bizleap1@gmail.com').toLowerCase();

// Helper to sign JWT
const signToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
};

// Helper to get only active, non-refunded, non-revoked purchased template IDs
const getActiveUserPurchasedIds = async (userId, fallbackList = []) => {
  try {
    const latestRes = await query(`
      SELECT DISTINCT ON (template_id) template_id, refund_status 
      FROM purchases 
      WHERE user_id = $1 
      ORDER BY template_id, created_at DESC
    `, [userId]);

    const activeIds = new Set();
    const inactiveIds = new Set();

    latestRes.rows.forEach(r => {
      const tId = parseInt(r.template_id, 10);
      if (r.refund_status === 'processed' || r.refund_status === 'revoked') {
        inactiveIds.add(tId);
      } else {
        activeIds.add(tId);
      }
    });

    let rawList = [];
    if (Array.isArray(fallbackList)) rawList = fallbackList;
    else if (typeof fallbackList === 'string') {
      try { rawList = JSON.parse(fallbackList); } catch { rawList = []; }
    }

    const combined = [...new Set([...rawList.map(Number), ...activeIds])]
      .filter(id => !isNaN(id) && !inactiveIds.has(id));

    // Keep database users table strictly in sync
    await query(`
      UPDATE users SET purchased_templates = $1, updated_at = NOW() WHERE id = $2
    `, [JSON.stringify(combined), userId]).catch(() => {});

    return combined;
  } catch (err) {
    console.error('Error fetching active purchases:', err);
    return [];
  }
};

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password, fullName } = req.body || {};

    const cleanEmail = String(email || '').trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || cleanEmail.length > 255 || !emailRegex.test(cleanEmail)) {
      return res.status(400).json({ error: 'Please enter a valid email address' });
    }

    if (!password || typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }

    // Ensure password includes at least one number or special character
    if (!/(?=.*[0-9])|(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(password)) {
      return res.status(400).json({ error: 'Password must include at least one number or special symbol' });
    }

    // Check if user already exists
    const existing = await query('SELECT id FROM users WHERE email = $1', [cleanEmail]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const role = cleanEmail === ADMIN_EMAIL ? 'admin' : 'user';
    const cleanName = String(fullName || '').trim().substring(0, 100) || cleanEmail.split('@')[0];

    const insertResult = await query(`
      INSERT INTO users (email, password_hash, full_name, role)
      VALUES ($1, $2, $3, $4)
      RETURNING id, email, full_name, avatar_url, role, purchased_templates, wishlist_templates, created_at
    `, [cleanEmail, passwordHash, cleanName, role]);

    const newUser = insertResult.rows[0];
    const token = signToken(newUser);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        full_name: newUser.full_name,
        avatar_url: newUser.avatar_url,
        role: newUser.role,
        purchased_templates: newUser.purchased_templates || [],
        wishlist_templates: newUser.wishlist_templates || []
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const result = await query(`
      SELECT id, email, password_hash, full_name, avatar_url, role, purchased_templates, wishlist_templates
      FROM users WHERE email = $1
    `, [cleanEmail]);

    if (!result.rows.length) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = result.rows[0];

    if (!user.password_hash || typeof user.password_hash !== 'string') {
      return res.status(401).json({ error: 'This account uses Google Sign-In. Please sign in with Google.' });
    }

    const isMatch = await bcrypt.compare(String(password), user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Auto-promote admin email if not already admin
    if (cleanEmail === ADMIN_EMAIL && user.role !== 'admin') {
      await query('UPDATE users SET role = $1 WHERE id = $2', ['admin', user.id]);
      user.role = 'admin';
    }

    // Fetch active purchased templates from purchases table (excluding refunded)
    const combinedPurchases = await getActiveUserPurchasedIds(user.id, user.purchased_templates);

    const token = signToken(user);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        avatar_url: user.avatar_url,
        role: user.role,
        purchased_templates: combinedPurchases,
        wishlist_templates: user.wishlist_templates || []
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// POST /api/auth/google - Verify Google token and login/register in Neon
router.post('/google', async (req, res) => {
  try {
    let email, name, picture;

    if (req.body.credential) {
      const googleRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${req.body.credential}`);
      if (!googleRes.ok) {
        return res.status(401).json({ error: 'Invalid Google authentication token' });
      }
      const payload = await googleRes.json();
      if (!payload.email || (payload.email_verified !== 'true' && payload.email_verified !== true)) {
        return res.status(400).json({ error: 'Google account email is not verified' });
      }
      email = payload.email;
      name = payload.name;
      picture = payload.picture;
    } else if (req.body.accessToken) {
      const userinfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${req.body.accessToken}` }
      });
      if (!userinfoRes.ok) {
        return res.status(401).json({ error: 'Invalid Google access token' });
      }
      const payload = await userinfoRes.json();
      if (!payload.email || (payload.email_verified !== 'true' && payload.email_verified !== true)) {
        return res.status(400).json({ error: 'Google account email is not verified' });
      }
      email = payload.email;
      name = payload.name;
      picture = payload.picture;
    } else {
      return res.status(400).json({ error: 'Google credential or access token is required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const role = cleanEmail === 'bizleap1@gmail.com' ? 'admin' : 'user';

    // Upsert into Neon users table
    const upsertResult = await query(`
      INSERT INTO users (email, full_name, avatar_url, role)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (email) DO UPDATE SET
        full_name = COALESCE(EXCLUDED.full_name, users.full_name),
        avatar_url = COALESCE(EXCLUDED.avatar_url, users.avatar_url),
        updated_at = NOW()
      RETURNING id, email, full_name, avatar_url, role, purchased_templates, wishlist_templates, created_at
    `, [cleanEmail, name || 'User', picture || '', role]);

    const user = upsertResult.rows[0];

    // Fetch active purchases for this user (excluding refunded)
    const allPurchases = await getActiveUserPurchasedIds(user.id, user.purchased_templates);

    const token = signToken(user);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        avatar_url: user.avatar_url,
        role: user.role,
        purchased_templates: allPurchases,
        wishlist_templates: user.wishlist_templates || []
      }
    });
  } catch (error) {
    console.error('Google auth error:', error);
    const msg = error.message?.includes('DATABASE_URL')
      ? 'Database not configured: Please add DATABASE_URL in Render Dashboard Environment'
      : (error.message || 'Google authentication failed');
    res.status(500).json({ error: msg });
  }
});

// GET /api/auth/me
router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = req.user;

    // Fetch active live purchases from purchases table (excluding refunded)
    const combinedPurchases = await getActiveUserPurchasedIds(user.id, user.purchased_templates);

    res.json({
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        avatar_url: user.avatar_url,
        role: user.role,
        has_password: !!user.password_hash,
        purchased_templates: combinedPurchases,
        wishlist_templates: user.wishlist_templates || []
      }
    });
  } catch (error) {
    console.error('Auth check error:', error);
    res.status(500).json({ error: 'Failed to verify session' });
  }
});

// PUT /api/auth/password - Set or update password
router.put('/password', requireAuth, async (req, res) => {
  try {
    const { newPassword, currentPassword } = req.body || {};
    const userId = req.user.id;

    if (!newPassword || typeof newPassword !== 'string' || newPassword.trim().length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters long' });
    }

    // Fetch user password_hash
    const { rows } = await query('SELECT password_hash FROM users WHERE id = $1', [userId]);
    if (!rows.length) {
      return res.status(404).json({ error: 'User not found' });
    }

    const existingHash = rows[0].password_hash;

    // If user provided current password, verify it matches
    if (existingHash && currentPassword) {
      const isMatch = await bcrypt.compare(String(currentPassword), existingHash);
      if (!isMatch) {
        return res.status(400).json({ error: 'Current password does not match' });
      }
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword.trim(), salt);

    // Update in Neon database
    await query(`
      UPDATE users 
      SET password_hash = $1,
          updated_at = NOW()
      WHERE id = $2
    `, [hashedPassword, userId]);

    res.json({ 
      success: true, 
      message: existingHash 
        ? 'Password updated successfully!' 
        : 'Password set successfully! You can now log in with your email and password.' 
    });
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({ error: error.message || 'Failed to update password' });
  }
});

// Aliases for compatibility
router.post('/password', requireAuth, (req, res, next) => {
  router.handle({ ...req, method: 'PUT', url: '/password' }, res, next);
});
router.put('/update-password', requireAuth, (req, res, next) => {
  router.handle({ ...req, method: 'PUT', url: '/password' }, res, next);
});

// PUT /api/auth/profile
router.put('/profile', requireAuth, async (req, res) => {
  try {
    const { fullName, avatarUrl } = req.body;
    const userId = req.user.id;

    const result = await query(`
      UPDATE users 
      SET full_name = COALESCE($1, full_name),
          avatar_url = COALESCE($2, avatar_url),
          updated_at = NOW()
      WHERE id = $3
      RETURNING id, email, full_name, avatar_url, role, purchased_templates, wishlist_templates
    `, [fullName, avatarUrl, userId]);

    res.json({ success: true, user: result.rows[0] });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// POST /api/auth/sync-wishlist
router.post('/sync-wishlist', requireAuth, async (req, res) => {
  try {
    const { wishlistTemplates } = req.body;
    const userId = req.user.id;

    await query(`
      UPDATE users 
      SET wishlist_templates = $1,
          updated_at = NOW()
      WHERE id = $2
    `, [JSON.stringify(wishlistTemplates || []), userId]);

    res.json({ success: true });
  } catch (error) {
    console.error('Sync wishlist error:', error);
    res.status(500).json({ error: 'Failed to sync wishlist' });
  }
});

export default router;
