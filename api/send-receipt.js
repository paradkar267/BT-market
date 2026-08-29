import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'dns';

// Force IPv4 for Nodemailer
dns.setDefaultResultOrder('ipv4first');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });
dotenv.config();

export function generateInvoiceHtml({ to, orderDetails, baseUrl, orderDate, orderTime }) {
  const items = orderDetails.items || [];
  const total = orderDetails.total || '0.00';
  const orderId = orderDetails.orderId || Math.random().toString(36).substring(7).toUpperCase();
  const customerEmail = to || 'Customer';

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

  return `
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
}

export default async function handler(req, res) {
  // CORS setup for Vercel
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { to, email, orderDetails, cartItems, totalAmount, paymentId, frontendUrl, invoicePdfBase64 } = req.body || {};

    const recipientEmail = to || email;
    if (!recipientEmail) {
      return res.status(400).json({ error: 'Missing recipient email' });
    }

    // Normalize orderDetails
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

    const rawPass = process.env.SMTP_PASSWORD || process.env.SMTP_PASS || '';
    const cleanPass = rawPass.replace(/\s+/g, '');
    const isGmail = (process.env.SMTP_HOST || '').includes('gmail') || (process.env.SMTP_USER || '').includes('gmail');

    const transporter = isGmail
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
          port: parseInt(process.env.SMTP_PORT || '587', 10),
          secure: process.env.SMTP_PORT === '465',
          auth: {
            user: process.env.SMTP_USER,
            pass: cleanPass
          },
          tls: { rejectUnauthorized: false }
        });

    const baseUrl = frontendUrl || 'https://bt-templates.vercel.app';
    const orderDate = new Date().toLocaleDateString('en-IN', {
      timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric'
    });
    const orderTime = new Date().toLocaleTimeString('en-IN', {
      timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true
    });

    const htmlContent = generateInvoiceHtml({
      to: recipientEmail,
      orderDetails: normalizedOrderDetails,
      baseUrl,
      orderDate,
      orderTime
    });

    const orderId = normalizedOrderDetails.orderId || 'ORDER';

    // Prepare attachments if PDF base64 provided
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

    const info = await transporter.sendMail({
      from: `"Bizleap Marketplace" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: recipientEmail,
      subject: `🧾 Your Bizleap Invoice & Download Access — Order #${orderId}`,
      html: htmlContent,
      attachments: attachments.length ? attachments : undefined
    });

    console.log('Receipt email sent successfully to', recipientEmail, 'MessageId:', info.messageId);
    res.status(200).json({ success: true, messageId: info.messageId });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: error.message || 'Failed to send email' });
  }
}
