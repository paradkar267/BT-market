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

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { firstName, lastName, email, subject, message } = req.body;

  if (!firstName || !lastName || !email || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
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

    const info = await transporter.sendMail({
      from: `"Bizleap Contact Form" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: process.env.ADMIN_EMAIL || 'bizleap1@gmail.com',
      replyTo: email,
      subject: `New Message: ${subject || 'General Inquiry'} from ${firstName} ${lastName}`,
      html: htmlContent,
    });

    res.status(200).json({ success: true, messageId: info.messageId });
  } catch (error) {
    console.error("Error sending contact email:", error);
    res.status(500).json({ error: 'Failed to send message', details: error.message });
  }
}
