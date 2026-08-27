import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { code, cartTotal, userId, userEmail } = req.body || {};
    if (!code) {
      return res.status(400).json({ valid: false, error: 'Please enter a coupon code' });
    }

    const cleanCode = code.trim().toUpperCase();
    const totalAmount = parseFloat(cartTotal) || 0;

    // Check if user has already used this coupon (via coupon_redemptions table OR user_metadata)
    if (userId || userEmail) {
      try {
        let query = supabase
          .from('coupon_redemptions')
          .select('id')
          .ilike('coupon_code', cleanCode);

        if (userId && userEmail) {
          query = query.or(`user_id.eq.${userId},user_email.eq.${userEmail}`);
        } else if (userId) {
          query = query.eq('user_id', userId);
        } else if (userEmail) {
          query = query.eq('user_email', userEmail);
        }

        const { data: existingRedemptions, error: redemptionError } = await query;
        if (!redemptionError && existingRedemptions && existingRedemptions.length > 0) {
          return res.status(400).json({
            valid: false,
            error: `You have already redeemed coupon '${cleanCode}'. It can only be used once per customer.`
          });
        }
      } catch (checkErr) {
        console.warn('Coupon redemptions check note:', checkErr?.message);
      }

      // Double-check user_metadata for robust 1-per-user enforcement
      if (userId && supabase.auth?.admin?.getUserById) {
        try {
          const { data: uData, error: uErr } = await supabase.auth.admin.getUserById(userId);
          if (!uErr && uData?.user?.user_metadata?.used_coupons) {
            const usedList = Array.isArray(uData.user.user_metadata.used_coupons)
              ? uData.user.user_metadata.used_coupons.map(c => String(c).toUpperCase())
              : [];
            if (usedList.includes(cleanCode)) {
              return res.status(400).json({
                valid: false,
                error: `You have already redeemed coupon '${cleanCode}'. It can only be used once per customer.`
              });
            }
          }
        } catch (uMetaErr) {
          console.warn('User metadata coupon check note:', uMetaErr?.message);
        }
      }
    }

    const { data: coupon, error } = await supabase
      .from('coupons')
      .select('*')
      .ilike('code', cleanCode)
      .single();

    if (error || !coupon) {
      return res.status(404).json({ valid: false, error: 'Invalid coupon code' });
    }

    if (!coupon.is_active) {
      return res.status(400).json({ valid: false, error: 'This coupon is currently inactive' });
    }

    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return res.status(400).json({ valid: false, error: 'This coupon has expired' });
    }

    if (coupon.usage_limit && coupon.times_used >= coupon.usage_limit) {
      return res.status(400).json({ valid: false, error: 'Coupon usage limit has been reached' });
    }

    if (coupon.min_order_amount && totalAmount < coupon.min_order_amount) {
      return res.status(400).json({ 
        valid: false, 
        error: `Minimum order of ₹${coupon.min_order_amount} required to use this coupon` 
      });
    }

    let discount = 0;
    if (coupon.discount_type === 'percentage') {
      discount = Math.round((totalAmount * coupon.discount_value) / 100);
    } else {
      discount = Math.min(coupon.discount_value, totalAmount);
    }

    const finalTotal = Math.max(0, totalAmount - discount);

    return res.status(200).json({
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value,
        min_order_amount: coupon.min_order_amount
      },
      discount,
      finalTotal
    });

  } catch (err) {
    console.error('Coupon validation handler error:', err);
    return res.status(500).json({ valid: false, error: 'Server error validating coupon' });
  }
}
