import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'dns';

// Force IPv4 for Nodemailer
dns.setDefaultResultOrder('ipv4first');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure env vars are loaded
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });
dotenv.config();

const smtpPort = parseInt(process.env.SMTP_PORT, 10) || 587;

const rawPass = process.env.SMTP_PASSWORD || process.env.SMTP_PASS || '';
const cleanPass = rawPass.replace(/\s+/g, '');
const isGmail = (process.env.SMTP_HOST || '').includes('gmail') || (process.env.SMTP_USER || '').includes('gmail');

export const transporter = isGmail
  ? nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: cleanPass
      },
      tls: { rejectUnauthorized: false }
    })
  : nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: cleanPass
      },
      tls: { rejectUnauthorized: false }
    });

export const sendReceiptEmail = async (to, orderDetails, frontendUrl, invoicePdfBase64) => {
  const baseUrl = frontendUrl || process.env.FRONTEND_URL || 'http://localhost:5173';
  const items = orderDetails?.items || [];
  const total = orderDetails?.total || '0.00';
  const orderId = orderDetails?.orderId || Math.random().toString(36).substring(7).toUpperCase();
  const customerEmail = to || 'Customer';

  const orderDate = new Date().toLocaleDateString('en-IN', {
    timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric'
  });
  const orderTime = new Date().toLocaleTimeString('en-IN', {
    timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true
  });

  // Build itemized cards with direct clickable download & preview buttons
  const itemsHtml = items.map((item) => {
    const itemTitle = item.title || 'Digital Template';
    const itemCategory = item.category || 'React / Web Template';
    const itemPrice = item.price || '0';
    const itemId = item.id || '';
    const initialLetter = itemTitle.charAt(0).toUpperCase() || 'T';
    const downloadUrl = `${baseUrl}/my-templates?download=${itemId}`;
    const previewUrl = `${baseUrl}/preview/${itemId}`;

    return `
      <!-- Template Item Card -->
      <table cellpadding="0" cellspacing="0" border="0" width="100%" class="item-card" style="margin-bottom: 16px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
        <tr>
          <td style="padding: 18px 20px;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                <td style="width: 44px; vertical-align: top;">
                  <div style="width: 44px; height: 44px; background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%); border-radius: 10px; text-align: center; line-height: 44px; color: #ffffff; font-size: 17px; font-weight: 800;">
                    ${initialLetter}
                  </div>
                </td>
                <td style="padding-left: 14px; vertical-align: top;">
                  <div style="display: inline-block; padding: 2px 8px; background-color: #f1f5f9; color: #475569; border-radius: 5px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">
                    ${itemCategory}
                  </div>
                  <h4 style="margin: 0 0 3px; color: #0f172a; font-size: 15px; font-weight: 700; line-height: 1.3;">
                    ${itemTitle}
                  </h4>
                  <p style="margin: 0; color: #64748b; font-size: 12px;">
                    Commercial License &bull; Full Source Code (.zip)
                  </p>
                </td>
                <td style="vertical-align: top; text-align: right; white-space: nowrap; padding-left: 12px;">
                  <span style="color: #0f172a; font-size: 16px; font-weight: 800;">
                    ₹${itemPrice}
                  </span>
                </td>
              </tr>
            </table>

            <!-- Direct Action Buttons Row -->
            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top: 14px; padding-top: 14px; border-top: 1px dashed #e2e8f0;">
              <tr>
                <td align="left" style="vertical-align: middle;">
                  <!-- Direct Download Button -->
                  <table cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td style="background-color: #4f46e5; border-radius: 8px; text-align: center;">
                        <a href="${downloadUrl}" target="_blank" style="display: inline-block; padding: 9px 18px; color: #ffffff; text-decoration: none; font-size: 12px; font-weight: 700; letter-spacing: 0.2px;">
                          ⬇ Download Template
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
                <td align="right" style="vertical-align: middle;">
                  <a href="${previewUrl}" target="_blank" style="display: inline-block; padding: 8px 12px; color: #4f46e5; text-decoration: none; font-size: 12px; font-weight: 600;">
                    Live Preview &rarr;
                  </a>
                </td>
              </tr>
            </table>

          </td>
        </tr>
      </table>
    `;
  }).join('');

  const htmlContent = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Bizleap Invoice #${orderId}</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #0f172a;">
    
    <!-- Preview Text -->
    <div style="display: none; max-height: 0; overflow: hidden; mso-hide: all;">
      Payment of ₹${total} confirmed! Click inside to download your templates. Order #${orderId}
    </div>

    <!-- Outer Wrapper -->
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f8fafc; padding: 36px 16px;">
      <tr>
        <td align="center">
          
          <table cellpadding="0" cellspacing="0" border="0" width="600" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.05);">
            
            <!-- Clean Header -->
            <tr>
              <td style="padding: 28px 32px 20px; border-bottom: 1px solid #f1f5f9; background-color: #ffffff;">
                <table cellpadding="0" cellspacing="0" border="0" width="100%">
                  <tr>
                    <td style="vertical-align: middle;">
                      <table cellpadding="0" cellspacing="0" border="0">
                        <tr>
                          <td style="width: 36px; height: 36px; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); border-radius: 10px; text-align: center; vertical-align: middle;">
                            <span style="color: #ffffff; font-size: 17px; font-weight: 900; line-height: 36px;">B</span>
                          </td>
                          <td style="padding-left: 12px; vertical-align: middle;">
                            <span style="font-size: 19px; font-weight: 900; color: #0f172a; letter-spacing: 1.5px;">BIZLEAP</span>
                            <span style="display: block; font-size: 10px; font-weight: 700; color: #64748b; letter-spacing: 1px; text-transform: uppercase;">Marketplace</span>
                          </td>
                        </tr>
                      </table>
                    </td>
                    <td align="right" style="vertical-align: middle;">
                      <table cellpadding="0" cellspacing="0" border="0">
                        <tr>
                          <td style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 20px; padding: 5px 14px;">
                            <span style="color: #059669; font-size: 11px; font-weight: 800; letter-spacing: 0.5px; text-transform: uppercase;">
                              ✓ Paid & Confirmed
                            </span>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Hero Section -->
            <tr>
              <td style="padding: 28px 32px 20px; background-color: #ffffff;">
                <h1 style="margin: 0 0 8px; color: #0f172a; font-size: 22px; font-weight: 800; letter-spacing: -0.4px; line-height: 1.3;">
                  Payment Receipt & Order Access
                </h1>
                <p style="margin: 0; color: #64748b; font-size: 13.5px; line-height: 1.6;">
                  Thank you for your purchase. Your source code files, commercial licenses, and tax invoice are ready below.
                </p>
              </td>
            </tr>

            <!-- Metadata Strip -->
            <tr>
              <td style="padding: 0 32px 24px;">
                <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
                  <tr>
                    <td style="padding: 12px 18px; width: 50%; border-right: 1px solid #e2e8f0;">
                      <span style="display: block; font-size: 10px; color: #64748b; text-transform: uppercase; letter-spacing: 0.8px; font-weight: 700; margin-bottom: 2px;">Order ID</span>
                      <span style="font-size: 12.5px; color: #0f172a; font-weight: 700; font-family: monospace;">#${orderId}</span>
                    </td>
                    <td style="padding: 12px 18px; width: 50%;">
                      <span style="display: block; font-size: 10px; color: #64748b; text-transform: uppercase; letter-spacing: 0.8px; font-weight: 700; margin-bottom: 2px;">Date & Time</span>
                      <span style="font-size: 12.5px; color: #0f172a; font-weight: 600;">${orderDate}, ${orderTime}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 18px; width: 50%; border-top: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0;">
                      <span style="display: block; font-size: 10px; color: #64748b; text-transform: uppercase; letter-spacing: 0.8px; font-weight: 700; margin-bottom: 2px;">Billed To</span>
                      <span style="font-size: 12px; color: #0f172a; font-weight: 600; word-break: break-all;">${customerEmail}</span>
                    </td>
                    <td style="padding: 12px 18px; width: 50%; border-top: 1px solid #e2e8f0;">
                      <span style="display: block; font-size: 10px; color: #64748b; text-transform: uppercase; letter-spacing: 0.8px; font-weight: 700; margin-bottom: 2px;">Payment Status</span>
                      <span style="font-size: 12px; color: #059669; font-weight: 700;">● Captured via Razorpay</span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Purchased Assets Section -->
            <tr>
              <td style="padding: 0 32px 16px;">
                <h3 style="color: #0f172a; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.8px; margin: 0 0 14px;">
                  Purchased Assets (${items.length})
                </h3>
                ${itemsHtml}
              </td>
            </tr>

            <!-- Financial Summary -->
            <tr>
              <td style="padding: 0 32px 20px;">
                <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px 20px;">
                  <tr>
                    <td style="color: #64748b; font-size: 13px; padding-bottom: 8px;">Subtotal</td>
                    <td align="right" style="color: #0f172a; font-size: 13px; font-weight: 600; padding-bottom: 8px;">₹${total}</td>
                  </tr>
                  <tr>
                    <td style="color: #64748b; font-size: 13px; padding-bottom: 8px;">Taxes & GST (0%)</td>
                    <td align="right" style="color: #059669; font-size: 13px; font-weight: 700; padding-bottom: 8px;">FREE (Included)</td>
                  </tr>
                  <tr style="border-top: 1px solid #e2e8f0;">
                    <td style="color: #0f172a; font-size: 15px; font-weight: 900; padding-top: 10px;">Total Paid</td>
                    <td align="right" style="color: #0f172a; font-size: 20px; font-weight: 900; padding-top: 10px;">₹${total}</td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- PDF Invoice Note -->
            <tr>
              <td style="padding: 0 32px 22px;">
                <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 12px 16px;">
                  <tr>
                    <td style="vertical-align: middle;">
                      <p style="margin: 0; font-size: 12px; color: #166534; line-height: 1.5; font-weight: 600;">
                        📄 Official Tax Invoice PDF has been attached to this email for your legal & accounting records.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Main Dashboard CTA Button -->
            <tr>
              <td style="padding: 0 32px 28px; text-align: center;">
                <table cellpadding="0" cellspacing="0" border="0" width="100%">
                  <tr>
                    <td style="background-color: #0f172a; border-radius: 12px; text-align: center;">
                      <a href="${baseUrl}/my-templates" target="_blank" style="display: block; padding: 14px 28px; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 800; letter-spacing: 0.3px;">
                        Access My Templates in Dashboard &rarr;
                      </a>
                    </td>
                  </tr>
                </table>
                <p style="color: #94a3b8; font-size: 11px; margin: 12px 0 0;">
                  Need help? Contact our support team anytime at <a href="mailto:support@bizleap.in" style="color: #4f46e5; text-decoration: none; font-weight: 600;">support@bizleap.in</a>
                </p>
              </td>
            </tr>

            <!-- Clean Footer -->
            <tr>
              <td style="background-color: #f8fafc; padding: 16px 32px; text-align: center; border-top: 1px solid #f1f5f9;">
                <p style="color: #94a3b8; font-size: 11px; margin: 0; line-height: 1.5;">
                  © ${new Date().getFullYear()} Bizleap Marketplace Inc. All rights reserved. • 100% Satisfaction & Security Guarantee.
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

  // Attach PDF invoice if provided
  const attachments = [];
  if (invoicePdfBase64) {
    try {
      const cleanBase64 = invoicePdfBase64.includes('base64,')
        ? invoicePdfBase64.split('base64,')[1]
        : invoicePdfBase64;
      attachments.push({
        filename: `Bizleap_Invoice_${orderId}.pdf`,
        content: Buffer.from(cleanBase64, 'base64'),
        contentType: 'application/pdf'
      });
    } catch (attErr) {
      console.warn('Could not attach PDF invoice:', attErr?.message);
    }
  }

  return transporter.sendMail({
    from: `"Bizleap Marketplace" <${process.env.SMTP_FROM || process.env.SMTP_USER || 'bizleap1@gmail.com'}>`,
    to: to,
    subject: `🧾 Your Bizleap Invoice & Download Access — Order #${orderId}`,
    html: htmlContent,
    attachments: attachments.length ? attachments : undefined
  });
};

