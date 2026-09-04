import express from 'express';
import path from 'path';
import fs from 'fs';
import AdmZip from 'adm-zip';
import { fileURLToPath } from 'url';
import { query } from '../config/db.js';
import { requireAuth } from '../middlewares/authMiddleware.js';
import { sendReceiptEmail, sendContactEmail } from '../services/emailService.js';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const JWT_SECRET = process.env.JWT_SECRET || 'bizleap_jwt_secret_key_neon_2026_super_secure';

// Helper to strictly prevent directory traversal attacks
const isPathSafe = (targetPath, allowedRoots) => {
  if (!targetPath || typeof targetPath !== 'string') return false;
  const resolved = path.resolve(targetPath);
  return allowedRoots.some(root => {
    const resolvedRoot = path.resolve(root);
    const rel = path.relative(resolvedRoot, resolved);
    return !rel.startsWith('..') && !path.isAbsolute(rel);
  });
};

const router = express.Router();

// ==========================================
// 1. TEMPLATES CATALOG (NEON POSTGRES)
// ==========================================

router.get('/templates', async (req, res) => {
  try {
    const { rows } = await query('SELECT * FROM templates ORDER BY id ASC');
    
    // Normalize preview and demo URLs
    const adjusted = rows.map(t => {
      const slug = t.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      const previewUrl = t.preview_url || t.previewUrl || t.demo_url || `/previews/${slug}/index.html`;
      return {
        ...t,
        previewUrl,
        price: String(t.price || '0')
      };
    });

    res.json(adjusted);
  } catch (error) {
    console.error('Error fetching templates from Neon:', error);
    res.status(500).json({ 
      error: 'Failed to fetch templates', 
      details: error.message,
      has_database_url: Boolean(process.env.DATABASE_URL)
    });
  }
});

