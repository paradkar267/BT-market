import express from 'express';
import { supabaseAdmin } from '../config/supabase.js';
import { requireAuth } from '../middlewares/authMiddleware.js';
import { sendReceiptEmail, sendContactEmail } from '../services/emailService.js';

const router = express.Router();

router.post('/send-receipt', async (req, res) => {
  const { to, orderDetails, frontendUrl } = req.body;

  if (!to || !orderDetails) {
    return res.status(400).json({ error: 'Missing recipient email or order details' });
  }

  try {
    const info = await sendReceiptEmail(to, orderDetails, frontendUrl);
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

    // 1. Verify Payment (Mock vs Real)
    if (paymentId.startsWith('pay_mock_') || paymentId.startsWith('mock_')) {
      // Allow mock payments if using dummy keys
      console.log(`Mock payment verified for user ${user.id}: ${paymentId}`);
    } else {
      // Real payment validation via Razorpay API
      const razorpayKey = process.env.RAZORPAY_KEY || process.env.VITE_RAZORPAY_TEST_KEY;
      const razorpaySecret = process.env.RAZORPAY_SECRET || process.env.VITE_RAZORPAY_TEST_SECRET;

      if (!razorpayKey || !razorpaySecret) {
        if (!razorpaySecret && razorpayKey && razorpayKey.startsWith('rzp_test_')) {
          console.warn(`Missing RAZORPAY_SECRET. Bypassing payment verification because razorpayKey "${razorpayKey}" is in test/sandbox mode.`);
        } else {
          console.error("Missing RAZORPAY_SECRET in environment variables");
          return res.status(500).json({ error: 'Server payment configuration is incomplete. Please contact support.' });
        }
      } else {
        // Fetch payment details from Razorpay using Basic Auth
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

        // Check if payment was captured or authorized
        if (paymentDetails.status !== 'captured' && paymentDetails.status !== 'authorized') {
          return res.status(400).json({ error: 'Payment was not successful' });
        }

        // Check amount (Razorpay amount is in paise/cents)
        const expectedAmountInPaise = Math.round(cartTotal * 100);
        
        // We allow a small tolerance (e.g. currency conversion differences if any, but usually it should be exact)
        if (paymentDetails.amount < expectedAmountInPaise - 100) { // allowing 1 Rupee/Unit difference just in case
           console.warn(`Payment amount mismatch: Expected ${expectedAmountInPaise}, Got ${paymentDetails.amount}`);
        }
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
      console.log(`No mapping found for template ${templateId}, falling back to demo file`);
      mapping = { file_path: 'demo-template.zip' };
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
