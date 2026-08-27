import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'bizleap1@gmail.com';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Verify Admin Auth Header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or malformed Authorization header' });
  }

  const token = authHeader.split(' ')[1];
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);

  if (authError || !user) {
    return res.status(401).json({ error: 'Invalid authentication token' });
  }

  if (user.email !== ADMIN_EMAIL) {
    return res.status(403).json({ error: 'Forbidden: Admin privileges required' });
  }

  try {
    if (req.method === 'GET') {
      const { data: coupons, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn("Coupons query note:", error.message);
        return res.json([]);
      }

      return res.status(200).json(coupons || []);
    }

    if (req.method === 'POST') {
      const { code, discount_type, discount_value, min_order_amount, usage_limit, expires_at, is_active } = req.body || {};
      
      if (!code || !discount_type || !discount_value) {
        return res.status(400).json({ error: 'Code, discount type, and discount value are required' });
      }

      const cleanCode = code.trim().toUpperCase();
      const valueNum = parseFloat(discount_value);

      if (isNaN(valueNum) || valueNum <= 0) {
        return res.status(400).json({ error: 'Discount value must be a positive number' });
      }

      const newCoupon = {
        code: cleanCode,
        discount_type,
        discount_value: valueNum,
        min_order_amount: min_order_amount ? parseFloat(min_order_amount) : 0,
        usage_limit: usage_limit ? parseInt(usage_limit, 10) : null,
        times_used: 0,
        expires_at: expires_at ? new Date(expires_at).toISOString() : null,
        is_active: is_active !== undefined ? is_active : true
      };

      const { data, error } = await supabase
        .from('coupons')
        .insert([newCoupon])
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          return res.status(409).json({ error: `Coupon code '${cleanCode}' already exists` });
        }
        throw error;
      }

      return res.status(201).json({ success: true, coupon: data });
    }

    if (req.method === 'PATCH') {
      let id = req.body?.id || req.query?.id;
      if (!id && req.url && req.url.includes('?')) {
        const urlParams = new URLSearchParams(req.url.split('?')[1]);
        id = urlParams.get('id');
      }
      if (!id && req.url) {
        const parts = req.url.split('?')[0].split('/');
        const last = parts[parts.length - 1];
        if (last && last !== 'admin-coupons' && last !== 'coupons' && !isNaN(Number(last))) {
          id = last;
        }
      }

      if (!id) return res.status(400).json({ error: 'Coupon ID is required' });

      const { id: _ignored, ...updates } = req.body || {};

      if (updates.code) updates.code = updates.code.trim().toUpperCase();
      if (updates.discount_value) updates.discount_value = parseFloat(updates.discount_value);
      if (updates.min_order_amount !== undefined) updates.min_order_amount = parseFloat(updates.min_order_amount);
      if (updates.usage_limit !== undefined) updates.usage_limit = updates.usage_limit ? parseInt(updates.usage_limit, 10) : null;
      if (updates.expires_at !== undefined) updates.expires_at = updates.expires_at ? new Date(updates.expires_at).toISOString() : null;

      const { data, error } = await supabase
        .from('coupons')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return res.status(200).json({ success: true, coupon: data });
    }

    if (req.method === 'DELETE') {
      let id = req.query?.id || req.body?.id;
      if (!id && req.url && req.url.includes('?')) {
        const urlParams = new URLSearchParams(req.url.split('?')[1]);
        id = urlParams.get('id');
      }
      if (!id && req.url) {
        const parts = req.url.split('?')[0].split('/');
        const last = parts[parts.length - 1];
        if (last && last !== 'admin-coupons' && last !== 'coupons' && !isNaN(Number(last))) {
          id = last;
        }
      }

      if (!id) return res.status(400).json({ error: 'Coupon ID is required' });

      const { error } = await supabase
        .from('coupons')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (err) {
    console.error('Admin coupons handler error:', err);
    return res.status(500).json({ error: err.message });
  }
}
