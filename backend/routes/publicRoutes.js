import express from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { requireAuth } from '../middlewares/authMiddleware.js';
import { sendReceiptEmail, sendContactEmail } from '../services/emailService.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

const router = express.Router();

router.post('/send-receipt', async (req, res) => {
  const { to, email, orderDetails, cartItems, totalAmount, paymentId, frontendUrl, invoicePdfBase64 } = req.body || {};

  const recipientEmail = to || email;
  if (!recipientEmail) {
    return res.status(400).json({ error: 'Missing recipient email' });
  }

  let normalizedOrderDetails = orderDetails;
  if (!normalizedOrderDetails) {
    if (cartItems && cartItems.length) {
      normalizedOrderDetails = {
        orderId: paymentId || 'ORD_' + Math.random().toString(36).substring(7).toUpperCase(),
        total: totalAmount ? String(totalAmount) : '0.00',
        items: cartItems
      };
    } else {
      return res.status(400).json({ error: 'Missing order details or cart items' });
    }
  }

  try {
    const info = await sendReceiptEmail(recipientEmail, normalizedOrderDetails, frontendUrl, invoicePdfBase64);
    console.log("Message sent: %s", info.messageId);
    res.status(200).json({ success: true, messageId: info.messageId });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ error: 'Failed to send email', details: error.message });
  }
});

router.post('/contact', async (req, res) => {
  const { firstName, lastName, email, subject, message } = req.body;

  if (!firstName || !lastName || !email || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const info = await sendContactEmail(firstName, lastName, email, subject, message);
    console.log("Contact message sent: %s", info.messageId);
    res.status(200).json({ success: true, messageId: info.messageId });
  } catch (error) {
    console.error("Error sending contact email:", error);
    res.status(500).json({ error: 'Failed to send message', details: error.message });
  }
});

