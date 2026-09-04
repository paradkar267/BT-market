import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

const JWT_SECRET = process.env.JWT_SECRET || 'bizleap_jwt_secret_key_neon_2026_super_secure';

export const requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const queryToken = req.query?.token || req.query?.auth;
  const token = authHeader ? authHeader.replace(/^Bearer\s+/i, '') : queryToken;

  if (!token) {
    return res.status(401).json({ error: 'Missing authorization header or token' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded?.id;
    if (!decoded || !userId || (typeof userId !== 'string' && typeof userId !== 'number') || !String(userId).trim()) {
      return res.status(401).json({ error: 'Invalid or expired authentication token' });
    }

    // Fetch user from Neon database
    const { rows } = await query('SELECT id, email, password_hash, full_name, avatar_url, role, purchased_templates, wishlist_templates FROM users WHERE id = $1', [userId]);
    
    if (!rows.length) {
      return res.status(401).json({ error: 'User account not found' });
    }

    req.user = rows[0];
    next();
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Auth token warning:', error.message);
    }
    return res.status(401).json({ error: 'Invalid or expired authentication token' });
  }
};

export const requireAdmin = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const queryToken = req.query?.token || req.query?.auth;
  const token = authHeader ? authHeader.replace(/^Bearer\s+/i, '') : queryToken;

  if (!token) {
    return res.status(401).json({ error: 'Missing authorization header or token' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded?.id;
    if (!decoded || !userId || (typeof userId !== 'string' && typeof userId !== 'number') || !String(userId).trim()) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    const { rows } = await query('SELECT id, email, full_name, avatar_url, role FROM users WHERE id = $1', [userId]);
    if (!rows.length) {
      return res.status(401).json({ error: 'User not found' });
    }

    const user = rows[0];
    const adminEmails = [
      (process.env.ADMIN_EMAIL || 'bizleap1@gmail.com').toLowerCase(),
      'yashparadkar63@gmail.com'
    ];

    if (user.role === 'admin' || adminEmails.includes(user.email.toLowerCase())) {
      req.user = user;
      return next();
    }

    return res.status(403).json({ error: 'Forbidden: Administrator privileges required' });
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Admin token warning:', error.message);
    }
    return res.status(401).json({ error: 'Invalid or expired authentication token' });
  }
};

export default { requireAuth, requireAdmin };
