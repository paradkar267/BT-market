import express from 'express';
import multer from 'multer';
import AdmZip from 'adm-zip';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { query } from '../config/db.js';
import { requireAdmin } from '../middlewares/authMiddleware.js';
import { sendTemplateUpdateEmail, sendCampaignEmail, sendGiftTemplateEmail, transporter } from '../services/emailService.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads and private_storage directories exist
const uploadsDir = path.resolve(__dirname, '../../backend/uploads');
const privateStorageDir = path.resolve(__dirname, '../../backend/private_storage/templates');

if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
if (!fs.existsSync(privateStorageDir)) fs.mkdirSync(privateStorageDir, { recursive: true });

// Safe image upload storage (strictly validated)
const imageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const cleanName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${Date.now()}-${cleanName}`);
  }
});

const imageFileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
  const allowedExts = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedMimes.includes(file.mimetype) && allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Security Error: Only valid image files (JPG, PNG, WebP, GIF, AVIF) are allowed'));
  }
};

const uploadImage = multer({
  storage: imageStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: imageFileFilter
});

// Private template ZIP upload storage (Never accessible via public static URLs)
const templateStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === '.zip') {
      cb(null, privateStorageDir);
    } else {
      cb(null, uploadsDir);
    }
  },
  filename: function (req, file, cb) {
    const cleanName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${Date.now()}-${cleanName}`);
  }
});

const templateFileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExts = ['.zip', '.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif'];
  if (allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Security Error: Only .zip archives and valid images are allowed'));
  }
};

const upload = multer({
  storage: templateStorage,
  limits: { fileSize: 250 * 1024 * 1024 }, // 250MB max
  fileFilter: templateFileFilter
});

// ==========================================
// 1. STATS & ANALYTICS
// ==========================================