export const sendContactEmail = async (firstName, lastName, email, subject, message) => {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 10px; overflow: hidden;">
      <div style="background-color: #000; color: #fff; padding: 20px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px; letter-spacing: 2px;">New Contact Message</h1>
      </div>
      <div style="padding: 30px;">
        <h2 style="margin-top: 0; color: #333;">${subject || 'General Inquiry'}</h2>
        <p><strong>From:</strong> ${firstName} ${lastName} (${email})</p>
        <div style="margin-top: 20px; padding: 15px; background-color: #f9f9f9; border-radius: 8px;">
          <p style="margin: 0; line-height: 1.6; color: #333;">${message.replace(/\n/g, '<br/>')}</p>
        </div>
      </div>
    </div>
  `;

  return transporter.sendMail({
    from: `"Bizleap Contact Form" <${process.env.SMTP_FROM || process.env.SMTP_USER || 'bizleap1@gmail.com'}>`,
    to: process.env.ADMIN_EMAIL || 'bizleap1@gmail.com',
    replyTo: email,
    subject: `New Message: ${subject || 'General Inquiry'} from ${firstName} ${lastName}`,
    html: htmlContent,
  });
};

export const sendTemplateUpdateEmail = async (to, {
  templateTitle,
  templateCategory,
  version,
  changelog,
  downloadUrl,
  baseUrl
}) => {
  const hostUrl = baseUrl || process.env.FRONTEND_URL || 'http://localhost:5173';
  const targetDownload = downloadUrl || `${hostUrl}/dashboard?tab=templates`;
  const formattedChangelog = (changelog || '• General bug fixes, speed improvements, and visual refinements')
    .split('\n')
    .filter(line => line.trim())
    .map(line => `<li style="margin-bottom: 6px; color: #334155; font-size: 13px; line-height: 1.5;">${line.replace(/^[•\-\*]\s*/, '')}</li>`)
    .join('');

  const htmlContent = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Update Available: ${templateTitle} (${version})</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a;">
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f8fafc; padding: 40px 16px;">
      <tr>
        <td align="center">
          <table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
            
            <!-- Header -->
            <tr>
              <td style="background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%); padding: 32px 32px 28px; text-align: left;">
                <table cellpadding="0" cellspacing="0" border="0" width="100%">
                  <tr>
                    <td>
                      <span style="color: #ffffff; font-size: 22px; font-weight: 900; letter-spacing: -0.5px;">BIZLEAP</span>
                      <span style="color: #818cf8; font-size: 12px; font-weight: 600; margin-left: 8px;">Marketplace</span>
                    </td>
                    <td align="right">
                      <span style="background-color: rgba(99, 102, 241, 0.2); border: 1px solid rgba(129, 140, 248, 0.3); color: #c7d2fe; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 20px; text-transform: uppercase;">
                        ⚡ Free Lifetime Update
                      </span>
                    </td>
                  </tr>
                </table>
                <h1 style="color: #ffffff; font-size: 22px; font-weight: 800; margin: 20px 0 6px; line-height: 1.25;">
                  New Update Available for Your Template! 🚀
                </h1>
                <p style="color: #94a3b8; font-size: 13px; margin: 0; line-height: 1.5;">
                  A new version <strong style="color: #38bdf8;">${version}</strong> of <strong>${templateTitle}</strong> is now ready to download from your dashboard.
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
                    Version: <strong style="color: #0f172a;">${version}</strong> &bull; Status: <strong style="color: #059669;">Ready for Download</strong>
                  </p>
                </div>
              </td>
            </tr>

            <!-- Release Notes / Changelog -->
            <tr>
              <td style="padding: 0 32px 24px;">
                <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px 22px;">
                  <h4 style="margin: 0 0 12px; color: #0f172a; font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">
                    📋 What's New in this Version:
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
                        ⬇ Download Latest Version (.ZIP) &rarr;
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
                    <strong>🛡️ Lifetime Updates Reminder:</strong> Because you purchased this template on Bizleap Marketplace, this and all future version upgrades are 100% free of charge.
                  </p>
                </div>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background-color: #f1f5f9; padding: 18px 32px; text-align: center; border-top: 1px solid #e2e8f0;">
                <p style="color: #64748b; font-size: 11px; margin: 0;">
                  © ${new Date().getFullYear()} Bizleap Marketplace Inc. &bull; You received this update because you are a verified owner of ${templateTitle}.
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

  return transporter.sendMail({
    from: `"Bizleap Marketplace" <${process.env.SMTP_FROM || process.env.SMTP_USER || 'bizleap1@gmail.com'}>`,
    to: to,
    subject: `⚡ Update Available: ${templateTitle} updated to ${version}!`,
    html: htmlContent
  });
};

export const sendCampaignEmail = async (to, {
  subject,
  type = 'announcement',
  headline,
  body_text,
  button_text,
  button_url,
  template,
  coupon_code,
  coupon_discount,
  baseUrl
}) => {
  const prodHost = process.env.FRONTEND_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) || (baseUrl && !baseUrl.includes('localhost') ? baseUrl : 'https://bizleap.in');
  const hostUrl = prodHost.replace(/\/$/, '');

  let ctaUrl = button_url || '/explore';
  if (ctaUrl.startsWith('/')) {
    ctaUrl = `${hostUrl}${ctaUrl}`;
  } else if (ctaUrl.includes('localhost')) {
    ctaUrl = ctaUrl.replace(/^http:\/\/localhost(:\d+)?/, hostUrl);
  }
  const ctaText = button_text || 'Explore Marketplace →';

  const typeConfigs = {
    launch: {
      badge: '🚀 NEW RELEASE LAUNCH',
      badgeBg: '#eef2ff',
      badgeBorder: '#c7d2fe',
      badgeColor: '#4338ca',
      tagColor: '#4f46e5'
    },
    sale: {
      badge: '🔥 LIMITED TIME FLASH SALE',
      badgeBg: '#fff1f2',
      badgeBorder: '#fecdd3',
      badgeColor: '#be123c',
      tagColor: '#e11d48'
    },
    vip: {
      badge: '🎁 EXCLUSIVE VIP OFFER',
      badgeBg: '#ecfdf5',
      badgeBorder: '#a7f3d0',
      badgeColor: '#047857',
      tagColor: '#059669'
    },
    announcement: {
      badge: '📢 MARKETPLACE ANNOUNCEMENT',
      badgeBg: '#fffbeb',
      badgeBorder: '#fde68a',
      badgeColor: '#b45309',
      tagColor: '#d97706'
    }
  };

  const currentType = typeConfigs[type] || typeConfigs.announcement;

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

  const htmlContent = `
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
            
            <!-- Clean White Header Banner -->
            <tr>
              <td style="background-color: #ffffff; padding: 32px 32px 24px; text-align: left; border-bottom: 1px solid #f1f5f9;">
                <table cellpadding="0" cellspacing="0" border="0" width="100%">
                  <tr>
                    <td>
                      <span style="color: #4f46e5; font-size: 22px; font-weight: 900; letter-spacing: -0.5px;">BIZLEAP</span>
                      <span style="color: #64748b; font-size: 11px; font-weight: 700; margin-left: 6px; text-transform: uppercase; letter-spacing: 1px;">Marketplace</span>
                    </td>
                    <td align="right">
                      <span style="background-color: ${currentType.badgeBg}; border: 1px solid ${currentType.badgeBorder}; color: ${currentType.badgeColor}; font-size: 11px; font-weight: 800; padding: 4px 12px; border-radius: 20px; text-transform: uppercase; display: inline-block;">
                        ${currentType.badge}
                      </span>
                    </td>
                  </tr>
                </table>
                <h1 style="color: #0f172a; font-size: 24px; font-weight: 900; margin: 20px 0 0; line-height: 1.3; letter-spacing: -0.5px;">
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
                <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px;">
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

  return transporter.sendMail({
    from: `"Bizleap Marketplace" <${process.env.SMTP_FROM || process.env.SMTP_USER || 'bizleap1@gmail.com'}>`,
    to: to,
    subject: subject,
    html: htmlContent
  });
};
