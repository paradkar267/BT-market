import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = (supabaseUrl && supabaseServiceKey)
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

export default async function handler(req, res) {
  // CORS setup for Vercel
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  if (!supabaseAdmin) {
    return res.status(500).json({ error: 'Server configuration error: Missing Supabase Admin key' });
  }

  // Auth verification
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Missing authorization header' });
  }

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

  if (userError || !user) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

    const { paymentId, cartItems, couponCode, couponId } = req.body;
  if (!paymentId || !cartItems || !cartItems.length) {
    return res.status(400).json({ error: 'Missing payment information or cart is empty' });
  }

  try {
    const templateIds = cartItems.map(item => item.id);
    const cartTotal = cartItems.reduce((sum, item) => sum + parseFloat(item.price), 0);

    // 1. Verify Payment (Mock vs Real vs Sandbox)
    const razorpaySecret = process.env.RAZORPAY_SECRET || process.env.VITE_RAZORPAY_TEST_SECRET;
    const razorpayKey = process.env.RAZORPAY_KEY || process.env.VITE_RAZORPAY_TEST_KEY || process.env.VITE_RAZORPAY_KEY || 'rzp_test_T7Lp0cSak0qDp4';

    if (paymentId.startsWith('pay_mock_') || paymentId.startsWith('mock_') || !razorpaySecret) {
      console.log(`Payment access granted (sandbox/mock mode) for user ${user.id}: ${paymentId}`);
    } else {
      try {
        const authHeaderBasic = 'Basic ' + Buffer.from(`${razorpayKey}:${razorpaySecret}`).toString('base64');
        const response = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}`, {
          method: 'GET',
          headers: { 'Authorization': authHeaderBasic }
        });

        if (!response.ok) {
          return res.status(400).json({ error: 'Invalid Payment ID' });
        }

        const paymentDetails = await response.json();
        if (paymentDetails.status !== 'captured' && paymentDetails.status !== 'authorized') {
          return res.status(400).json({ error: 'Payment was not successful' });
        }
      } catch (verifyErr) {
        console.error("Razorpay verification fetch error:", verifyErr);
        return res.status(500).json({ error: 'Payment verification service failed' });
      }
    }

    // 2. Grant Access: Update metadata & insert into purchases
    const { data: userData } = await supabaseAdmin.auth.admin.getUserById(user.id);
    const existingIds = (userData?.user?.user_metadata?.purchased_templates || []).map(String);
    const newIds = templateIds.map(String);
    const finalIds = [...new Set([...existingIds, ...newIds])];

    const currentUsedCoupons = userData?.user?.user_metadata?.used_coupons || [];
    const updatedUsedCoupons = couponCode && !currentUsedCoupons.includes(couponCode)
      ? [...currentUsedCoupons, couponCode]
      : currentUsedCoupons;

    await supabaseAdmin.auth.admin.updateUserById(user.id, {
      user_metadata: { 
        purchased_templates: finalIds,
        used_coupons: updatedUsedCoupons
      }
    });

    const purchaseRecords = cartItems.map(item => ({
      user_id: user.id,
      template_id: typeof item.id === 'string' && !isNaN(item.id) ? parseInt(item.id, 10) : item.id,
      payment_id: paymentId
    }));

    const { error: dbError } = await supabaseAdmin
      .from('purchases')
      .insert(purchaseRecords);

    if (dbError) {
      console.warn("Database purchase insert note:", dbError.message);
    }

    // Record Coupon Redemption
    if (couponCode) {
      try {
        await supabaseAdmin.from('coupon_redemptions').insert([{
          coupon_id: couponId || null,
          coupon_code: couponCode,
          user_id: user.id,
          user_email: user.email,
          payment_id: paymentId
        }]);

        if (couponId) {
          const { data: cData } = await supabaseAdmin.from('coupons').select('times_used').eq('id', couponId).single();
          await supabaseAdmin.from('coupons').update({ times_used: (cData?.times_used || 0) + 1 }).eq('id', couponId);
        }
      } catch (redeemErr) {
        console.warn("Backend coupon redemption tracking note:", redeemErr?.message);
      }
    }

    return res.status(200).json({ success: true, message: 'Payment verified and access granted' });
  } catch (error) {
    console.error("Error verifying payment:", error);
    return res.status(500).json({ error: 'Internal server error during verification' });
  }
}