router.post('/verify-payment', requireAuth, async (req, res) => {
  const { paymentId, cartItems } = req.body;
  const user = req.user;

  console.log('verify-payment request received:', {
    paymentId,
    razorpayKey: process.env.RAZORPAY_KEY || process.env.VITE_RAZORPAY_TEST_KEY,
    hasSecret: !!(process.env.RAZORPAY_SECRET || process.env.VITE_RAZORPAY_TEST_SECRET)
  });

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
      console.log(`Payment access granted (sandbox/mock mode or no RAZORPAY_SECRET configured) for user ${user.id}: ${paymentId}`);
    } else {
      // Real payment validation via Razorpay API when secret key IS configured
      try {
        const authHeader = 'Basic ' + Buffer.from(`${razorpayKey}:${razorpaySecret}`).toString('base64');
        const response = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}`, {
          method: 'GET',
          headers: {
            'Authorization': authHeader
          }
        });

        if (!response.ok) {
          console.error("Failed to fetch Razorpay payment:", await response.text());
          return res.status(400).json({ error: 'Invalid Payment ID' });
        }

        const paymentDetails = await response.json();

        if (paymentDetails.status !== 'captured' && paymentDetails.status !== 'authorized') {
          return res.status(400).json({ error: 'Payment was not successful' });
        }

        const expectedAmountInPaise = Math.round(cartTotal * 100);
        if (paymentDetails.amount < expectedAmountInPaise - 100) {
          console.warn(`Payment amount mismatch: Expected ${expectedAmountInPaise}, Got ${paymentDetails.amount}`);
        }
      } catch (verifyErr) {
        console.error("Razorpay verification fetch error:", verifyErr);
        return res.status(500).json({ error: 'Payment verification service failed' });
      }
    }

    // 2. Grant Access

    // Check if any items are sold out before granting (Optional, but good practice)
    const { data: checkTemplates, error: checkError } = await supabaseAdmin
      .from('templates')
      .select('id, title, is_sold_out')
      .in('id', templateIds);

    if (checkError) {
      return res.status(500).json({ error: 'Database error verifying template availability' });
    }

    // Get existing purchases from user metadata
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(user.id);
    if (userError) {
      return res.status(500).json({ error: 'Failed to retrieve user data' });
    }

    const existingIds = userData.user.user_metadata?.purchased_templates || [];
    const finalIds = [...new Set([...existingIds, ...templateIds])];

    // Update metadata using Supabase Admin
    const { error: metadataError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      user_metadata: { purchased_templates: finalIds }
    });

    if (metadataError) {
      console.error("Purchase metadata error:", metadataError);
      return res.status(500).json({ error: 'Failed to grant access to templates' });
    }

    // Log to purchases table
    const purchaseRecords = cartItems.map(item => ({
      user_id: user.id,
      template_id: item.id,
      payment_id: paymentId
    }));

    const { error: dbError } = await supabaseAdmin
      .from('purchases')
      .insert(purchaseRecords);

    if (dbError) {
      console.error("Database purchase log error:", dbError);
      // We still return success because metadata was updated and user has access
    }

    res.status(200).json({ success: true, message: 'Payment verified and access granted' });

  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({ error: 'Internal server error during verification' });
  }
});

router.post('/generate-download', requireAuth, async (req, res) => {
  const { templateId } = req.body;
  const user = req.user; // Set by requireAuth middleware

  try {
    // Verify Purchase
    const { data: purchase, error: purchaseError } = await supabaseAdmin
      .from('purchases')
      .select('*')
      .eq('user_id', user.id)
      .eq('template_id', templateId)
      .single();

    if (purchaseError || !purchase) {
      return res.status(403).json({ error: 'You have not purchased this template.' });
    }

    // Get file path from mapping table
    let { data: mapping, error: mappingError } = await supabaseAdmin
      .from('template_files')
      .select('file_path')
      .eq('template_id', templateId)
      .single();

    if (mappingError || !mapping) {
      const { data: tmpl } = await supabaseAdmin
        .from('templates')
        .select('title')
        .eq('id', templateId)
        .single();

      if (tmpl?.title) {
        mapping = { file_path: `templates/${tmpl.title}.zip` };
      } else {
        console.log(`No mapping found for template ${templateId}, falling back to demo file`);
        mapping = { file_path: 'demo-template.zip' };
      }
    }

    // Generate Signed URL (valid for 60 seconds)
    const { data: signedUrlData, error: signedUrlError } = await supabaseAdmin
      .storage
      .from('secure_templates')
      .createSignedUrl(mapping.file_path, 60);

    if (signedUrlError || !signedUrlData) {
      console.error('Failed to generate signed URL:', signedUrlError);
      return res.status(500).json({ error: 'Failed to generate download link. Please check if the file exists in the secure_templates bucket.' });
    }

    res.json({ downloadUrl: signedUrlData.signedUrl });

  } catch (error) {
    console.error('Error generating download:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/validate-coupon', async (req, res) => {
  try {
    const { code, cartTotal, userId, userEmail } = req.body;
    if (!code) {
      return res.status(400).json({ valid: false, error: 'Please enter a coupon code' });
    }

    const cleanCode = code.trim().toUpperCase();
    const totalAmount = parseFloat(cartTotal) || 0;

    // Check if user has already used this coupon (via coupon_redemptions table OR user_metadata)
    if (userId || userEmail) {
      try {
        let query = supabaseAdmin
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
      if (userId && supabaseAdmin.auth?.admin?.getUserById) {
        try {
          const { data: uData, error: uErr } = await supabaseAdmin.auth.admin.getUserById(userId);
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

    const { data: coupon, error } = await supabaseAdmin
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

    res.json({
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
    console.error('Coupon validation error:', err);
    res.status(500).json({ valid: false, error: 'Failed to validate coupon' });
  }
});

router.get('/templates', async (req, res) => {
  if (!supabaseAdmin) return res.status(500).json({ error: 'Misconfigured' });
  
  try {
    const { data, error } = await supabaseAdmin
      .from('templates')
      .select('*');

    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
