import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure env vars are loaded
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export const sendReceiptEmail = async (to, orderDetails, frontendUrl) => {
  const baseUrl = frontendUrl || process.env.FRONTEND_URL || 'http://localhost:5173';
  const { items, total, orderId } = orderDetails;

  const itemsHtml = items.map((item, index) => `
    <tr class="${index % 2 === 0 ? 'bg-light' : ''}" style="${index % 2 === 0 ? 'background-color: #fafafa;' : ''}">
      <td class="border-light" style="padding: 14px 16px; border-bottom: 1px solid #f0f0f0;">
        <strong class="text-main" style="color: #1a1a1a; font-size: 14px;">${item.title}</strong><br/>
        <span class="text-muted" style="color: #888; font-size: 12px;">${item.category || 'Digital Template'}</span>
      </td>
      <td class="border-light text-muted" style="padding: 14px 16px; border-bottom: 1px solid #f0f0f0; text-align: center; color: #666; font-size: 13px;">1</td>
      <td class="border-light text-main" style="padding: 14px 16px; border-bottom: 1px solid #f0f0f0; text-align: right; color: #1a1a1a; font-weight: 600; font-size: 14px;">₹${item.price}</td>
    </tr>
  `).join('');

  const orderDate = new Date().toLocaleDateString('en-IN', {
    timeZone: 'Asia/Kolkata', year: 'numeric', month: 'long', day: 'numeric'
  });
  const orderTime = new Date().toLocaleTimeString('en-IN', {
    timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit'
  });

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        .body-bg { background-color: #f4f4f7; }
        .card-bg { background-color: #ffffff; }
        .text-main { color: #1a1a1a; }
        .text-muted { color: #666; }
        .bg-light { background-color: #fafafa; }
        .border-light { border-color: #f0f0f0; }
        .info-box { background-color: #f0f7ff; border-left-color: #3b82f6; }
        .info-text { color: #1e40af; }
        .header-bg { background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%); }
      </style>
    </head>
    <body class="body-bg" style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div class="card-bg" style="border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
          <div class="header-bg" style="padding: 36px 32px; text-align: center;">
            <h1 style="margin: 0 0 4px 0; font-size: 28px; font-weight: 800; letter-spacing: 3px; color: #ffffff;">BIZLEAP</h1>
            <p style="margin: 0; font-size: 12px; color: rgba(255,255,255,0.5); letter-spacing: 1px; text-transform: uppercase;">Digital Marketplace</p>
          </div>
          <div style="text-align: center; padding: 28px 32px 0;">
            <div style="display: inline-block; background: linear-gradient(135deg, #10b981, #059669); color: #fff; padding: 8px 20px; border-radius: 50px; font-size: 13px; font-weight: 700;">
              ✓ PAYMENT SUCCESSFUL
            </div>
          </div>
          <div style="padding: 24px 32px 0;">
            <h2 class="text-main" style="margin: 0 0 8px; font-size: 22px; font-weight: 700;">Thank you for your purchase!</h2>
            <p class="text-muted" style="margin: 0; font-size: 14px; line-height: 1.6;">
              Your order has been confirmed and your templates are ready to download from your dashboard.
            </p>
          </div>
          <div style="padding: 24px 32px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td class="bg-light" style="padding: 12px 16px; background: #f8f9fb; border-radius: 10px 0 0 10px;">
                  <span class="text-muted" style="display: block; font-size: 11px; text-transform: uppercase; margin-bottom: 4px;">Order ID</span>
                  <span class="text-main" style="font-size: 14px; font-weight: 700;">#${orderId}</span>
                </td>
                <td class="bg-light" style="padding: 12px 16px; background: #f8f9fb;">
                  <span class="text-muted" style="display: block; font-size: 11px; text-transform: uppercase; margin-bottom: 4px;">Date</span>
                  <span class="text-main" style="font-size: 14px; font-weight: 600;">${orderDate}</span>
                </td>
                <td class="bg-light" style="padding: 12px 16px; background: #f8f9fb; border-radius: 0 10px 10px 0;">
                  <span class="text-muted" style="display: block; font-size: 11px; text-transform: uppercase; margin-bottom: 4px;">Time</span>
                  <span class="text-main" style="font-size: 14px; font-weight: 600;">${orderTime}</span>
                </td>
              </tr>
            </table>
          </div>
          <div style="padding: 0 32px;"><hr class="border-light" style="border: none; border-top: 1px solid #eee; margin: 0;"/></div>
          <div style="padding: 24px 32px;">
            <h3 class="text-main" style="margin: 0 0 16px; font-size: 16px; font-weight: 700;">Order Summary</h3>
            <table class="border-light" style="width: 100%; border-collapse: collapse; border-radius: 12px; overflow: hidden; border: 1px solid #f0f0f0;">
              <thead>
                <tr class="bg-light" style="background-color: #f8f9fb;">
                  <th class="text-muted" style="text-align: left; padding: 12px 16px; font-size: 12px; text-transform: uppercase;">Item</th>
                  <th class="text-muted" style="text-align: center; padding: 12px 16px; font-size: 12px; text-transform: uppercase;">Qty</th>
                  <th class="text-muted" style="text-align: right; padding: 12px 16px; font-size: 12px; text-transform: uppercase;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
          </div>
          <div style="padding: 0 32px 28px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td class="text-muted" style="padding: 6px 0; font-size: 14px;">Subtotal</td>
                <td class="text-main" style="padding: 6px 0; text-align: right; font-size: 14px;">₹${total}</td>
              </tr>
              <tr>
                <td colspan="2" style="padding: 12px 0 0;"><hr class="border-light" style="border: none; border-top: 2px solid #eee; margin: 0;"/></td>
              </tr>
              <tr>
                <td class="text-main" style="padding: 12px 0 0; font-size: 18px; font-weight: 800;">Total Paid</td>
                <td class="text-main" style="padding: 12px 0 0; text-align: right; font-size: 22px; font-weight: 800;">₹${total}</td>
              </tr>
            </table>
          </div>
          <div style="text-align: center; padding: 0 32px 32px;">
            <a href="${baseUrl}/my-templates" style="display: inline-block; background: linear-gradient(135deg, #0a0a0a, #1a1a2e); color: #ffffff; padding: 14px 36px; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 14px; box-shadow: 0 4px 14px rgba(0,0,0,0.2);">
              Download Your Templates →
            </a>
          </div>
          <div class="info-box" style="margin: 0 32px 28px; padding: 16px 20px; border-radius: 12px; border-left: 4px solid #3b82f6;">
            <p class="info-text" style="margin: 0; font-size: 13px; line-height: 1.5;">
              <strong>💡 Quick Tip:</strong> You can download your purchased templates anytime from the "My Templates" section in your dashboard.
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  return transporter.sendMail({
    from: `"Bizleap" <bizleap1@gmail.com>`,
    to: to,
    subject: `🧾 Your Bizleap Invoice — Order #${orderId}`,
    html: htmlContent,
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
    from: `"Bizleap Contact Form" <bizleap1@gmail.com>`,
    to: process.env.ADMIN_EMAIL || 'bizleap1@gmail.com',
    replyTo: email,
    subject: `New Message: ${subject || 'General Inquiry'} from ${firstName} ${lastName}`,
    html: htmlContent,
  });
};
