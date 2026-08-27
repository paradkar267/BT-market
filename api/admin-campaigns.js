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

// In-memory fallback campaign store if Supabase table is not yet migrated
let fallbackCampaigns = [
  {
    id: 'camp-sample-1',
    name: 'SaaS Launchpad Pro V2 Announcement',
    subject: '🚀 Introducing SaaS Launchpad Pro 2.0 — Now Live with Next.js 15 & Tailwind 4!',
    preview_text: 'Get 40% OFF this weekend on Bizleap Marketplace',
    type: 'launch',
    headline: 'SaaS Launchpad Pro 2.0 is Here! 🚀',
    body_text: '• Built from the ground up for Next.js 15 App Router\n• Includes 12 new modern SaaS dashboards and auth screens\n• Complete Stripe & LemonSqueezy billing integrations\n• Fully documented with 100/100 Lighthouse score',
    button_text: 'Explore SaaS Launchpad Pro →',
    button_url: 'https://bt-templates.vercel.app/explore',
    coupon_code: 'LAUNCH50',
    audience_type: 'all',
    recipients_count: 142,
    sent_count: 142,
    status: 'sent',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: 'camp-sample-2',
    name: 'Independence Day 50% Flash Sale',
    subject: '🔥 Flash Sale: 50% OFF All Premium Digital Templates!',
    preview_text: 'Use promo code LAUNCH50 at checkout. 48 hours only!',
    type: 'sale',
    headline: 'Mega Marketplace Flash Sale — 50% OFF! 🔥',
    body_text: '• Save 50% on every single template in the store\n• Instant source code download & lifetime updates included\n• Commercial license granted for unlimited personal & client projects\n• Valid for the first 50 buyers only!',
    button_text: 'Claim 50% Discount Now →',
    button_url: 'https://bt-templates.vercel.app/explore',
    coupon_code: 'LAUNCH50',
    audience_type: 'all',
    recipients_count: 180,
    sent_count: 178,
    status: 'sent',
    created_at: new Date(Date.now() - 86400000 * 5).toISOString()
  }
];

