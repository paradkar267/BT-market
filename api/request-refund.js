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

const rawPass = (process.env.SMTP_PASSWORD || process.env.SMTP_PASS || '').replace(/\s+/g, '');
const isGmail = (process.env.SMTP_HOST || '').includes('gmail') || (process.env.SMTP_USER || '').includes('gmail');
const transporter = isGmail
  ? nodemailer.createTransport({ service: 'gmail', auth: { user: process.env.SMTP_USER, pass: rawPass }, tls: { rejectUnauthorized: false } })
  : nodemailer.createTransport({ host: process.env.SMTP_HOST || 'smtp.gmail.com', port: parseInt(process.env.SMTP_PORT, 10) || 587, secure: false, auth: { user: process.env.SMTP_USER, pass: rawPass }, tls: { rejectUnauthorized: false } });

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
  if (!supabaseAdmin) return res.status(500).json({ error: 'Server misconfiguration' });

  // Auth: must be a logged-in user
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  const { data: { user }, error: authErr } = await supabaseAdmin.auth.getUser(token);
  if (authErr || !user) return res.status(401).json({ error: 'Please log in to request a refund' });

  const { templateId, reason } = req.body || {};
  if (!templateId || !reason?.trim()) {
    return res.status(400).json({ error: 'templateId and reason are required' });
  }

  // Verify the user actually owns this template
  const { data: purchase } = await supabaseAdmin
    .from('purchases')
    .select('id, status, payment_id, created_at')
    .eq('user_id', user.id)
    .eq('template_id', templateId)
    .maybeSingle();

  if (!purchase) {
    return res.status(403).json({ error: 'No purchase found for this template' });
  }
  if (purchase.status === 'refunded') {
    return res.status(400).json({ error: 'This order has already been refunded' });
  }

  // Get template title
  const { data: template } = await supabaseAdmin
    .from('templates')
    .select('title, price')
    .eq('id', templateId)
    .single();

  const templateTitle = template?.title || `Template #${templateId}`;
  const customerEmail = user.email;
  const customerName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Customer';
  const adminEmail = process.env.ADMIN_EMAIL || 'bizleap1@gmail.com';
  const purchaseDate = new Date(purchase.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  // Email to admin
  const adminHtml = `
<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;background:#f8f9fa;padding:32px;">
<div style="max-width:580px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;">
  <div style="background:#1a1a1a;padding:28px 32px;">
    <h1 style="color:#fff;margin:0;font-size:20px;">⚠️ New Refund Request</h1>
    <p style="color:#9ca3af;margin:6px 0 0;font-size:13px;">A customer has requested a refund — action required</p>
  </div>
  <div style="padding:32px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;overflow:hidden;">
      <tr><td style="padding:16px 20px;border-bottom:1px solid #fecaca;">
        <b style="color:#6b7280;font-size:12px;text-transform:uppercase;">Customer</b><br>
        <span style="font-size:14px;font-weight:700;">${customerName} (${customerEmail})</span>
      </td></tr>
      <tr><td style="padding:16px 20px;border-bottom:1px solid #fecaca;">
        <b style="color:#6b7280;font-size:12px;text-transform:uppercase;">Template</b><br>
        <span style="font-size:14px;font-weight:700;">${templateTitle}</span>
      </td></tr>
      <tr><td style="padding:16px 20px;border-bottom:1px solid #fecaca;">
        <b style="color:#6b7280;font-size:12px;text-transform:uppercase;">Payment ID</b><br>
        <span style="font-family:monospace;font-size:13px;">${purchase.payment_id || `PUR-${purchase.id}`}</span>
      </td></tr>
      <tr><td style="padding:16px 20px;border-bottom:1px solid #fecaca;">
        <b style="color:#6b7280;font-size:12px;text-transform:uppercase;">Purchase Date</b><br>
        <span style="font-size:14px;">${purchaseDate}</span>
      </td></tr>
      <tr><td style="padding:16px 20px;">
        <b style="color:#6b7280;font-size:12px;text-transform:uppercase;">Reason</b><br>
        <span style="font-size:14px;color:#374151;">${reason}</span>
      </td></tr>
    </table>
    <p style="margin-top:24px;font-size:13px;color:#6b7280;">Login to the admin panel and go to <b>Customer Purchases & Orders</b> to approve or decline this refund.</p>
  </div>
</div>
</body></html>`;

  // Confirmation email to customer
  const customerHtml = `
<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;background:#f8f9fa;padding:32px;">
<div style="max-width:580px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;">
  <div style="background:#1a1a1a;padding:28px 32px;">
    <h1 style="color:#fff;margin:0;font-size:20px;">BizLeap Market</h1>
    <p style="color:#9ca3af;margin:4px 0 0;font-size:13px;">Refund Request Received</p>
  </div>
  <div style="padding:32px;">
    <p style="font-size:15px;color:#374151;">Hi ${customerName},</p>
    <p style="font-size:14px;color:#374151;line-height:1.7;">
      We've received your refund request for <strong>${templateTitle}</strong>. Our team will review it within <strong>1–2 business days</strong> and get back to you.
    </p>
    <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:16px 20px;margin:20px 0;">
      <p style="margin:0 0 8px;font-size:12px;font-weight:700;text-transform:uppercase;color:#6b7280;">Your Request Summary</p>
      <p style="margin:4px 0;font-size:13px;"><b>Template:</b> ${templateTitle}</p>
      <p style="margin:4px 0;font-size:13px;"><b>Reason:</b> ${reason}</p>
      <p style="margin:4px 0;font-size:13px;"><b>Requested On:</b> ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
    </div>
    <p style="font-size:13px;color:#6b7280;">Questions? Reply to this email and we'll be happy to help.</p>
  </div>
</div>
</body></html>`;

  try {
    await Promise.all([
      transporter.sendMail({
        from: `"BizLeap Market" <${process.env.SMTP_USER}>`,
        to: adminEmail,
        subject: `⚠️ Refund Request: ${customerName} — "${templateTitle}"`,
        html: adminHtml
      }),
      transporter.sendMail({
        from: `"BizLeap Market" <${process.env.SMTP_USER}>`,
        to: customerEmail,
        subject: `Your Refund Request for "${templateTitle}" — Received`,
        html: customerHtml
      })
    ]);

    return res.status(200).json({ success: true, message: 'Refund request submitted. We\'ll review it within 1–2 business days.' });
  } catch (err) {
    console.error('Refund request email error:', err);
    return res.status(500).json({ error: 'Failed to send refund request. Please email us directly.' });
  }
}