router.get('/stats', requireAdmin, async (req, res) => {
  try {
    const [purchasesRes, usersRes, templatesRes] = await Promise.all([
      query('SELECT template_id, amount FROM purchases'),
      query('SELECT COUNT(*) as count FROM users'),
      query('SELECT id, price FROM templates')
    ]);

    const priceMap = {};
    templatesRes.rows.forEach(t => {
      priceMap[t.id] = parseFloat(t.price) || 0;
    });

    const totalRevenue = purchasesRes.rows.reduce((sum, p) => {
      return sum + (parseFloat(p.amount) || priceMap[p.template_id] || 0);
    }, 0);

    res.json({
      totalSales: purchasesRes.rows.length,
      totalRevenue: Math.round(totalRevenue),
      totalUsers: parseInt(usersRes.rows[0]?.count || 0, 10)
    });
  } catch (err) {
    console.error('Admin stats error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/orders', requireAdmin, async (req, res) => {
  try {
    const { rows } = await query(`
      SELECT 
        p.id, 
        p.payment_id, 
        p.amount, 
        p.refund_status, 
        p.refund_id,
        p.refund_reason,
        p.refund_requested_at,
        p.refund_processed_at,
        p.download_count,
        p.first_downloaded_at,
        p.last_downloaded_at,
        p.created_at,
        p.template_id,
        u.id as user_id,
        u.email as customer_email,
        u.full_name as customer_name,
        t.title as template_title,
        t.price as template_price,
        t.category as template_category,
        t.image as template_image
      FROM purchases p
      LEFT JOIN users u ON p.user_id = u.id
      LEFT JOIN templates t ON p.template_id = t.id
      ORDER BY p.created_at DESC
    `);

    const orders = rows.map(r => {
      const numAmount = parseFloat(r.amount || r.template_price || 0) || 0;
      const isRefunded = r.refund_status === 'processed';
      const isRequested = r.refund_status === 'requested';
      return {
        id: r.id,
        paymentId: r.payment_id || 'N/A',
        amount: numAmount,
        createdAt: r.created_at,
        created_at: r.created_at,
        status: isRefunded ? 'Refunded' : (isRequested ? 'Refund Requested' : 'Completed'),
        refund_status: r.refund_status || 'none',
        refund_id: r.refund_id || null,
        refund_reason: r.refund_reason || null,
        refund_requested_at: r.refund_requested_at || null,
        refund_processed_at: r.refund_processed_at || null,
        download_count: parseInt(r.download_count || 0, 10),
        first_downloaded_at: r.first_downloaded_at || null,
        last_downloaded_at: r.last_downloaded_at || null,
        customer: {
          id: r.user_id,
          email: r.customer_email || 'N/A',
          name: r.customer_name || r.customer_email?.split('@')[0] || 'Customer',
          fullName: r.customer_name || r.customer_email?.split('@')[0] || 'Customer'
        },
        template: {
          id: r.template_id,
          title: r.template_title || `Template #${r.template_id}`,
          price: numAmount,
          category: r.template_category || 'General',
          image: r.template_image || ''
        }
      };
    });

    const activeOrders = orders.filter(o => o.status !== 'Refunded');
    const totalRevenue = activeOrders.reduce((sum, o) => sum + o.amount, 0);
    const uniqueCustomerIds = new Set(orders.map(o => o.customer?.id || o.customer?.email).filter(Boolean));
    const userCountRes = await query('SELECT COUNT(*) as count FROM users');
    const totalUsers = parseInt(userCountRes.rows[0]?.count || 0, 10);

    const stats = {
      totalRevenue: Math.round(totalRevenue),
      totalOrders: activeOrders.length,
      totalCustomers: uniqueCustomerIds.size,
      totalUsers: Math.max(totalUsers, uniqueCustomerIds.size)
    };

    res.json({ orders, stats });
  } catch (err) {
    console.error('Admin orders error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 2. TEMPLATE CRUD & UPLOADS
// ==========================================

const handleTemplateUpload = async (req, res) => {
  try {
    const { title, description, price, category, tag, image, previewUrl, keywords } = req.body;
    const files = req.files || [];
    const file = req.file || files.find(f => f.fieldname === 'templateZip' || f.fieldname === 'file') || files[0];

    if (!title || !price || !category) {
      return res.status(400).json({ error: 'Missing required template fields' });
    }

    const maxIdRes = await query('SELECT MAX(id) as max_id FROM templates');
    const nextId = (parseInt(maxIdRes.rows[0]?.max_id || 0, 10)) + 1;

    let parsedKeywords = [];
    if (Array.isArray(keywords)) {
      parsedKeywords = keywords;
    } else if (typeof keywords === 'string') {
      try {
        parsedKeywords = JSON.parse(keywords);
      } catch {
        parsedKeywords = keywords.split(',').map(k => k.trim()).filter(Boolean);
      }
    }

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const liveDemoUrl = previewUrl || `/previews/${slug}/index.html`;

    // 1. Insert template metadata into Neon
    const insertRes = await query(`
      INSERT INTO templates (
        id, title, description, price, category, tag, image, 
        preview_url, demo_url, keywords, author, sales, rating,
        key_features, ideal_for, pages_included, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 0, 5, '[]'::jsonb, '[]'::jsonb, '[]'::jsonb, NOW(), NOW())
      RETURNING *
    `, [
      nextId, title, description, String(price), category, tag || 'Web',
      image || '', liveDemoUrl, liveDemoUrl, parsedKeywords, 'Nexus Themes'
    ]);

    const newTemplate = insertRes.rows[0];

    // 2. Store binary ZIP data directly into Neon template_storage (BYTEA)
    if (file) {
      try {
        const fileBuffer = fs.readFileSync(file.path);
        await query(`
          INSERT INTO template_storage (template_id, file_name, file_data, file_size, updated_at)
          VALUES ($1, $2, $3, $4, NOW())
          ON CONFLICT (template_id) DO UPDATE SET
            file_name = EXCLUDED.file_name,
            file_data = EXCLUDED.file_data,
            file_size = EXCLUDED.file_size,
            updated_at = NOW();
        `, [newTemplate.id, file.originalname, fileBuffer, file.size]);
      } catch (saveErr) {
        console.warn('Neon template_storage upload warning:', saveErr.message);
      }

      await query(`
        INSERT INTO template_files (template_id, file_name, file_path, file_size)
        VALUES ($1, $2, $3, $4)
      `, [newTemplate.id, file.originalname, file.path, file.size]);
    }

    res.status(201).json({ success: true, template: newTemplate });
  } catch (err) {
    console.error('Template upload error:', err);
    res.status(500).json({ error: err.message });
  }
};

router.post('/templates', requireAdmin, upload.any(), handleTemplateUpload);
router.post('/upload-template', requireAdmin, upload.any(), handleTemplateUpload);

const handleTemplateUpdate = async (req, res) => {
  try {
    const templateId = parseInt(req.params.id, 10);
    const { title, description, price, category, tag, image, previewUrl, is_sold_out, is_exclusive } = req.body;

    const { rows } = await query(`
      UPDATE templates 
      SET title = COALESCE($1, title),
          description = COALESCE($2, description),
          price = COALESCE($3, price),
          category = COALESCE($4, category),
          tag = COALESCE($5, tag),
          image = COALESCE($6, image),
          preview_url = COALESCE($7, preview_url),
          demo_url = COALESCE($7, demo_url),
          is_sold_out = COALESCE($8, is_sold_out),
          is_exclusive = COALESCE($9, is_exclusive),
          updated_at = NOW()
      WHERE id = $10
      RETURNING *
    `, [title, description, price ? String(price) : null, category, tag, image, previewUrl, is_sold_out, is_exclusive, templateId]);

    if (!rows.length) {
      return res.status(404).json({ error: 'Template not found' });
    }

    res.json({ success: true, template: rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

router.put('/templates/:id', requireAdmin, handleTemplateUpdate);
router.put('/template/:id', requireAdmin, handleTemplateUpdate);

const handleTemplateDelete = async (req, res) => {
  try {
    const templateId = parseInt(req.params.id, 10);
    await query('DELETE FROM template_storage WHERE template_id = $1', [templateId]);
    await query('DELETE FROM template_files WHERE template_id = $1', [templateId]);
    await query('DELETE FROM reviews WHERE template_id = $1', [templateId]);
    await query('DELETE FROM templates WHERE id = $1', [templateId]);
    res.json({ success: true, message: 'Template removed successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

router.delete('/templates/:id', requireAdmin, handleTemplateDelete);
router.delete('/template/:id', requireAdmin, handleTemplateDelete);

// Fetch buyers of a template (for update broadcast)
router.get('/templates/:id/buyers', requireAdmin, async (req, res) => {
  try {
    const templateId = parseInt(req.params.id, 10);
    const { rows } = await query(`
      SELECT DISTINCT u.id, u.email, u.full_name, p.created_at
      FROM purchases p
      JOIN users u ON p.user_id = u.id
      WHERE p.template_id = $1
    `, [templateId]);

    res.json({ buyers: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Broadcast template update email to buyers
router.post('/broadcast-update', requireAdmin, async (req, res) => {
  try {
    const { templateId, version, changelog, buyers } = req.body;
    const { rows: tRows } = await query('SELECT title, category FROM templates WHERE id = $1', [templateId]);
    const template = tRows[0] || { title: `Template #${templateId}`, category: 'Web' };

    let recipientList = buyers;
    if (!recipientList || !recipientList.length) {
      const { rows } = await query(`
        SELECT DISTINCT u.email
        FROM purchases p
        JOIN users u ON p.user_id = u.id
        WHERE p.template_id = $1
      `, [templateId]);
      recipientList = rows;
    }

    let sentCount = 0;
    for (const b of recipientList) {
      const email = typeof b === 'string' ? b : b.email;
      if (email) {
        try {
          await sendTemplateUpdateEmail(email, {
            templateTitle: template.title,
            templateCategory: template.category,
            version: version || '1.1.0',
            changelog: changelog || 'New features, bug fixes, and performance improvements.',
            baseUrl: process.env.FRONTEND_URL || 'http://localhost:5173'
          });
          sentCount++;
        } catch (e) {
          console.warn('Broadcast send notice:', e.message);
        }
      }
    }

    res.json({ success: true, count: sentCount, message: `Update sent to ${sentCount} buyer(s)` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 3. REFUNDS
// ==========================================

const handleRefund = async (req, res) => {
  try {
    const { purchaseId, orderId, reason } = req.body;
    const targetId = purchaseId || orderId;

    if (!targetId) {
      return res.status(400).json({ error: 'Missing purchase or order ID' });
    }

    // 1. Fetch purchase record
    const { rows: pRows } = await query(`
      SELECT p.id, p.user_id, p.template_id, p.amount, p.refund_reason, u.purchased_templates, u.email
      FROM purchases p
      LEFT JOIN users u ON p.user_id = u.id
      WHERE p.id::text = $1 OR p.payment_id = $1
    `, [String(targetId)]);

    if (!pRows.length) {
      return res.status(404).json({ error: 'Purchase record not found' });
    }

    const purchase = pRows[0];
    const refundId = `ref_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;

    // 2. Mark as refunded
    await query(`
      UPDATE purchases 
      SET refund_status = 'processed',
          refund_id = $1,
          refund_amount = $2,
          refund_reason = COALESCE($3, refund_reason, 'Refund approved by admin'),
          refund_processed_at = NOW(),
          updated_at = NOW()
      WHERE id = $4
    `, [refundId, purchase.amount, reason || null, purchase.id]);

    // 3. Revoke access from user's purchased_templates
    if (purchase.user_id) {
      let currentList = [];
      if (Array.isArray(purchase.purchased_templates)) {
        currentList = purchase.purchased_templates;
      } else if (typeof purchase.purchased_templates === 'string') {
        try { currentList = JSON.parse(purchase.purchased_templates); } catch { currentList = []; }
      }
      const updatedList = currentList.filter(id => String(id) !== String(purchase.template_id));
      await query(`
        UPDATE users 
        SET purchased_templates = $1,
            updated_at = NOW()
        WHERE id = $2
      `, [JSON.stringify(updatedList), purchase.user_id]);
    }

    res.json({ 
      success: true, 
      refundId, 
      message: 'Refund recorded and access revoked successfully' 
    });
  } catch (err) {
    console.error('Refund error:', err);
    res.status(500).json({ error: err.message });
  }
};

router.post('/refund', requireAdmin, handleRefund);
router.post('/admin-refund', requireAdmin, handleRefund);

// ==========================================
// 4. COUPONS MANAGEMENT (NEON)
// ==========================================

router.get('/coupons', requireAdmin, async (req, res) => {
  try {
    const { rows } = await query('SELECT * FROM coupons ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/coupons', requireAdmin, async (req, res) => {
  try {
    const { code, discount_type, discount_value, min_order_amount, usage_limit, expires_at, is_active } = req.body;
    if (!code || !discount_type || !discount_value) {
      return res.status(400).json({ error: 'Missing required coupon fields' });
    }

    const { rows } = await query(`
      INSERT INTO coupons (code, discount_type, discount_value, min_order_amount, usage_limit, expires_at, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [
      code.trim().toUpperCase(),
      discount_type,
      parseFloat(discount_value),
      parseFloat(min_order_amount || 0),
      usage_limit ? parseInt(usage_limit, 10) : null,
      expires_at || null,
      is_active !== undefined ? is_active : true
    ]);

    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/coupons/:id', requireAdmin, async (req, res) => {
  try {
    const couponId = req.params.id;
    const { is_active, discount_value, usage_limit, expires_at } = req.body;

    const { rows } = await query(`
      UPDATE coupons 
      SET is_active = COALESCE($1, is_active),
          discount_value = COALESCE($2, discount_value),
          usage_limit = COALESCE($3, usage_limit),
          expires_at = COALESCE($4, expires_at)
      WHERE id = $5
      RETURNING *
    `, [is_active, discount_value ? parseFloat(discount_value) : null, usage_limit, expires_at, couponId]);

    res.json({ success: true, coupon: rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/coupons/:id', requireAdmin, async (req, res) => {
  try {
    const couponId = req.params.id;
    await query('DELETE FROM coupons WHERE id = $1', [couponId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 5. CUSTOMERS & ACCESS MANAGEMENT
// ==========================================

const handleGetCustomers = async (req, res) => {
  try {
    const { rows } = await query(`
      SELECT 
        u.id, 
        u.email, 
        u.full_name, 
        u.full_name as name,
        u.full_name as "fullName",
        u.avatar_url, 
        u.role, 
        u.purchased_templates,
        u.created_at,
        COUNT(p.id) FILTER (WHERE p.id IS NOT NULL AND (p.refund_status IS NULL OR p.refund_status NOT IN ('processed', 'revoked'))) as purchases_count,
        COALESCE(SUM(CASE WHEN (p.refund_status IS NULL OR p.refund_status NOT IN ('processed', 'revoked')) THEN p.amount ELSE 0 END), 0) as total_spent
      FROM users u
      LEFT JOIN purchases p ON u.id = p.user_id
      GROUP BY u.id
      ORDER BY total_spent DESC, u.created_at DESC
    `);

    // Fetch all active purchases with template info to hydrate customer template objects
    const { rows: allPurchases } = await query(`
      SELECT 
        p.id as purchase_id,
        p.user_id,
        p.payment_id,
        p.amount,
        p.refund_status,
        p.download_count,
        p.last_downloaded_at,
        p.created_at as purchased_at,
        t.id,
        t.title,
        t.price,
        t.category,
        t.image
      FROM purchases p
      LEFT JOIN templates t ON p.template_id = t.id
      WHERE (p.refund_status IS NULL OR p.refund_status NOT IN ('processed', 'revoked'))
      ORDER BY p.created_at DESC
    `);

    const purchasesByUser = {};
    allPurchases.forEach(p => {
      if (!purchasesByUser[p.user_id]) purchasesByUser[p.user_id] = [];
      purchasesByUser[p.user_id].push({
        id: p.id,
        purchase_id: p.purchase_id,
        title: p.title || `Template #${p.id}`,
        price: p.amount || p.price || 0,
        category: p.category || 'General',
        image: p.image || '',
        payment_id: p.payment_id || 'N/A',
        purchased_at: p.purchased_at,
        download_count: p.download_count || 0,
        last_downloaded_at: p.last_downloaded_at
      });
    });

    const customers = rows.map((u, idx) => {
      const userPurchases = purchasesByUser[u.id] || [];
      const spent = parseFloat(u.total_spent) || 0;
      const purchases = userPurchases.length;
      
      let tier = 'Member';
      if (spent >= 10000 || purchases >= 5) {
        tier = 'Platinum VIP';
      } else if (spent >= 3000 || purchases >= 2) {
        tier = 'Gold VIP';
      } else if (purchases >= 1) {
        tier = 'Silver Buyer';
      }

      return {
        ...u,
        name: u.full_name || u.email?.split('@')[0] || 'Customer',
        fullName: u.full_name || u.email?.split('@')[0] || 'Customer',
        total_spent: spent,
        total_purchases: purchases,
        purchases_count: purchases,
        tier: tier,
        rank: idx + 1,
        purchased_templates: userPurchases
      };
    });

    const totalUsers = customers.length;
    const payingCustomers = customers.filter(c => c.total_purchases > 0).length;
    const vipUsers = customers.filter(c => (c.tier || '').includes('VIP')).length;
    const totalRevenue = customers.reduce((sum, c) => sum + c.total_spent, 0);
    const averageLtv = payingCustomers > 0 ? (totalRevenue / payingCustomers).toFixed(2) : 0;

    res.json({
      customers,
      stats: {
        totalUsers,
        payingCustomers,
        vipUsers,
        totalRevenue,
        averageLtv
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

router.get('/customers', requireAdmin, handleGetCustomers);
router.get('/admin-customers', requireAdmin, handleGetCustomers);

// Grant direct template access to a customer
const handleGrantCustomer = async (req, res) => {
  try {
    const { user_id, user_email, template_id, note } = req.body;

    let targetUser = null;
    if (user_id) {
      const { rows } = await query('SELECT id, email, full_name, purchased_templates FROM users WHERE id = $1', [user_id]);
      targetUser = rows[0];
    } else if (user_email) {
      const { rows } = await query('SELECT id, email, full_name, purchased_templates FROM users WHERE LOWER(email) = LOWER($1)', [user_email.trim()]);
      targetUser = rows[0];
    }

    if (!targetUser) {
      return res.status(404).json({ error: 'User account not found' });
    }

    const tId = parseInt(template_id, 10);
    let existing = [];
    if (Array.isArray(targetUser.purchased_templates)) {
      existing = targetUser.purchased_templates;
    } else if (typeof targetUser.purchased_templates === 'string') {
      try { existing = JSON.parse(targetUser.purchased_templates); } catch {}
    }
    const updated = [...new Set([...existing.map(x => parseInt(x, 10)), tId])];

    await query('UPDATE users SET purchased_templates = $1, updated_at = NOW() WHERE id = $2', [JSON.stringify(updated), targetUser.id]);

    // Fetch template details to return rich object
    const { rows: tRows } = await query('SELECT id, title, price, category, image FROM templates WHERE id = $1', [tId]);
    const templateData = tRows[0] || { id: tId, title: `Template #${tId}`, price: 0, category: 'General', image: '' };

    const paymentId = `admin_grant_${Date.now()}`;

    // Record grant in purchases table
    const insRes = await query(`
      INSERT INTO purchases (user_id, template_id, payment_id, amount, refund_status)
      VALUES ($1, $2, $3, 0, 'none')
      RETURNING id, created_at
    `, [targetUser.id, tId, paymentId]);

    const newPurchase = insRes.rows[0];

    // Asynchronously notify user via email
    if (targetUser.email) {
      sendGiftTemplateEmail(targetUser.email, {
        customerName: targetUser.full_name || 'Valued Creator',
        template: {
          id: tId,
          title: templateData.title,
          price: templateData.price || 0,
          category: templateData.category || 'React Template',
          image: templateData.image || ''
        },
        note: note || '',
        frontendUrl: req.headers.origin || process.env.FRONTEND_URL || 'http://localhost:5173'
      }).then(() => {
        console.log(`[EMAIL] Gift notification successfully sent to ${targetUser.email} for template '${templateData.title}'`);
      }).catch(emailErr => {
        console.error(`[EMAIL ERROR] Failed to send gift email to ${targetUser.email}:`, emailErr.message);
      });
    }

    res.json({
      success: true,
      message: `Free license for '${templateData.title}' granted successfully!`,
      grantedTemplate: {
        id: tId,
        purchase_id: newPurchase?.id,
        title: templateData.title,
        price: 0,
        category: templateData.category || 'General',
        image: templateData.image || '',
        payment_id: paymentId,
        purchased_at: newPurchase?.created_at || new Date().toISOString()
      }
    });
  } catch (err) {
    console.error('Grant template error:', err);
    res.status(500).json({ error: err.message });
  }
};

router.post('/customers/grant', requireAdmin, handleGrantCustomer);
router.post('/admin-customers/grant', requireAdmin, handleGrantCustomer);

// Revoke template access from a customer
const handleRevokeCustomer = async (req, res) => {
  try {
    const { user_id, template_id, purchase_id } = req.body;
    const tId = parseInt(template_id, 10);

    // 1. Mark ALL matching purchases for this user and template as 'revoked'
    if (user_id && tId) {
      await query(`
        UPDATE purchases 
        SET refund_status = 'revoked', updated_at = NOW() 
        WHERE user_id = $1 AND template_id = $2
      `, [user_id, tId]);
    }
    if (purchase_id) {
      await query(`
        UPDATE purchases 
        SET refund_status = 'revoked', updated_at = NOW() 
        WHERE id::text = $1
      `, [String(purchase_id)]);
    }

    // 2. Remove from users.purchased_templates
    if (user_id) {
      const { rows } = await query('SELECT id, purchased_templates FROM users WHERE id = $1', [user_id]);
      if (rows.length > 0) {
        let existing = [];
        if (Array.isArray(rows[0].purchased_templates)) {
          existing = rows[0].purchased_templates;
        } else if (typeof rows[0].purchased_templates === 'string') {
          try { existing = JSON.parse(rows[0].purchased_templates); } catch {}
        }
        const updated = existing.filter(id => parseInt(id, 10) !== tId);
        await query('UPDATE users SET purchased_templates = $1, updated_at = NOW() WHERE id = $2', [JSON.stringify(updated), user_id]);
      }
    }

    res.json({ success: true, message: 'Access revoked successfully' });
  } catch (err) {
    console.error('Revoke error:', err);
    res.status(500).json({ error: err.message });
  }
};

router.post('/customers/revoke', requireAdmin, handleRevokeCustomer);
router.delete('/customers/revoke', requireAdmin, handleRevokeCustomer);
router.post('/admin-customers/revoke', requireAdmin, handleRevokeCustomer);

// Delete customer account
const handleDeleteCustomer = async (req, res) => {
  try {
    const userId = req.body?.user_id || req.params?.id;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Cleanly delete child rows first to prevent FK constraint failure
    await query('DELETE FROM reviews WHERE user_id = $1', [userId]);
    await query('DELETE FROM purchases WHERE user_id = $1', [userId]);
    await query('DELETE FROM users WHERE id = $1', [userId]);

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    console.error('Delete customer error:', err);
    res.status(500).json({ error: err.message });
  }
};

router.post('/customers/delete-user', requireAdmin, handleDeleteCustomer);
router.delete('/customers/:id', requireAdmin, handleDeleteCustomer);
router.post('/admin-customers/delete-user', requireAdmin, handleDeleteCustomer);

// General CRM Dispatcher for /admin-customers
router.all('/admin-customers', requireAdmin, async (req, res) => {
  const action = req.body?.action || req.query?.action;
  if (req.method === 'GET') {
    return handleGetCustomers(req, res);
  }
  if (action === 'grant') {
    return handleGrantCustomer(req, res);
  }
  if (action === 'revoke' || req.method === 'DELETE') {
    return handleRevokeCustomer(req, res);
  }
  if (action === 'delete_user') {
    return handleDeleteCustomer(req, res);
  }
  res.status(400).json({ error: 'Invalid action for admin-customers' });
});

// Direct email to a customer
router.post('/customers/email', requireAdmin, async (req, res) => {
  try {
    const { user_email, subject, message } = req.body;
    if (!user_email || !subject || !message) {
      return res.status(400).json({ error: 'Missing required email fields' });
    }

    await transporter.sendMail({
      from: `"Bizleap Support" <${process.env.SMTP_FROM || process.env.SMTP_USER || 'bizleap1@gmail.com'}>`,
      to: user_email,
      subject: subject,
      html: `
        <div style="font-family: sans-serif; padding: 24px; color: #0f172a; max-width: 600px;">
          <h2 style="margin-top: 0; color: #0f172a;">${subject}</h2>
          <p style="font-size: 14px; line-height: 1.6; white-space: pre-line;">${message}</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
          <p style="color: #64748b; font-size: 12px;">Bizleap Marketplace Team</p>
        </div>
      `
    });

    res.json({ success: true, message: 'Email sent successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 6. MARKETING CAMPAIGNS
// ==========================================

const getCampaignsHandler = async (req, res) => {
  try {
    const { rows: campaigns } = await query('SELECT * FROM campaigns ORDER BY created_at DESC');
    const [usersCountRes, buyersCountRes] = await Promise.all([
      query('SELECT COUNT(*) as count FROM users'),
      query('SELECT COUNT(DISTINCT user_id) as count FROM purchases')
    ]);

    const totalUsers = parseInt(usersCountRes.rows[0]?.count || 0, 10);
    const verifiedBuyers = parseInt(buyersCountRes.rows[0]?.count || 0, 10);

    const audienceStats = {
      totalUsers,
      verifiedBuyers,
      activeSubscribers: totalUsers
    };

    res.json({
      campaigns,
      audienceStats
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

router.get('/campaigns', requireAdmin, getCampaignsHandler);
router.get('/admin-campaigns', requireAdmin, getCampaignsHandler);

const handleSendCampaign = async (req, res) => {
  try {
    const { 
      campaignId,
      name, 
      type, 
      subject, 
      preview_text, 
      headline, 
      body_text, 
      button_text, 
      button_url, 
      template_id, 
      coupon_code, 
      audience_type, 
      test_email 
    } = req.body;

    if (!subject || !headline || !body_text) {
      return res.status(400).json({ error: 'Subject, headline, and message body are required.' });
    }

    // 1. Determine recipients
    let recipients = [];
    if (audience_type === 'test' && test_email) {
      recipients = [{ email: test_email }];
    } else if (audience_type === 'template_buyers') {
      const { rows } = await query(`
        SELECT DISTINCT u.email 
        FROM users u 
        JOIN purchases p ON u.id = p.user_id 
        WHERE u.email IS NOT NULL AND u.email != ''
      `);
      recipients = rows;
    } else {
      // All registered users
      const { rows } = await query(`
        SELECT DISTINCT email 
        FROM users 
        WHERE email IS NOT NULL AND email != ''
      `);
      recipients = rows;
    }

    // Fetch optional coupon details if coupon_code attached
    let couponDiscount = null;
    if (coupon_code) {
      const { rows: cRows } = await query('SELECT discount_type, discount_value FROM coupons WHERE UPPER(code) = UPPER($1)', [coupon_code.trim()]);
      if (cRows.length) {
        couponDiscount = cRows[0].discount_type === 'percentage' ? `${cRows[0].discount_value}% OFF` : `₹${cRows[0].discount_value} OFF`;
      }
    }

    // Fetch optional template details if template_id attached
    let templateObj = null;
    if (template_id) {
      const { rows: tRows } = await query('SELECT id, title, price, category, image FROM templates WHERE id = $1', [template_id]);
      if (tRows.length) templateObj = tRows[0];
    }

    let sent = 0;
    let failed = 0;

    for (const r of recipients) {
      if (r.email) {
        try {
          await sendCampaignEmail(r.email, {
            subject: subject,
            type: type || 'announcement',
            headline: headline,
            body_text: body_text,
            button_text: button_text || 'Explore Marketplace →',
            button_url: button_url || '/explore',
            template: templateObj,
            coupon_code: coupon_code || '',
            coupon_discount: couponDiscount,
            baseUrl: process.env.FRONTEND_URL || 'http://localhost:5173'
          });
          sent++;
        } catch (e) {
          console.warn(`Campaign send notice to ${r.email}:`, e.message);
          failed++;
        }
      }
    }

    // Record or update campaign in Neon DB
    const cid = campaignId || `camp_${Date.now()}`;
    const campName = name || subject;

    const { rows: cSaved } = await query(`
      INSERT INTO campaigns (
        id, name, subject, preview_text, type, headline, body_text,
        button_text, button_url, template_id, coupon_code,
        audience_type, recipients_count, sent_count, failed_count, status, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, 'sent', NOW())
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        subject = EXCLUDED.subject,
        preview_text = EXCLUDED.preview_text,
        type = EXCLUDED.type,
        headline = EXCLUDED.headline,
        body_text = EXCLUDED.body_text,
        button_text = EXCLUDED.button_text,
        button_url = EXCLUDED.button_url,
        template_id = EXCLUDED.template_id,
        coupon_code = EXCLUDED.coupon_code,
        audience_type = EXCLUDED.audience_type,
        recipients_count = EXCLUDED.recipients_count,
        sent_count = EXCLUDED.sent_count,
        failed_count = EXCLUDED.failed_count,
        status = 'sent'
      RETURNING *
    `, [
      cid, campName, subject, preview_text || '', type || 'announcement', headline, body_text,
      button_text || 'Explore Marketplace →', button_url || '/explore', template_id || null, coupon_code || null,
      audience_type || 'all', recipients.length, sent, failed
    ]);

    res.json({
      success: true,
      count: sent,
      sent_count: sent,
      failed_count: failed,
      campaign: cSaved[0],
      message: `🎉 Campaign successfully dispatched to ${sent} recipient(s)!`
    });
  } catch (err) {
    console.error('Send campaign error:', err);
    res.status(500).json({ error: err.message });
  }
};

router.post('/campaigns/send', requireAdmin, handleSendCampaign);
router.post('/campaigns', requireAdmin, handleSendCampaign);
router.post('/admin-campaigns', requireAdmin, handleSendCampaign);

const handleDeleteCampaign = async (req, res) => {
  try {
    const campaignId = req.params.id || req.query.id;
    if (!campaignId) {
      return res.status(400).json({ error: 'Missing campaign ID' });
    }
    await query('DELETE FROM campaigns WHERE id = $1', [campaignId]);
    res.json({ success: true, message: 'Campaign deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

router.delete('/campaigns/:id', requireAdmin, handleDeleteCampaign);
router.delete('/campaigns', requireAdmin, handleDeleteCampaign);
router.delete('/admin-campaigns', requireAdmin, handleDeleteCampaign);

// ==========================================
// 7. STORE ANNOUNCEMENTS & IMAGE UPLOADS
// ==========================================

const handleGetStoreAnnouncement = async (req, res) => {
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
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const handleStoreAnnouncement = async (req, res) => {
  try {
    const { 
      headline, 
      coupon_code, 
      discount_badge, 
      button_text, 
      button_url, 
      end_time, 
      theme, 
      is_enabled, 
      is_dismissible 
    } = req.body;

    const parsedEndTime = end_time 
      ? new Date(end_time).toISOString() 
      : new Date(Date.now() + 48 * 3600 * 1000).toISOString();

    const { rows } = await query(`
      INSERT INTO store_announcements (
        id, headline, coupon_code, discount_badge, button_text, 
        button_url, end_time, theme, is_enabled, is_dismissible, updated_at
      )
      VALUES ('primary_banner', $1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
      ON CONFLICT (id) DO UPDATE SET
        headline = EXCLUDED.headline,
        coupon_code = EXCLUDED.coupon_code,
        discount_badge = EXCLUDED.discount_badge,
        button_text = EXCLUDED.button_text,
        button_url = EXCLUDED.button_url,
        end_time = EXCLUDED.end_time,
        theme = EXCLUDED.theme,
        is_enabled = EXCLUDED.is_enabled,
        is_dismissible = EXCLUDED.is_dismissible,
        updated_at = NOW()
      RETURNING *
    `, [
      headline || '🔥 Weekend Mega Flash Sale Ends in:',
      coupon_code || '',
      discount_badge || '',
      button_text || 'Claim 50% OFF Now →',
      button_url || '/explore',
      parsedEndTime,
      theme || 'fire',
      is_enabled !== undefined ? Boolean(is_enabled) : true,
      is_dismissible !== undefined ? Boolean(is_dismissible) : true
    ]);

    const banner = rows[0];
    res.json({ 
      success: true, 
      banner: banner, 
      ...banner,
      message: '⚡ Flash sale top bar updated live on store!' 
    });
  } catch (err) {
    console.error('Store announcement save error:', err);
    res.status(500).json({ error: err.message });
  }
};

router.get('/store-announcements', handleGetStoreAnnouncement);
router.get('/announcement-banner', handleGetStoreAnnouncement);
router.post('/store-announcements', requireAdmin, handleStoreAnnouncement);
router.post('/announcement-banner', requireAdmin, handleStoreAnnouncement);

router.post('/upload-image', requireAdmin, uploadImage.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file uploaded' });
  }
  const relativeUrl = `/uploads/${req.file.filename}`;
  res.json({ success: true, url: relativeUrl, publicUrl: relativeUrl });
});

export default router;