export function generateCampaignHtml({
  type,
  headline,
  body_text,
  button_text,
  button_url,
  template,
  coupon_code,
  coupon_discount,
  baseUrl
}) {
  const prodHost = process.env.FRONTEND_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) || (baseUrl && !baseUrl.includes('localhost') ? baseUrl : 'https://bizleap.in');
  const hostUrl = prodHost.replace(/\/$/, '');

  let ctaUrl = button_url || '/explore';
  if (ctaUrl.startsWith('/')) {
    ctaUrl = `${hostUrl}${ctaUrl}`;
  } else if (ctaUrl.includes('localhost')) {
    ctaUrl = ctaUrl.replace(/^http:\/\/localhost(:\d+)?/, hostUrl);
  }
  const ctaText = button_text || 'Explore Marketplace →';

  // Badge configurations based on type
  const typeConfigs = {
    launch: {
      badge: '🚀 NEW RELEASE LAUNCH',
      badgeBg: 'rgba(79, 70, 229, 0.2)',
      badgeBorder: 'rgba(129, 140, 248, 0.3)',
      badgeColor: '#c7d2fe',
      gradient: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)'
    },
    sale: {
      badge: '🔥 LIMITED TIME FLASH SALE',
      badgeBg: 'rgba(244, 63, 94, 0.2)',
      badgeBorder: 'rgba(251, 113, 133, 0.3)',
      badgeColor: '#fecdd3',
      gradient: 'linear-gradient(135deg, #4c0519 0%, #881337 50%, #0f172a 100%)'
    },
    vip: {
      badge: '🎁 EXCLUSIVE VIP OFFER',
      badgeBg: 'rgba(16, 185, 129, 0.2)',
      badgeBorder: 'rgba(52, 211, 153, 0.3)',
      badgeColor: '#a7f3d0',
      gradient: 'linear-gradient(135deg, #064e3b 0%, #0f172a 100%)'
    },
    announcement: {
      badge: '📢 MARKETPLACE ANNOUNCEMENT',
      badgeBg: 'rgba(245, 158, 11, 0.2)',
      badgeBorder: 'rgba(251, 191, 36, 0.3)',
      badgeColor: '#fde68a',
      gradient: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
    }
  };

  const currentType = typeConfigs[type] || typeConfigs.announcement;

  // Format bullets or paragraph lines
  const formattedBody = (body_text || '')
    .split('\n')
    .filter(l => l.trim())
    .map(line => {
      const isBullet = line.trim().startsWith('•') || line.trim().startsWith('-') || line.trim().startsWith('*');
      if (isBullet) {
        return `<li style="margin-bottom: 8px; color: #334155; font-size: 14px; line-height: 1.6;">${line.trim().replace(/^[•\-\*]\s*/, '')}</li>`;
      }
      return `<p style="margin: 0 0 12px; color: #334155; font-size: 14px; line-height: 1.6;">${line}</p>`;
    })
    .join('');

  const hasBullets = body_text && (body_text.includes('•') || body_text.includes('-') || body_text.includes('*'));

  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${headline || 'Bizleap Special Announcement'}</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a;">
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f8fafc; padding: 40px 16px;">
      <tr>
        <td align="center">
          <table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.06);">
            
            <!-- Header Banner -->
            <tr>
              <td style="background: ${currentType.gradient}; padding: 34px 32px 30px; text-align: left;">
                <table cellpadding="0" cellspacing="0" border="0" width="100%">
                  <tr>
                    <td>
                      <span style="color: #ffffff; font-size: 22px; font-weight: 900; letter-spacing: -0.5px;">BIZLEAP</span>
                      <span style="color: #818cf8; font-size: 12px; font-weight: 600; margin-left: 8px;">Marketplace</span>
                    </td>
                    <td align="right">
                      <span style="background-color: ${currentType.badgeBg}; border: 1px solid ${currentType.badgeBorder}; color: ${currentType.badgeColor}; font-size: 10.5px; font-weight: 800; padding: 4px 10px; border-radius: 20px; text-transform: uppercase;">
                        ${currentType.badge}
                      </span>
                    </td>
                  </tr>
                </table>
                <h1 style="color: #ffffff; font-size: 24px; font-weight: 900; margin: 24px 0 8px; line-height: 1.25; letter-spacing: -0.5px;">
                  ${headline || 'Exciting Updates on Bizleap!'}
                </h1>
              </td>
            </tr>

            <!-- Coupon Highlight Strip (If promo code attached) -->
            ${coupon_code ? `
            <tr>
              <td style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 14px 32px; text-align: center;">
                <table cellpadding="0" cellspacing="0" border="0" width="100%">
                  <tr>
                    <td align="center">
                      <span style="color: #ffffff; font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">
                        🏷️ Use Promo Code: <strong style="background-color: #ffffff; color: #b45309; padding: 4px 10px; border-radius: 6px; font-size: 15px; font-family: monospace; margin-left: 6px; letter-spacing: 1px;">${coupon_code}</strong>
                        ${coupon_discount ? `<span style="margin-left: 8px;">(${coupon_discount})</span>` : ''}
                      </span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            ` : ''}

            <!-- Main Body Content -->
            <tr>
              <td style="padding: 32px 32px 20px;">
                <div style="background-color: #ffffff; border-radius: 12px;">
                  ${hasBullets ? `
                    <ul style="margin: 0; padding-left: 20px; line-height: 1.6;">
                      ${formattedBody}
                    </ul>
                  ` : formattedBody}
                </div>
              </td>
            </tr>

            <!-- Featured Template Card (If template selected) -->
            ${template ? `
            <tr>
              <td style="padding: 0 32px 24px;">
                <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; display: flex; align-items: center;">
                  <table cellpadding="0" cellspacing="0" border="0" width="100%">
                    <tr>
                      ${template.image ? `
                      <td style="width: 80px; vertical-align: top; padding-right: 16px;">
                        <img src="${template.image}" alt="${template.title}" style="width: 80px; height: 60px; object-fit: cover; border-radius: 8px; border: 1px solid #e2e8f0;" />
                      </td>
                      ` : ''}
                      <td style="vertical-align: middle;">
                        <span style="background-color: #e0e7ff; color: #4338ca; font-size: 10px; font-weight: 800; padding: 2px 6px; border-radius: 4px; text-transform: uppercase;">
                          ${template.category || 'Template'}
                        </span>
                        <h4 style="margin: 4px 0 2px; color: #0f172a; font-size: 15px; font-weight: 800;">
                          ${template.title}
                        </h4>
                        <p style="margin: 0; color: #64748b; font-size: 12px;">
                          Available for instant download with Commercial License.
                        </p>
                      </td>
                    </tr>
                  </table>
                </div>
              </td>
            </tr>
            ` : ''}

            <!-- Call To Action Button -->
            <tr>
              <td style="padding: 10px 32px 30px; text-align: center;">
                <table cellpadding="0" cellspacing="0" border="0" width="100%">
                  <tr>
                    <td align="center">
                      <a href="${ctaUrl}" target="_blank" style="display: inline-block; padding: 16px 36px; background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%); color: #ffffff; text-decoration: none; border-radius: 12px; font-size: 16px; font-weight: 800; letter-spacing: 0.3px; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);">
                        ${ctaText}
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Trust / Guarantee Badge -->
            <tr>
              <td style="padding: 0 32px 28px;">
                <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px 18px; text-align: center;">
                  <p style="margin: 0; font-size: 12px; color: #64748b; line-height: 1.5;">
                    🛡️ <strong>100% Quality Guaranteed:</strong> Clean source code, Figma files, live preview links, and lifetime updates on all Bizleap digital assets.
                  </p>
                </div>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background-color: #f1f5f9; padding: 22px 32px; text-align: center; border-top: 1px solid #e2e8f0;">
                <p style="color: #64748b; font-size: 11px; margin: 0 0 6px;">
                  © ${new Date().getFullYear()} Bizleap Marketplace Inc. &bull; <a href="${hostUrl}" style="color: #6366f1; text-decoration: none;">www.bizleap.in</a>
                </p>
                <p style="color: #94a3b8; font-size: 10px; margin: 0;">
                  You received this email because you are a registered user on Bizleap Marketplace.
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

  const { action } = req.query || {};

  // 1. GET CAMPAIGNS LIST & AUDIENCE STATS
  if (req.method === 'GET') {
    try {
      let dbCampaigns = [];
      if (supabaseAdmin) {
        const { data, error } = await supabaseAdmin
          .from('campaigns')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          dbCampaigns = data;
        }
      }

      // Merge with fallback sample campaigns if empty
      const allCampaigns = dbCampaigns.length ? dbCampaigns : fallbackCampaigns;

      // Calculate Audience Counts
      let totalUsersCount = 0;
      if (supabaseAdmin) {
        try {
          const { data: usersData } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
          totalUsersCount = usersData?.users?.length || 0;
        } catch {
          totalUsersCount = 150; // Fallback
        }
      }

      return res.status(200).json({
        success: true,
        campaigns: allCampaigns,
        audienceStats: {
          totalUsers: totalUsersCount || 150,
          verifiedBuyers: 48,
          activeSubscribers: totalUsersCount || 150
        }
      });
    } catch (err) {
      console.error('Error fetching campaigns:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  // 2. POST SEND / CREATE CAMPAIGN
  if (req.method === 'POST') {
    try {
      const {
        name,
        subject,
        preview_text,
        type = 'announcement',
        headline,
        body_text,
        button_text,
        button_url,
        template_id,
        coupon_code,
        audience_type = 'all',
        audience_filter,
        test_email,
        frontendUrl
      } = req.body || {};

      if (!subject || !headline || !body_text) {
        return res.status(400).json({ error: 'Subject, headline, and message body are required' });
      }

      // Fetch template if attached
      let attachedTemplate = null;
      if (template_id && supabaseAdmin) {
        const { data: t } = await supabaseAdmin
          .from('templates')
          .select('*')
          .eq('id', template_id)
          .single();
        attachedTemplate = t;
      }

      // Resolve Target Audience Emails
      let targetEmails = [];

      if (audience_type === 'test') {
        const emailToSend = test_email || process.env.SMTP_USER || 'bizleap1@gmail.com';
        targetEmails = [emailToSend];
      } else if (audience_type === 'template_buyers' && template_id && supabaseAdmin) {
        const { data: purchases } = await supabaseAdmin
          .from('purchases')
          .select('user_id')
          .eq('template_id', template_id);

        const uids = [...new Set((purchases || []).map(p => p.user_id).filter(Boolean))];
        for (const uid of uids) {
          try {
            const { data: uData } = await supabaseAdmin.auth.admin.getUserById(uid);
            if (uData?.user?.email && !targetEmails.includes(uData.user.email)) {
              targetEmails.push(uData.user.email);
            }
          } catch {
            // skip
          }
        }
      } else {
        // All Users / Category Subscribers
        if (supabaseAdmin) {
          try {
            const { data: usersData } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
            if (usersData?.users) {
              targetEmails = usersData.users.map(u => u.email).filter(Boolean);
            }
          } catch {
            // Fallback default admin email
            targetEmails = [process.env.SMTP_USER || 'bizleap1@gmail.com'];
          }
        } else {
          targetEmails = [process.env.SMTP_USER || 'bizleap1@gmail.com'];
        }
      }

      // Remove duplicates
      targetEmails = [...new Set(targetEmails)];

      // Setup Nodemailer Transporter
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

      const emailHtml = generateCampaignHtml({
        type,
        headline,
        body_text,
        button_text,
        button_url,
        template: attachedTemplate,
        coupon_code,
        baseUrl: hostUrl
      });

      // Dispatch Emails Concurrently in chunks
      let sentCount = 0;
      let failedCount = 0;
      const sendResults = [];

      for (const recipient of targetEmails) {
        try {
          const info = await transporter.sendMail({
            from: `"Bizleap Marketplace" <${process.env.SMTP_FROM || process.env.SMTP_USER || 'bizleap1@gmail.com'}>`,
            to: recipient,
            subject: subject,
            html: emailHtml
          });
          sentCount++;
          sendResults.push({ email: recipient, status: 'sent', id: info.messageId });
        } catch (sendErr) {
          failedCount++;
          console.error(`Failed sending campaign to ${recipient}:`, sendErr?.message);
          sendResults.push({ email: recipient, status: 'failed', error: sendErr?.message });
        }
      }

      // Record Campaign Record
      const newCampaignRecord = {
        id: 'camp-' + Date.now(),
        name: name || subject,
        subject,
        preview_text,
        type,
        headline,
        body_text,
        button_text,
        button_url,
        template_id: template_id || null,
        coupon_code: coupon_code || null,
        audience_type,
        audience_filter,
        recipients_count: targetEmails.length,
        sent_count: sentCount,
        failed_count: failedCount,
        status: 'sent',
        created_at: new Date().toISOString()
      };

      // Try inserting into Supabase
      if (supabaseAdmin) {
        try {
          const { data: dbInsert, error: insErr } = await supabaseAdmin
            .from('campaigns')
            .insert([newCampaignRecord])
            .select()
            .single();

          if (!insErr && dbInsert) {
            newCampaignRecord.id = dbInsert.id;
            console.log('✅ Campaign saved to Supabase database with ID:', dbInsert.id);
          } else if (insErr) {
            console.warn('⚠️ Supabase campaign insert note:', insErr.message);
          }
        } catch (dbErr) {
          console.warn('Could not insert campaign in database, stored in memory:', dbErr?.message);
        }
      }

      // Prepend to fallback list
      fallbackCampaigns.unshift(newCampaignRecord);

      return res.status(200).json({
        success: true,
        campaign: newCampaignRecord,
        recipients_count: targetEmails.length,
        sent_count: sentCount,
        failed_count: failedCount,
        message: `Campaign successfully sent to ${sentCount} recipient(s)!`
      });
    } catch (err) {
      console.error('Error dispatching campaign:', err);
      return res.status(500).json({ error: err.message || 'Failed to dispatch campaign' });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
