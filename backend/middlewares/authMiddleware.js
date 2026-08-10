import { supabaseAdmin } from '../config/supabase.js';

export const requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!supabaseAdmin) {
    return res.status(500).json({ error: 'Server misconfiguration: Missing SUPABASE_SERVICE_ROLE_KEY' });
  }

  if (!authHeader) {
    return res.status(401).json({ error: 'Missing authorization header' });
  }

  const token = authHeader.replace('Bearer ', '');

  try {
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: 'Internal server error during authentication' });
  }
};

export const requireAdmin = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!supabaseAdmin) {
    return res.status(500).json({ error: 'Server misconfiguration' });
  }

  if (!authHeader) {
    return res.status(401).json({ error: 'Missing authorization header' });
  }

  const token = authHeader.replace('Bearer ', '');

  try {
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase() || 'bizleap1@gmail.com';
    if (user.email?.toLowerCase() !== adminEmail) {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Admin Auth error:', error);
    res.status(500).json({ error: 'Internal server error during authentication' });
  }
};
