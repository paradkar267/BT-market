import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';
import dns from 'dns';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });
dotenv.config();

dns.setDefaultResultOrder('ipv4first');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAdmin = (supabaseUrl && supabaseServiceKey)
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

const adminEmail = (process.env.ADMIN_EMAIL || 'bizleap1@gmail.com').toLowerCase();

// Nodemailer transporter (reuse same pattern as emailService.js)
const rawPass = (process.env.SMTP_PASSWORD || process.env.SMTP_PASS || '').replace(/\s+/g, '');
const isGmail = (process.env.SMTP_HOST || '').includes('gmail') || (process.env.SMTP_USER || '').includes('gmail');
const transporter = isGmail
  ? nodemailer.createTransport({ service: 'gmail', auth: { user: process.env.SMTP_USER, pass: rawPass }, tls: { rejectUnauthorized: false } })
  : nodemailer.createTransport({ host: process.env.SMTP_HOST || 'smtp.gmail.com', port: parseInt(process.env.SMTP_PORT, 10) || 587, secure: false, auth: { user: process.env.SMTP_USER, pass: rawPass }, tls: { rejectUnauthorized: false } });

async function sendRefundEmail({ to, customerName, templateTitle, amount, refundId, reason, frontendUrl }) {
  const baseUrl = frontendUrl || process.env.FRONTEND_URL || 'http://localhost:5173';
  const refundDate = new Date().toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric' });
  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f8f9fa;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f8f9fa;padding:32px 16px;">
    <tr><td align="center">
      <table cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#1a1a1a 0%,#2d2d2d 100%);padding:32px 40px;text-align:center;">
            <h1 style="color:#ffffff;margin:0;font-size:22px;font-weight:900;letter-spacing:-0.5px;">BizLeap Market</h1>
            <p style="color:#9ca3af;margin:6px 0 0;font-size:13px;">Digital Template Marketplace</p>
          </td>
        </tr>
        <!-- Refund Notice Banner -->
        <tr>
          <td style="background:#fff7ed;border-bottom:1px solid #fed7aa;padding:20px 40px;text-align:center;">
            <p style="margin:0;font-size:28px;">💳</p>
            <h2 style="color:#c2410c;margin:8px 0 4px;font-size:18px;font-weight:900;">Refund Processed Successfully</h2>
            <p style="color:#9a3412;margin:0;font-size:13px;">Your refund has been initiated and is on the way</p>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:36px 40px;">
            <p style="color:#374151;font-size:15px;margin:0 0 24px;">Hi ${customerName},</p>
            <p style="color:#374151;font-size:14px;line-height:1.7;margin:0 0 28px;">
              Your refund request has been processed by our team. The amount will be credited back to your original payment method within <strong>5–7 business days</strong> depending on your bank.
            </p>
            <!-- Refund Details Card -->
            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;margin-bottom:28px;">
              <tr><td style="padding:20px 24px;border-bottom:1px solid #e5e7eb;">
                <p style="margin:0;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#6b7280;">Refund Details</p>
              </td></tr>
              <tr><td style="padding:16px 24px;border-bottom:1px solid #f3f4f6;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="color:#6b7280;font-size:13px;">Template</td>
                    <td style="color:#111827;font-size:13px;font-weight:700;text-align:right;">${templateTitle}</td>
                  </tr>
                </table>
              </td></tr>
              <tr><td style="padding:16px 24px;border-bottom:1px solid #f3f4f6;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="color:#6b7280;font-size:13px;">Refund Amount</td>
                    <td style="color:#059669;font-size:16px;font-weight:900;text-align:right;">₹${amount}</td>
                  </tr>
                </table>
              </td></tr>
              <tr><td style="padding:16px 24px;border-bottom:1px solid #f3f4f6;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="color:#6b7280;font-size:13px;">Refund Reference ID</td>
                    <td style="font-family:monospace;color:#374151;font-size:12px;font-weight:700;text-align:right;">${refundId}</td>
                  </tr>
                </table>
              </td></tr>
              <tr><td style="padding:16px 24px;border-bottom:1px solid #f3f4f6;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="color:#6b7280;font-size:13px;">Processed On</td>
                    <td style="color:#374151;font-size:13px;font-weight:700;text-align:right;">${refundDate}</td>
                  </tr>
                </table>
              </td></tr>
              ${reason ? `<tr><td style="padding:16px 24px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="color:#6b7280;font-size:13px;">Reason</td>
                    <td style="color:#374151;font-size:13px;text-align:right;">${reason}</td>
                  </tr>
                </table>
              </td></tr>` : ''}
            </table>
            <p style="color:#6b7280;font-size:13px;line-height:1.6;margin:0 0 24px;">
              Please note that your download access for this template has been revoked. If you believe this was done in error, please contact our support team.
            </p>
            <div style="text-align:center;margin:0 0 28px;">
              <a href="${baseUrl}/explore" style="display:inline-block;background:#000000;color:#ffffff;text-decoration:none;padding:13px 32px;border-radius:10px;font-weight:700;font-size:14px;">Browse More Templates →</a>
            </div>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:20px 40px;text-align:center;">
            <p style="color:#9ca3af;font-size:12px;margin:0;">© 2025 BizLeap Market • <a href="${baseUrl}" style="color:#6b7280;text-decoration:none;">bizleap.market</a></p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  await transporter.sendMail({
    from: `"BizLeap Market" <${process.env.SMTP_USER}>`,
    to,
    subject: `💳 Refund Processed: ₹${amount} for "${templateTitle}" — Ref: ${refundId}`,
    html
  });
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
  if (!supabaseAdmin) return res.status(500).json({ error: 'Server misconfiguration' });

  // Admin auth check
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  const { data: { user }, error: authErr } = await supabaseAdmin.auth.getUser(token);
  if (authErr || !user) return res.status(401).json({ error: 'Unauthorized' });
  if (user.email?.toLowerCase() !== adminEmail) return res.status(403).json({ error: 'Admin access only' });

  const { purchaseId, reason = 'Refund issued by admin', frontendUrl } = req.body || {};
  if (!purchaseId) return res.status(400).json({ error: 'purchaseId is required' });

  try {
    // 1. Fetch the purchase record
    const { data: purchase, error: fetchErr } = await supabaseAdmin
      .from('purchases')
      .select('*')
      .eq('id', purchaseId)
      .single();

    if (fetchErr || !purchase) return res.status(404).json({ error: 'Purchase not found' });
    if (purchase.status === 'refunded') return res.status(400).json({ error: 'This order has already been refunded' });

    // 2. Get template and customer details for the email
    const [{ data: template }, { data: { user: customer } }] = await Promise.all([
      supabaseAdmin.from('templates').select('title, price').eq('id', purchase.template_id).single(),
      supabaseAdmin.auth.admin.getUserById(purchase.user_id)
    ]);

    const templateTitle = template?.title || `Template #${purchase.template_id}`;
    const refundAmount = purchase.refund_amount || template?.price || '0';
    const customerEmail = customer?.email;
    const customerName = customer?.user_metadata?.full_name || customer?.email?.split('@')[0] || 'Customer';

    // 3. Attempt Razorpay refund if payment_id looks like a real Razorpay ID
    let razorpayRefundId = null;
    const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;
    const paymentId = purchase.payment_id;

    if (razorpayKeyId && razorpayKeySecret && paymentId && paymentId.startsWith('pay_')) {
      try {
        const auth = Buffer.from(`${razorpayKeyId}:${razorpayKeySecret}`).toString('base64');
        const rzpRes = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}/refund`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Basic ${auth}` },
          body: JSON.stringify({ amount: Math.round(parseFloat(refundAmount) * 100), notes: { reason, refunded_by: user.email } })
        });
        const rzpData = await rzpRes.json();
        if (rzpRes.ok && rzpData.id) {
          razorpayRefundId = rzpData.id;
        }
      } catch (rzpErr) {
        console.error('Razorpay refund error (non-fatal):', rzpErr.message);
      }
    }

    // 4. Mark purchase as refunded in database (license revoked)
    const refundId = razorpayRefundId || `REF-${Date.now().toString(36).toUpperCase()}`;
    const { error: updateErr } = await supabaseAdmin
      .from('purchases')
      .update({
        status: 'refunded',
        refund_id: refundId,
        refunded_at: new Date().toISOString(),
        refund_reason: reason,
        refund_amount: parseFloat(refundAmount),
        refunded_by: user.email
      })
      .eq('id', purchaseId);

    if (updateErr) throw updateErr;

    // 5. Send refund confirmation email to customer
    if (customerEmail) {
      try {
        await sendRefundEmail({
          to: customerEmail,
          customerName,
          templateTitle,
          amount: parseFloat(refundAmount).toFixed(2),
          refundId,
          reason,
          frontendUrl
        });
      } catch (emailErr) {
        console.error('Refund email failed (non-fatal):', emailErr.message);
      }
    }

    return res.status(200).json({
      success: true,
      refundId,
      razorpayRefundId,
      message: `Refund processed${razorpayRefundId ? ` via Razorpay (${razorpayRefundId})` : ' manually'}. Customer email sent.`
    });
  } catch (err) {
    console.error('Refund handler error:', err);
    return res.status(500).json({ error: err.message });
  }
}
