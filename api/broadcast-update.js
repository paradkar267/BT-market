import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'dns';

dns.setDefaultResultOrder('ipv4first');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabaseAdmin = (supabaseUrl && supabaseServiceKey)
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

function generateBroadcastHtml({ templateTitle, templateCategory, version, changelog, hostUrl, downloadUrl }) {
  const targetDownload = downloadUrl || `${hostUrl}/dashboard?tab=templates`;
  const formattedChangelog = (changelog || '• General performance enhancements, bug fixes, and component updates')
    .split('\n')
    .filter(line => line.trim())
    .map(line => `<li style="margin-bottom: 6px; color: #334155; font-size: 13px; line-height: 1.5;">${line.replace(/^[•\-\*]\s*/, '')}</li>`)
    .join('');

  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Update Available: ${templateTitle} (${version})</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a;">
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f8fafc; padding: 40px 16px;">
      <tr>
        <td align="center">
          <table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
            
            <!-- Clean White Header -->
            <tr>
              <td style="background-color: #ffffff; padding: 32px 32px 24px; text-align: left; border-bottom: 1px solid #f1f5f9;">
                <table cellpadding="0" cellspacing="0" border="0" width="100%">
                  <tr>
                    <td>
                      <span style="color: #4f46e5; font-size: 22px; font-weight: 900; letter-spacing: -0.5px;">BIZLEAP</span>
                      <span style="color: #64748b; font-size: 11px; font-weight: 700; margin-left: 6px; text-transform: uppercase; letter-spacing: 1px;">Marketplace</span>
                    </td>
                    <td align="right">
                      <span style="background-color: #eef2ff; border: 1px solid #c7d2fe; color: #4338ca; font-size: 11px; font-weight: 800; padding: 4px 12px; border-radius: 20px; text-transform: uppercase; display: inline-block;">
                        ⚡ Free Lifetime Update
                      </span>
                    </td>
                  </tr>
                </table>
                <h1 style="color: #0f172a; font-size: 22px; font-weight: 900; margin: 20px 0 6px; line-height: 1.25;">
                  New Version Available for Download! 🚀
                </h1>
                <p style="color: #64748b; font-size: 13px; margin: 0; line-height: 1.5;">
                  A new version <strong style="color: #4f46e5;">${version}</strong> of <strong>${templateTitle}</strong> is now live on your dashboard.
                </p>
              </td>
            </tr>

            <!-- Template Info Card -->
            <tr>
              <td style="padding: 28px 32px 16px;">
                <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px 20px;">
                  <div style="display: inline-block; padding: 2px 8px; background-color: #e0e7ff; color: #4338ca; border-radius: 5px; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-bottom: 6px;">
                    ${templateCategory || 'Web Template'}
                  </div>
                  <h3 style="margin: 0 0 6px; color: #0f172a; font-size: 17px; font-weight: 800;">
                    ${templateTitle}
                  </h3>
                  <p style="margin: 0; color: #64748b; font-size: 12px;">
                    Release Version: <strong style="color: #0f172a;">${version}</strong> &bull; Status: <strong style="color: #059669;">Ready for Download</strong>
                  </p>
                </div>
              </td>
            </tr>

            <!-- Release Notes / Changelog -->
            <tr>
              <td style="padding: 0 32px 24px;">
                <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px 22px;">
                  <h4 style="margin: 0 0 12px; color: #0f172a; font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">
                    📋 Release Changelog:
                  </h4>
                  <ul style="margin: 0; padding-left: 20px;">
                    ${formattedChangelog}
                  </ul>
                </div>
              </td>
            </tr>

            <!-- Download CTA Button -->
            <tr>
              <td style="padding: 0 32px 28px; text-align: center;">
                <table cellpadding="0" cellspacing="0" border="0" width="100%">
                  <tr>
                    <td style="background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%); border-radius: 12px; text-align: center;">
                      <a href="${targetDownload}" target="_blank" style="display: block; padding: 15px 28px; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 800; letter-spacing: 0.3px;">
                        ⬇ Download Updated ZIP Files &rarr;
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Guarantee Notice -->
            <tr>
              <td style="padding: 0 32px 28px;">
                <div style="background-color: #ecfdf5; border-radius: 10px; border-left: 4px solid #10b981; padding: 12px 16px;">
                  <p style="margin: 0; font-size: 12px; color: #065f46; line-height: 1.5;">
                    <strong>🛡️ Lifetime Updates Reminder:</strong> As an original buyer on Bizleap Marketplace, all version upgrades are 100% free forever.
                  </p>
                </div>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background-color: #f1f5f9; padding: 18px 32px; text-align: center; border-top: 1px solid #e2e8f0;">
                <p style="color: #64748b; font-size: 11px; margin: 0;">
                  © ${new Date().getFullYear()} Bizleap Marketplace Inc. &bull; Sent to verified owners of ${templateTitle}.
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
}

