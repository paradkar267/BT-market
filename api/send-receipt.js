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
          
          <table cellpadding="0" cellspacing="0" border="0" width="580" style="max-width: 580px; width: 100%;">
            
            <!-- Brand Logo Header -->
            <tr>
              <td style="padding: 0 0 24px; text-align: center;">
                <table cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto;">
                  <tr>
                    <td style="width: 36px; height: 36px; background-color: #0f172a; border-radius: 10px; text-align: center; vertical-align: middle;">
                      <span style="color: #ffffff; font-size: 16px; font-weight: 900; line-height: 36px;">B</span>
                    </td>
                    <td style="padding-left: 10px; vertical-align: middle;">
                      <span style="font-size: 20px; font-weight: 900; color: #0f172a; letter-spacing: 2px;">BIZLEAP</span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Main White Card -->
            <tr>
              <td>
                <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.04); border: 1px solid #e2e8f0;">
                  
                  <!-- Clean White Hero Header -->
                  <tr>
                    <td style="background-color: #ffffff; padding: 36px 32px 28px; text-align: center; border-bottom: 1px solid #f1f5f9;">
                      
                      <!-- Success Badge -->
                      <table cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto 16px;">
                        <tr>
                          <td style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 50px; padding: 6px 16px;">
                            <span style="color: #059669; font-size: 11px; font-weight: 800; letter-spacing: 0.8px; text-transform: uppercase;">
                              ✓ PAYMENT CONFIRMED & INVOICE PAID
                            </span>
                          </td>
                        </tr>
                      </table>

                      <h1 style="margin: 0 0 8px; color: #0f172a; font-size: 24px; font-weight: 900; letter-spacing: -0.5px; line-height: 1.3;">
                        Thank You for Your Order!
                      </h1>
                      <p style="margin: 0; color: #64748b; font-size: 14px; line-height: 1.5;">
                        Your digital templates are ready. Download them below or access your dashboard anytime.
                      </p>
                    </td>
                  </tr>

                  <!-- Metadata Strip (Light Clean Slate) -->
                  <tr>
                    <td style="padding: 24px 28px 0;">
                      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
                        <tr>
                          <td style="padding: 14px 18px; width: 50%; border-right: 1px solid #e2e8f0;">
                            <span style="display: block; font-size: 10px; color: #64748b; text-transform: uppercase; letter-spacing: 0.8px; font-weight: 700; margin-bottom: 3px;">Invoice Number</span>
                            <span style="font-size: 13px; color: #0f172a; font-weight: 700; font-family: monospace;">#INV-${orderId.substring(0, 12)}</span>
                          </td>
                          <td style="padding: 14px 18px; width: 50%;">
                            <span style="display: block; font-size: 10px; color: #64748b; text-transform: uppercase; letter-spacing: 0.8px; font-weight: 700; margin-bottom: 3px;">Date & Time</span>
                            <span style="font-size: 13px; color: #0f172a; font-weight: 600;">${orderDate}, ${orderTime}</span>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 14px 18px; width: 50%; border-top: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0;">
                            <span style="display: block; font-size: 10px; color: #64748b; text-transform: uppercase; letter-spacing: 0.8px; font-weight: 700; margin-bottom: 3px;">Billed To</span>
                            <span style="font-size: 12px; color: #0f172a; font-weight: 600; word-break: break-all;">${customerEmail}</span>
                          </td>
                          <td style="padding: 14px 18px; width: 50%; border-top: 1px solid #e2e8f0;">
                            <span style="display: block; font-size: 10px; color: #64748b; text-transform: uppercase; letter-spacing: 0.8px; font-weight: 700; margin-bottom: 3px;">Payment Status</span>
                            <span style="font-size: 12px; color: #059669; font-weight: 700;">● Paid via Razorpay (Verified)</span>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Itemized Templates Section -->
                  <tr>
                    <td style="padding: 24px 28px 0;">
                      <div style="margin-bottom: 12px;">
                        <span style="font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; font-weight: 800;">
                          📦 Purchased Items & Direct Downloads
                        </span>
                      </div>
                      ${itemsHtml}
                    </td>
                  </tr>

                  <!-- Price Calculation Breakdown -->
                  <tr>
                    <td style="padding: 6px 28px 0;">
                      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px 20px;">
                        <tr>
                          <td>
                            <table cellpadding="0" cellspacing="0" border="0" width="100%">
                              <tr>
                                <td style="padding: 4px 0; color: #64748b; font-size: 13px;">Subtotal</td>
                                <td style="padding: 4px 0; text-align: right; color: #0f172a; font-size: 13px; font-weight: 600;">₹${total}</td>
                              </tr>
                              <tr>
                                <td style="padding: 4px 0; color: #64748b; font-size: 13px;">Discount</td>
                                <td style="padding: 4px 0; text-align: right; color: #059669; font-size: 13px; font-weight: 600;">-₹0.00</td>
                              </tr>
                              <tr>
                                <td style="padding: 4px 0; color: #64748b; font-size: 13px;">Taxes (GST Included)</td>
                                <td style="padding: 4px 0; text-align: right; color: #0f172a; font-size: 13px; font-weight: 600;">₹0.00</td>
                              </tr>
                              <tr>
                                <td colspan="2" style="padding: 8px 0;">
                                  <hr style="border: none; border-top: 1px dashed #cbd5e1; margin: 0;" />
                                </td>
                              </tr>
                              <tr>
                                <td style="color: #0f172a; font-size: 15px; font-weight: 900;">Grand Total Paid</td>
                                <td style="text-align: right; color: #4f46e5; font-size: 20px; font-weight: 900;">₹${total}</td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Main Dashboard CTA Button -->
                  <tr>
                    <td style="padding: 24px 28px 8px; text-align: center;">
                      <table cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto; width: 100%;">
                        <tr>
                          <td style="background-color: #0f172a; border-radius: 12px; text-align: center;">
                            <a href="${baseUrl}/my-templates" target="_blank" style="display: block; color: #ffffff; padding: 15px 28px; text-decoration: none; font-weight: 800; font-size: 14px; letter-spacing: 0.3px;">
                              ⚡ Open My Templates Dashboard &rarr;
                            </a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Guarantee Info Box -->
                  <tr>
                    <td style="padding: 16px 28px 24px;">
                      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #eff6ff; border-radius: 10px; border-left: 4px solid #3b82f6;">
                        <tr>
                          <td style="padding: 12px 16px;">
                            <p style="margin: 0; font-size: 12px; color: #1e40af; line-height: 1.5;">
                              <strong>🛡️ Lifetime Access Guarantee:</strong> You can re-download your templates at any time from your Bizleap account. All future minor version updates for your purchased templates are 100% free.
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Footer Section -->
                  <tr>
                    <td style="background-color: #f8fafc; padding: 22px 28px; border-top: 1px solid #e2e8f0; text-align: center;">
                      <p style="margin: 0 0 6px; font-size: 12px; color: #64748b;">
                        Questions or need support? We're always here to assist you.
                      </p>
                      <a href="mailto:bizleap1@gmail.com" style="color: #4f46e5; text-decoration: none; font-size: 13px; font-weight: 700;">
                        bizleap1@gmail.com
                      </a>
                      <p style="margin: 14px 0 0; font-size: 11px; color: #94a3b8; line-height: 1.5;">
                        &copy; ${new Date().getFullYear()} Bizleap Marketplace. All rights reserved.<br>
                        This is an official automated purchase confirmation and tax receipt.
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>

            <!-- Bottom Tagline -->
            <tr>
              <td style="padding: 18px 0 0; text-align: center;">
                <p style="margin: 0; font-size: 11px; color: #94a3b8; letter-spacing: 0.2px;">
                  Bizleap &bull; Premium UI Templates & Components for Modern Builders
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