router.get('/templates/:id', async (req, res) => {
  try {
    const templateId = parseInt(req.params.id, 10);
    const { rows } = await query('SELECT * FROM templates WHERE id = $1', [templateId]);
    if (!rows.length) {
      return res.status(404).json({ error: 'Template not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch template details' });
  }
});

// ==========================================
// 2. REVIEWS SYSTEM (NEON POSTGRES)
// ==========================================

router.get('/reviews/:templateId', async (req, res) => {
  try {
    const templateId = parseInt(req.params.templateId, 10);
    const { rows } = await query(
      'SELECT id, user_id, template_id, rating, comment, user_name, avatar_url, created_at FROM reviews WHERE template_id = $1 ORDER BY created_at DESC',
      [templateId]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

router.post('/reviews', requireAuth, async (req, res) => {
  try {
    const { templateId, rating, comment } = req.body;
    const user = req.user;

    if (!templateId || !rating || !comment) {
      return res.status(400).json({ error: 'Missing review information' });
    }

    const numericRating = parseInt(rating, 10);
    if (numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const { rows } = await query(`
      INSERT INTO reviews (user_id, template_id, rating, comment, user_name, avatar_url)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [
      user.id,
      parseInt(templateId, 10),
      numericRating,
      comment.trim(),
      user.full_name || user.email.split('@')[0],
      user.avatar_url || null
    ]);

    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error saving review to Neon:', error);
    res.status(500).json({ error: 'Failed to post review' });
  }
});

router.delete('/reviews/:id', requireAuth, async (req, res) => {
  try {
    const reviewId = req.params.id;
    const user = req.user;

    if (user.role === 'admin') {
      await query('DELETE FROM reviews WHERE id = $1', [reviewId]);
    } else {
      await query('DELETE FROM reviews WHERE id = $1 AND user_id = $2', [reviewId, user.id]);
    }

    res.json({ success: true, message: 'Review removed' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete review' });
  }
});

// ==========================================
// 3. STORE ANNOUNCEMENT BANNER
// ==========================================

router.get('/announcement-banner', async (req, res) => {
  try {
    const { rows } = await query("SELECT * FROM store_announcements WHERE id = 'primary_banner' LIMIT 1");
    if (!rows.length) {
      const defaultBanner = {
        id: 'primary_banner',
        is_enabled: true,
        headline: '🔥 Weekend Mega Flash Sale Ends in:',
        coupon_code: 'LAUNCH50',
        discount_badge: '50% OFF',
        button_text: 'Claim 50% OFF Now →',
        button_url: '/explore',
        end_time: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
        theme: 'fire',
        is_dismissible: true
      };
      return res.json({ banner: defaultBanner, ...defaultBanner });
    }
    const b = rows[0];
    res.json({ banner: b, ...b });
  } catch (error) {
    console.error('Error fetching announcement banner:', error);
    res.status(500).json({ error: 'Failed to load announcements' });
  }
});

// ==========================================
// 4. COUPON VALIDATION (NEON POSTGRES)
// ==========================================

router.post('/validate-coupon', async (req, res) => {
  try {
    const { code, cartTotal, userId, userEmail } = req.body;
    if (!code) {
      return res.status(400).json({ valid: false, error: 'Please enter a coupon code' });
    }

    const cleanCode = code.trim().toUpperCase();
    const totalAmount = parseFloat(cartTotal) || 0;

    // Check if user has already redeemed this coupon
    if (userId || userEmail) {
      const redemptions = await query(`
        SELECT id FROM coupon_redemptions
        WHERE UPPER(coupon_code) = $1 AND (user_id = $2 OR user_email = $3)
      `, [cleanCode, String(userId || ''), String(userEmail || '')]);

      if (redemptions.rows.length > 0) {
        return res.status(400).json({
          valid: false,
          error: `You have already redeemed coupon '${cleanCode}'. It can only be used once per customer.`
        });
      }
    }

    const couponResult = await query('SELECT * FROM coupons WHERE UPPER(code) = $1', [cleanCode]);
    if (!couponResult.rows.length) {
      return res.status(404).json({ valid: false, error: 'Invalid coupon code' });
    }

    const coupon = couponResult.rows[0];

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

// ==========================================
// 5. PAYMENT ORDER & VERIFICATION (RAZORPAY)
// ==========================================

// Create server-side order with authentic pricing
router.post('/create-order', requireAuth, async (req, res) => {
  const { cartItems, couponCode } = req.body || {};
  if (!cartItems || !cartItems.length) {
    return res.status(400).json({ error: 'Cart is empty' });
  }

  try {
    // 1. Calculate price securely from database
    const templateIds = cartItems.map(item => parseInt(item.id, 10)).filter(Boolean);
    const { rows: dbTemplates } = await query(
      `SELECT id, title, price FROM templates WHERE id = ANY($1::int[])`,
      [templateIds]
    );

    let subtotal = 0;
    const verifiedItems = [];
    for (const t of dbTemplates) {
      const p = parseFloat(t.price) || 0;
      subtotal += p;
      verifiedItems.push({ id: t.id, title: t.title, price: p });
    }

    let discount = 0;
    if (couponCode) {
      const { rows: coupons } = await query(
        `SELECT * FROM coupons WHERE UPPER(code) = $1 AND is_active = true`,
        [couponCode.trim().toUpperCase()]
      );
      if (coupons.length > 0) {
        const c = coupons[0];
        if (c.discount_type === 'percentage') {
          discount = (subtotal * parseFloat(c.discount_value)) / 100;
          if (c.max_discount_amount && discount > parseFloat(c.max_discount_amount)) {
            discount = parseFloat(c.max_discount_amount);
          }
        } else {
          discount = parseFloat(c.discount_value);
        }
      }
    }

    const finalAmount = Math.max(0, subtotal - discount);
    const amountInPaise = Math.round(finalAmount * 100);

    const razorpayKeyId = process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_TEST_KEY;
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

    // 2. If Razorpay Secret is provided, create order via official Razorpay Orders API
    if (razorpayKeyId && razorpayKeySecret) {
      try {
        const auth = Buffer.from(`${razorpayKeyId}:${razorpayKeySecret}`).toString('base64');
        const rzpResponse = await fetch('https://api.razorpay.com/v1/orders', {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            amount: amountInPaise,
            currency: 'INR',
            receipt: `rcpt_${Date.now()}`.substring(0, 40),
            notes: {
              userId: req.user.id,
              userEmail: req.user.email,
              itemCount: verifiedItems.length
            }
          })
        });

        const orderData = await rzpResponse.json();
        if (rzpResponse.ok) {
          return res.status(200).json({
            success: true,
            orderId: orderData.id,
            amount: orderData.amount,
            currency: orderData.currency || 'INR',
            key: razorpayKeyId,
            isLive: true
          });
        }
        console.warn('Razorpay API notice:', orderData.error?.description || 'Falling back to sandbox order');
      } catch (apiErr) {
        console.warn('Razorpay connect notice:', apiErr.message);
      }
    }

    // 3. Clean test / sandbox mode
    const mockOrderId = `order_sim_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    return res.status(200).json({
      success: true,
      orderId: mockOrderId,
      amount: amountInPaise,
      currency: 'INR',
      key: razorpayKeyId || 'rzp_test_T7Lp0cSak0qDp4',
      isLive: false,
      note: 'Provide RAZORPAY_KEY_SECRET in .env.local to activate official server signature verification.'
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Failed to create payment order' });
  }
});

router.post('/verify-payment', requireAuth, async (req, res) => {
  const { paymentId, orderId, signature, cartItems, couponCode, couponId, invoicePdfBase64 } = req.body || {};
  const user = req.user;

  if (!paymentId || !cartItems || !Array.isArray(cartItems) || !cartItems.length) {
    return res.status(400).json({ error: 'Missing payment information or cart is empty' });
  }

  const isProduction = process.env.NODE_ENV === 'production';
  const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

  const isSimulatedOrder =
    (orderId && String(orderId).startsWith('order_sim_')) ||
    (paymentId && (String(paymentId).startsWith('sim_') || String(paymentId).startsWith('pay_mock_') || String(paymentId).startsWith('test_')));

  // In production, strictly block mock / simulated orders unless user is admin
  if (isProduction && isSimulatedOrder && user.role !== 'admin') {
    return res.status(400).json({ error: 'Simulated and test payments are disabled in production environment.' });
  }

  // Cryptographic Signature Verification if RAZORPAY_KEY_SECRET is configured
  if (razorpayKeySecret && !isSimulatedOrder) {
    if (!orderId || !signature) {
      return res.status(400).json({ error: 'Missing orderId or signature for authentic payment verification.' });
    }

    const expectedSignature = crypto
      .createHmac('sha256', razorpayKeySecret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    const expectedBuf = Buffer.from(expectedSignature, 'utf8');
    const receivedBuf = Buffer.from(String(signature), 'utf8');

    if (expectedBuf.length !== receivedBuf.length || !crypto.timingSafeEqual(expectedBuf, receivedBuf)) {
      console.error('Payment signature mismatch:', { expected: expectedSignature, received: signature });
      return res.status(400).json({ error: 'Payment signature verification failed. Untrusted payment.' });
    }
  }

  try {
    // Replay attack prevention: check if this paymentId was already recorded
    if (!isSimulatedOrder) {
      const existingPayment = await query('SELECT id FROM purchases WHERE payment_id = $1 LIMIT 1', [paymentId]);
      if (existingPayment.rows.length > 0) {
        return res.status(400).json({ error: 'This payment transaction has already been processed.' });
      }
    }

    // Validate cart items format and IDs
    const templateIds = [];
    for (const item of cartItems) {
      const numId = parseInt(item.id, 10);
      if (!Number.isInteger(numId) || numId <= 0) {
        return res.status(400).json({ error: 'Invalid template ID in cart.' });
      }
      templateIds.push(numId);
    }

    // Verify templates exist in database
    const { rows: dbTemplates } = await query(
      'SELECT id, title, price FROM templates WHERE id = ANY($1::int[])',
      [templateIds]
    );
    if (dbTemplates.length !== templateIds.length) {
      return res.status(400).json({ error: 'One or more items in your cart do not exist.' });
    }

    const templateMap = new Map(dbTemplates.map(t => [t.id, t]));

    // 1. Insert records into Neon purchases table with verified prices
    for (const item of cartItems) {
      const numId = parseInt(item.id, 10);
      const dbT = templateMap.get(numId);
      const verifiedPrice = dbT ? parseFloat(dbT.price || 0) : parseFloat(item.price || 0);

      await query(`
        INSERT INTO purchases (user_id, template_id, payment_id, amount)
        VALUES ($1, $2, $3, $4)
      `, [user.id, numId, paymentId, verifiedPrice]);
    }

    // 2. Update user's purchased_templates JSON array in Neon
    const existing = Array.isArray(user.purchased_templates) ? user.purchased_templates : [];
    const merged = [...new Set([...existing.map(Number), ...templateIds])].filter(n => !isNaN(n));

    await query(`
      UPDATE users 
      SET purchased_templates = $1,
          updated_at = NOW()
      WHERE id = $2
    `, [JSON.stringify(merged), user.id]);

    // 3. Log coupon redemption if applied
    if (couponCode) {
      await query(`
        INSERT INTO coupon_redemptions (coupon_id, coupon_code, user_id, user_email, payment_id)
        VALUES ($1, $2, $3, $4, $5)
      `, [couponId || null, couponCode.trim().toUpperCase(), user.id, user.email, paymentId]);

      await query(`
        UPDATE coupons 
        SET times_used = times_used + 1 
        WHERE UPPER(code) = $1
      `, [couponCode.trim().toUpperCase()]);
    }

    // 4. Automatic Luxury Invoice Email Dispatch with attached PDF
    const totalAmount = cartItems.reduce((sum, it) => {
      const dbT = templateMap.get(parseInt(it.id, 10));
      return sum + (dbT ? parseFloat(dbT.price || 0) : parseFloat(it.price || 0));
    }, 0);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    try {
      await sendReceiptEmail(
        user.email,
        {
          orderId: paymentId,
          total: totalAmount.toFixed(2),
          items: cartItems.map(it => {
            const dbT = templateMap.get(parseInt(it.id, 10));
            return {
              id: it.id,
              title: dbT?.title || it.title,
              price: dbT ? String(dbT.price) : String(it.price || 0),
              category: it.category || 'Web Template'
            };
          })
        },
        frontendUrl,
        invoicePdfBase64
      );
    } catch (mailErr) {
      console.warn('Invoice email dispatch note:', mailErr?.message);
    }

    res.status(200).json({ success: true, message: 'Payment verified and access granted' });
  } catch (error) {
    console.error('Error verifying payment in Neon:', error);
    res.status(500).json({ error: 'Internal server error during verification' });
  }
});

// ==========================================
// 6. LOCAL STORAGE DOWNLOADS (OPTION B)
// ==========================================

// Helper: Locate or generate zip for template on local disk
const getTemplateZipPath = async (templateId) => {
  const { rows } = await query('SELECT title FROM templates WHERE id = $1', [templateId]);
  const templateTitle = (rows[0]?.title || `Template_${templateId}`).replace(/[^a-zA-Z0-9_-]/g, '_');

  const privateStorageDir = path.resolve(__dirname, '../private_storage/templates');
  if (!fs.existsSync(privateStorageDir)) fs.mkdirSync(privateStorageDir, { recursive: true });
  const templatesRootDir = path.resolve(__dirname, '../../templates');

  // Check 1: Explicit zip in templates directory
  const directZip = path.join(templatesRootDir, `${templateTitle}.zip`);
  if (fs.existsSync(directZip)) return directZip;

  // Check 2: Zip in private storage
  const storageZip = path.join(privateStorageDir, `${templateTitle}.zip`);
  if (fs.existsSync(storageZip)) return storageZip;

  // Check 3: Check folder matching template title, and create zip on the fly
  const templateFolder = path.join(templatesRootDir, templateTitle);
  if (fs.existsSync(templateFolder) && fs.lstatSync(templateFolder).isDirectory()) {
    const zip = new AdmZip();
    zip.addLocalFolder(templateFolder);
    const generatedZipPath = path.join(privateStorageDir, `${templateTitle}.zip`);
    zip.writeZip(generatedZipPath);
    return generatedZipPath;
  }

  // Fallback: Default starter template package
  const fallbackZip = path.join(privateStorageDir, `${templateTitle}.zip`);
  const zip = new AdmZip();
  zip.addFile('README.txt', Buffer.from(`Thank you for purchasing ${templateTitle} from Bizleap Marketplace!\n\nFor support, contact support@bizleap.in\n`));
  zip.writeZip(fallbackZip);
  return fallbackZip;
};

// GET /api/download/:templateId - Authenticated direct file download from Neon Database
const handleTemplateDownload = async (req, res) => {
  try {
    const templateId = parseInt(req.params.templateId, 10);
    if (!Number.isInteger(templateId) || templateId <= 0) {
      return res.status(400).json({ error: 'Invalid template ID parameter' });
    }

    const user = req.user;

    // Check latest status of this template purchase
    const latestCheck = await query(`
      SELECT id, refund_status FROM purchases 
      WHERE user_id = $1 AND template_id = $2
      ORDER BY created_at DESC
      LIMIT 1
    `, [user.id, templateId]);

    if (latestCheck.rows.length > 0 && user.role !== 'admin') {
      const status = latestCheck.rows[0].refund_status;
      if (status === 'revoked' || status === 'processed') {
        const reason = status === 'revoked'
          ? 'Access to this template has been revoked by administrator.'
          : 'This template purchase has been refunded. Download access has been revoked.';
        return res.status(403).json({ error: reason });
      }
    }

    let userPurchases = [];
    try {
      userPurchases = Array.isArray(user.purchased_templates) ? user.purchased_templates : JSON.parse(user.purchased_templates || '[]');
    } catch { userPurchases = []; }

    const isOwned = (latestCheck.rows.length > 0 && (!latestCheck.rows[0].refund_status || !['processed', 'revoked'].includes(latestCheck.rows[0].refund_status))) ||
      (userPurchases.map(Number).includes(templateId) && (latestCheck.rows.length === 0 || !['processed', 'revoked'].includes(latestCheck.rows[0].refund_status))) ||
      user.role === 'admin';

    if (!isOwned) {
      return res.status(403).json({ error: 'You have not purchased this template or access has been revoked.' });
    }

    // Set download security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Security-Policy', "default-src 'none'");

    // Audit Trail: Record download in purchases
    await query(`
      UPDATE purchases 
      SET download_count = COALESCE(download_count, 0) + 1,
          first_downloaded_at = COALESCE(first_downloaded_at, NOW()),
          last_downloaded_at = NOW()
      WHERE user_id = $1 AND template_id = $2
    `, [user.id, templateId]).catch(err => console.warn('Download audit log warning:', err.message));

    // 1. Check if template binary data exists in Neon template_storage (BYTEA)
    const storageRes = await query(`
      SELECT file_name, file_data, file_size FROM template_storage WHERE template_id = $1
    `, [templateId]);

    if (storageRes.rows.length > 0 && storageRes.rows[0].file_data) {
      const row = storageRes.rows[0];
      const filename = (row.file_name || `template-${templateId}.zip`).replace(/[^a-zA-Z0-9._-]/g, '_');
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      if (row.file_size) res.setHeader('Content-Length', row.file_size);
      return res.send(row.file_data);
    }

    // 2. Check template_files table with strict path traversal check
    const allowedRoots = [
      path.resolve(__dirname, '../private_storage/templates'),
      path.resolve(__dirname, '../../templates'),
      path.resolve(__dirname, '../uploads')
    ];

    const fileRes = await query('SELECT file_path, file_name FROM template_files WHERE template_id = $1 ORDER BY id DESC LIMIT 1', [templateId]);
    if (fileRes.rows.length > 0) {
      const targetFilePath = fileRes.rows[0].file_path;
      if (isPathSafe(targetFilePath, allowedRoots) && fs.existsSync(targetFilePath)) {
        const safeName = (fileRes.rows[0].file_name || `template-${templateId}.zip`).replace(/[^a-zA-Z0-9._-]/g, '_');
        return res.download(targetFilePath, safeName);
      }
    }

    // 3. Fallback: generate dynamic ZIP
    const { rows: tRows } = await query('SELECT title FROM templates WHERE id = $1', [templateId]);
    const tmpl = tRows[0] || { title: `Template-${templateId}` };
    const fallbackZip = await getTemplateZipPath(templateId);
    const safeTitleName = (tmpl.title || 'template').replace(/[^a-zA-Z0-9_-]/g, '_');
    return res.download(fallbackZip, `${safeTitleName}.zip`);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Failed to process template download' });
  }
};

router.get('/download/:templateId', requireAuth, handleTemplateDownload);
router.get('/download-template/:templateId', requireAuth, handleTemplateDownload);

// POST /api/generate-download - Generates direct download URL
router.post('/generate-download', requireAuth, async (req, res) => {
  try {
    const { templateId } = req.body || {};
    const tId = parseInt(templateId, 10);
    if (!Number.isInteger(tId) || tId <= 0) {
      return res.status(400).json({ error: 'Invalid template ID parameter' });
    }

    const user = req.user;

    // Check latest status of this template purchase
    const latestCheck = await query(`
      SELECT id, refund_status FROM purchases 
      WHERE user_id = $1 AND template_id = $2
      ORDER BY created_at DESC
      LIMIT 1
    `, [user.id, tId]);

    if (latestCheck.rows.length > 0 && user.role !== 'admin') {
      const status = latestCheck.rows[0].refund_status;
      if (status === 'revoked' || status === 'processed') {
        const reason = status === 'revoked'
          ? 'Access to this template has been revoked by administrator.'
          : 'This template purchase has been refunded. Download access has been revoked.';
        return res.status(403).json({ error: reason });
      }
    }

    let userPurchases = [];
    try {
      userPurchases = Array.isArray(user.purchased_templates) ? user.purchased_templates : JSON.parse(user.purchased_templates || '[]');
    } catch { userPurchases = []; }

    const isOwned = (latestCheck.rows.length > 0 && (!latestCheck.rows[0].refund_status || !['processed', 'revoked'].includes(latestCheck.rows[0].refund_status))) ||
      (userPurchases.map(Number).includes(tId) && (latestCheck.rows.length === 0 || !['processed', 'revoked'].includes(latestCheck.rows[0].refund_status))) ||
      user.role === 'admin';

    if (!isOwned) {
      return res.status(403).json({ error: 'You do not have active purchase access for this template.' });
    }

    // Direct download URL served by our backend with secure signed token
    const downloadToken = jwt.sign(
      { id: user.id, email: user.email, templateId: tId, type: 'download' },
      JWT_SECRET,
      { expiresIn: '15m' }
    );
    const downloadUrl = `/api/download/${tId}?token=${encodeURIComponent(downloadToken)}`;
    res.json({ downloadUrl, downloadToken });
  } catch (error) {
    console.error('Generate download error:', error);
    res.status(500).json({ error: 'Failed to generate download link' });
  }
});

// GET /api/purchased-templates - Returns live active (unrefunded / unrevoked) template IDs for the logged in user
router.get('/purchased-templates', requireAuth, async (req, res) => {
  try {
    const user = req.user;

    const latestRes = await query(`
      SELECT DISTINCT ON (template_id) template_id, refund_status 
      FROM purchases 
      WHERE user_id = $1 
      ORDER BY template_id, created_at DESC
    `, [user.id]);

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
    if (Array.isArray(user.purchased_templates)) rawList = user.purchased_templates;
    else if (typeof user.purchased_templates === 'string') {
      try { rawList = JSON.parse(user.purchased_templates); } catch { rawList = []; }
    }

    const cleanList = [...new Set([...rawList.map(Number), ...activeIds])]
      .filter(id => !isNaN(id) && !inactiveIds.has(id));

    // Keep database users table strictly in sync
    await query(`UPDATE users SET purchased_templates = $1, updated_at = NOW() WHERE id = $2`, [JSON.stringify(cleanList), user.id]).catch(() => {});

    let purchasedRows = [];
    if (cleanList.length > 0) {
      const templateRes = await query(`
        SELECT id, title, category, tag, author, price, rating, image, description,
               preview_url, demo_url, figma_url, github_repo_url, is_exclusive, is_sold_out,
               created_at
        FROM templates 
        WHERE id = ANY($1::int[])
      `, [cleanList]);

      purchasedRows = (templateRes.rows || []).map(t => {
        const currentPrice = parseInt(t.price, 10) || 0;
        const slug = (t.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        const previewUrl = t.preview_url || t.demo_url || `/previews/${slug}/index.html`;
        return { ...t, price: currentPrice.toString(), previewUrl };
      });
    }

    res.json({ success: true, templateIds: cleanList, templates: purchasedRows });
  } catch (error) {
    console.error('Fetch purchased templates error:', error);
    res.status(500).json({ error: 'Failed to fetch purchased templates' });
  }
});

// POST /api/request-refund - Customer submits refund request
router.post('/request-refund', requireAuth, async (req, res) => {
  try {
    const { templateId, reason } = req.body;
    const user = req.user;

    if (!templateId || !reason || !String(reason).trim()) {
      return res.status(400).json({ error: 'Please select or provide a reason for your refund request.' });
    }

    const tId = parseInt(templateId, 10);

    // 1. Verify user purchased this template
    const { rows } = await query(`
      SELECT id, refund_status, amount, payment_id 
      FROM purchases 
      WHERE user_id = $1 AND template_id = $2 
      ORDER BY created_at DESC LIMIT 1
    `, [user.id, tId]);

    if (!rows.length) {
      return res.status(404).json({ error: 'No purchase record found for this template.' });
    }

    const purchase = rows[0];

    if (purchase.refund_status === 'processed') {
      return res.status(400).json({ error: 'This template purchase has already been refunded.' });
    }

    if (purchase.refund_status === 'requested') {
      return res.json({ 
        success: true, 
        message: 'Your refund request has already been submitted and is currently under review.' 
      });
    }

    // 2. Mark as requested in purchases
    await query(`
      UPDATE purchases 
      SET refund_status = 'requested',
          refund_reason = $1,
          refund_requested_at = NOW(),
          updated_at = NOW()
      WHERE id = $2
    `, [String(reason).trim(), purchase.id]);

    res.json({ 
      success: true, 
      message: 'Refund request submitted! Our team will review it within 1–2 business days.' 
    });
  } catch (error) {
    console.error('Request refund error:', error);
    res.status(500).json({ error: error.message || 'Failed to process refund request.' });
  }
});

// ==========================================
// 7. CONTACT & EMAIL RECEIPTS
// ==========================================

router.post('/send-receipt', async (req, res) => {
  const { to, email, orderDetails, cartItems, totalAmount, paymentId, frontendUrl, invoicePdfBase64 } = req.body || {};
  const recipientEmail = String(to || email || '').trim().toLowerCase();

  // Basic email syntax validation to avoid mail relay abuse
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!recipientEmail || recipientEmail.length > 255 || !emailRegex.test(recipientEmail)) {
    return res.status(400).json({ error: 'Valid recipient email is required' });
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
    res.status(200).json({ success: true, messageId: info.messageId });
  } catch (error) {
    console.error('Error sending receipt email:', error);
    res.status(500).json({ error: 'Failed to send receipt email' });
  }
});

router.post('/contact', async (req, res) => {
  const { firstName, lastName, email, subject, message } = req.body || {};

  if (!firstName || !lastName || !email || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const cleanEmail = String(email).trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (cleanEmail.length > 255 || !emailRegex.test(cleanEmail)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  // Sanitize headers to prevent CRLF injection in SMTP headers
  const cleanFirstName = String(firstName).trim().substring(0, 100).replace(/[\r\n]/g, '');
  const cleanLastName = String(lastName).trim().substring(0, 100).replace(/[\r\n]/g, '');
  const cleanSubject = String(subject || 'General Inquiry').trim().substring(0, 200).replace(/[\r\n]/g, '');
  const cleanMessage = String(message).trim().substring(0, 5000);

  try {
    const info = await sendContactEmail(cleanFirstName, cleanLastName, cleanEmail, cleanSubject, cleanMessage);
    res.status(200).json({ success: true, messageId: info.messageId });
  } catch (error) {
    console.error('Error sending contact email:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

export default router;