export default async function handler(req, res) {
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

  if (!supabaseAdmin) {
    return res.status(500).json({ error: 'Server configuration error: Missing Supabase Admin' });
  }

  try {
    const { templateId, version, changelog, frontendUrl } = req.body || {};

    if (!templateId || !version) {
      return res.status(400).json({ error: 'templateId and version are required' });
    }

    // 1. Fetch Template Details
    const { data: template, error: tErr } = await supabaseAdmin
      .from('templates')
      .select('*')
      .eq('id', templateId)
      .single();

    if (tErr || !template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    // 2. Fetch all buyers from purchases table
    const { data: purchases, error: pErr } = await supabaseAdmin
      .from('purchases')
      .select('user_id, payment_id')
      .eq('template_id', templateId);

    if (pErr) {
      console.error('Error fetching purchases for template:', pErr);
    }

    const uniqueUserIds = [...new Set((purchases || []).map(p => p.user_id).filter(Boolean))];

    // 3. Resolve Buyer Emails
    const emailList = [];
    for (const uId of uniqueUserIds) {
      try {
        const { data: uData } = await supabaseAdmin.auth.admin.getUserById(uId);
        if (uData?.user?.email && !emailList.includes(uData.user.email)) {
          emailList.push(uData.user.email);
        }
      } catch {
        // Skip unresolvable user ID
      }
    }

    if (emailList.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        recipients: [],
        message: `No buyers found for '${template.title}' yet. No emails sent.`
      });
    }

    // 4. Setup Transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD || process.env.SMTP_PASS
      }
    });

    const hostUrl = frontendUrl || process.env.FRONTEND_URL || 'https://bt-templates.vercel.app';
    const downloadUrl = `${hostUrl}/dashboard?tab=templates`;

    const htmlContent = generateBroadcastHtml({
      templateTitle: template.title,
      templateCategory: template.category,
      version: version.startsWith('v') ? version : `v${version}`,
      changelog,
      hostUrl,
      downloadUrl
    });

    const results = [];
    for (const recipientEmail of emailList) {
      try {
        const info = await transporter.sendMail({
          from: `"Bizleap Marketplace" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
          to: recipientEmail,
          subject: `⚡ Update Available: ${template.title} updated to ${version}!`,
          html: htmlContent
        });
        results.push({ email: recipientEmail, status: 'sent', messageId: info.messageId });
      } catch (sendErr) {
        console.error(`Failed sending update broadcast to ${recipientEmail}:`, sendErr?.message);
        results.push({ email: recipientEmail, status: 'failed', error: sendErr?.message });
      }
    }

    res.status(200).json({
      success: true,
      count: results.filter(r => r.status === 'sent').length,
      total: emailList.length,
      recipients: results,
      message: `Broadcast successfully sent to ${results.filter(r => r.status === 'sent').length} buyers!`
    });

  } catch (err) {
    console.error('Broadcast update handler error:', err);
    res.status(500).json({ error: err.message || 'Failed to send broadcast update' });
  }
}
