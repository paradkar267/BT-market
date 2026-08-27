import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = (supabaseUrl && supabaseServiceKey)
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

// Gmail SMTP transporter for customer direct messaging and gift alerts
const rawPass = process.env.SMTP_PASSWORD || process.env.SMTP_PASS || '';
const cleanPass = rawPass.replace(/\s+/g, '');
const isGmail = (process.env.SMTP_HOST || '').includes('gmail') || (process.env.SMTP_USER || '').includes('gmail');

const transporter = isGmail
  ? nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER || 'bizleap1@gmail.com',
        pass: cleanPass
      },
      tls: {
        rejectUnauthorized: false
      }
    })
  : nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER || 'bizleap1@gmail.com',
        pass: cleanPass
      },
      tls: {
        rejectUnauthorized: false
      }
    });

// Fallback customers when offline or in dev
const fallbackCustomers = [
  {
    id: 'usr-sample-1',
    name: 'Aarav Mehta',
    email: 'aarav.mehta@example.com',
    created_at: new Date(Date.now() - 86400000 * 45).toISOString(),
    total_spent: 12998,
    total_purchases: 3,
    tier: 'Platinum VIP',
    rank: 1,
    purchased_templates: [
      { id: 1, title: 'SaaS Launchpad Pro', category: 'Next.js', price: 5999, payment_id: 'pay_sample_101', purchased_at: new Date(Date.now() - 86400000 * 40).toISOString() },
      { id: 2, title: 'Fintech Banking UI Kit', category: 'Figma', price: 3999, payment_id: 'pay_sample_102', purchased_at: new Date(Date.now() - 86400000 * 20).toISOString() },
      { id: 3, title: 'Crypto Wallet App', category: 'React Native', price: 3000, payment_id: 'pay_sample_103', purchased_at: new Date(Date.now() - 86400000 * 5).toISOString() }
    ]
  },
  {
    id: 'usr-sample-2',
    name: 'Neha Sharma',
    email: 'neha.sharma@example.com',
    created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
    total_spent: 5999,
    total_purchases: 1,
    tier: 'Gold VIP',
    rank: 2,
    purchased_templates: [
      { id: 1, title: 'SaaS Launchpad Pro', category: 'Next.js', price: 5999, payment_id: 'pay_sample_201', purchased_at: new Date(Date.now() - 86400000 * 15).toISOString() }
    ]
  },
  {
    id: 'usr-sample-3',
    name: 'Rohan Verma',
    email: 'rohan.v@example.com',
    created_at: new Date(Date.now() - 86400000 * 18).toISOString(),
    total_spent: 3999,
    total_purchases: 1,
    tier: 'Silver Buyer',
    rank: 3,
    purchased_templates: [
      { id: 2, title: 'Fintech Banking UI Kit', category: 'Figma', price: 3999, payment_id: 'pay_sample_301', purchased_at: new Date(Date.now() - 86400000 * 10).toISOString() }
    ]
  },
  {
    id: 'usr-sample-4',
    name: 'Priya Patel',
    email: 'priya.dev@example.com',
    created_at: new Date(Date.now() - 86400000 * 8).toISOString(),
    total_spent: 0,
    total_purchases: 0,
    tier: 'Member',
    rank: 4,
    purchased_templates: []
  }
];

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Auth verification
  const authHeader = req.headers.authorization;
  let userIsAdmin = false;

  if (authHeader && supabaseAdmin) {
    try {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
      const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase() || 'bizleap1@gmail.com';
      if (!userError && user && user.email?.toLowerCase() === adminEmail) {
        userIsAdmin = true;
      }
    } catch {
      // In local dev, allow fallback
    }
  }

  // -------------------------------------------------------------
  // 1. GET /api/admin-customers: List all registered CRM users
  // -------------------------------------------------------------
  if (req.method === 'GET') {
    try {
      if (!supabaseAdmin) {
        return res.status(200).json({
          success: true,
          customers: fallbackCustomers,
          stats: {
            totalUsers: fallbackCustomers.length,
            vipUsers: 2,
            payingCustomers: 3,
            totalRevenue: 22996,
            averageLtv: 7665
          }
        });
      }

      // Fetch all users from Supabase Auth
      let authUsers = [];
      try {
        const { data: usersData, error: uErr } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
        if (!uErr && usersData?.users) {
          authUsers = usersData.users;
        }
      } catch (e) {
        console.warn('Could not list Supabase auth users:', e.message);
      }

      // Fetch all purchases
      let allPurchases = [];
      try {
        const { data: pData } = await supabaseAdmin
          .from('purchases')
          .select('*')
          .order('created_at', { ascending: false });
        if (pData) allPurchases = pData;
      } catch (e) {
        console.warn('Could not fetch purchases:', e.message);
      }

      // Fetch all templates
      let allTemplates = [];
      try {
        const { data: tData } = await supabaseAdmin
          .from('templates')
          .select('*');
        if (tData) allTemplates = tData;
      } catch (e) {
        console.warn('Could not fetch templates:', e.message);
      }

      const templateMap = {};
      allTemplates.forEach(t => {
        templateMap[t.id] = t;
      });

      // Build customer objects
      const customers = authUsers.map(u => {
        const userPurchases = allPurchases.filter(p => String(p.user_id) === String(u.id));

        const purchased_templates = userPurchases.map(p => {
          const t = templateMap[p.template_id] || {};
          let priceNum = 0;
          if (p.amount) {
            priceNum = Number(p.amount);
          } else if (t.price) {
            priceNum = Number(String(t.price).replace(/[^0-9.]/g, '')) || 0;
          }
          return {
            purchase_id: p.id,
            id: p.template_id,
            title: t.title || `Template #${p.template_id}`,
            category: t.category || 'Digital Asset',
            image: t.image || '',
            price: priceNum,
            payment_id: p.payment_id || 'N/A',
            purchased_at: p.created_at
          };
        });

        const total_spent = purchased_templates.reduce((sum, item) => sum + (item.price || 0), 0);
        const total_purchases = purchased_templates.length;

        let tier = 'Member';
        if (total_spent >= 10000 || total_purchases >= 3) {
          tier = 'Platinum VIP';
        } else if (total_spent >= 5000 || total_purchases >= 2) {
          tier = 'Gold VIP';
        } else if (total_purchases >= 1) {
          tier = 'Silver Buyer';
        }

        const name = u.user_metadata?.full_name || u.user_metadata?.name || u.email?.split('@')[0] || 'Customer';

        return {
          id: u.id,
          name,
          email: u.email || 'N/A',
          avatar_url: u.user_metadata?.avatar_url || '',
          created_at: u.created_at,
          last_sign_in_at: u.last_sign_in_at || u.created_at,
          total_spent,
          total_purchases,
          tier,
          purchased_templates
        };
      });

      // Sort by Total Spent descending (VIP first)
      customers.sort((a, b) => b.total_spent - a.total_spent || b.total_purchases - a.total_purchases);

      // Assign ranking numbers
      customers.forEach((c, idx) => {
        c.rank = idx + 1;
      });

      const totalRevenue = customers.reduce((sum, c) => sum + c.total_spent, 0);
      const payingCustomers = customers.filter(c => c.total_purchases > 0).length;
      const vipUsers = customers.filter(c => c.tier === 'Platinum VIP' || c.tier === 'Gold VIP').length;
      const averageLtv = payingCustomers > 0 ? Math.round(totalRevenue / payingCustomers) : 0;

      return res.status(200).json({
        success: true,
        customers: customers.length ? customers : fallbackCustomers,
        stats: {
          totalUsers: customers.length || fallbackCustomers.length,
          vipUsers: vipUsers || 2,
          payingCustomers: payingCustomers || 3,
          totalRevenue: totalRevenue || 22996,
          averageLtv: averageLtv || 7665
        }
      });
    } catch (err) {
      console.error('Error in GET /api/admin-customers:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  // -------------------------------------------------------------
  // 2. POST /api/admin-customers: Grant Free Gift Access or Send Direct Email
  // -------------------------------------------------------------
  if (req.method === 'POST') {
    try {
      const { action = 'grant', user_id, user_email, template_id, note, subject, message } = req.body;

      // ── A. Grant Custom Free Template Access ──
      if (action === 'grant') {
        if (!user_id || !template_id) {
          return res.status(400).json({ error: 'user_id and template_id are required' });
        }

        if (!supabaseAdmin) {
          return res.status(200).json({
            success: true,
            message: 'Gift access granted (dev fallback mode)!'
          });
        }

        // Check if user already owns template
        const { data: existing } = await supabaseAdmin
          .from('purchases')
          .select('id')
          .eq('user_id', user_id)
          .eq('template_id', template_id)
          .maybeSingle();

        if (existing) {
          return res.status(400).json({ error: 'This customer already owns this template license.' });
        }

        // Fetch template details for email
        const { data: templateObj } = await supabaseAdmin
          .from('templates')
          .select('*')
          .eq('id', template_id)
          .single();

        // Insert new purchase record
        const giftPaymentId = `GIFT_ADMIN_${Date.now()}`;
        const { data: newPurchase, error: insErr } = await supabaseAdmin
          .from('purchases')
          .insert([{
            user_id,
            template_id,
            payment_id: giftPaymentId,
            amount: 0,
            status: 'completed',
            created_at: new Date().toISOString()
          }])
          .select()
          .single();

        if (insErr) throw insErr;

        // Dispatch Gift Email Notification
        if (user_email && templateObj) {
          try {
            const hostUrl = process.env.FRONTEND_URL || 'https://bizleap.in';
            const downloadUrl = `${hostUrl}/my-templates`;

            const giftHtml = `
            <!DOCTYPE html>
            <html>
            <head><meta charset="utf-8"><title>You have received a gift license!</title></head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; margin: 0; padding: 30px 16px;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 580px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.06);">
                <tr>
                  <td style="background: linear-gradient(135deg, #4338ca 0%, #6366f1 100%); padding: 32px 28px; text-align: center;">
                    <div style="font-size: 32px; margin-bottom: 8px;">🎁</div>
                    <h2 style="color: #ffffff; margin: 0 0 6px; font-size: 22px; font-weight: 900;">Exclusive Gift License Granted!</h2>
                    <p style="color: #e0e7ff; margin: 0; font-size: 13px;">The Bizleap Marketplace Team has granted you direct VIP access.</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 28px;">
                    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 20px;">
                      <span style="background-color: #e0e7ff; color: #4338ca; font-size: 10px; font-weight: 800; padding: 3px 8px; border-radius: 6px; text-transform: uppercase;">
                        ${templateObj.category || 'Template'}
                      </span>
                      <h3 style="margin: 8px 0 4px; color: #0f172a; font-size: 18px; font-weight: 900;">${templateObj.title}</h3>
                      <p style="margin: 0; color: #64748b; font-size: 12px;">Full Source Code & Commercial License Included</p>
                    </div>

                    ${note ? `
                    <div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 10px; padding: 14px; margin-bottom: 20px; font-size: 13px; color: #92400e;">
                      <strong>Note from Admin:</strong> "${note}"
                    </div>
                    ` : ''}

                    <div style="text-align: center; padding-top: 10px;">
                      <a href="${downloadUrl}" target="_blank" style="display: inline-block; padding: 14px 32px; background-color: #4f46e5; color: #ffffff; text-decoration: none; border-radius: 12px; font-size: 15px; font-weight: 800; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);">
                        Access & Download in Dashboard →
                      </a>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px; text-align: center; font-size: 11px; color: #94a3b8;">
                    © ${new Date().getFullYear()} Bizleap Marketplace Inc. &bull; License ID: ${giftPaymentId}
                  </td>
                </tr>
              </table>
            </body>
            </html>
            `;

            await transporter.sendMail({
              from: `"Bizleap Marketplace" <${process.env.SMTP_FROM || process.env.SMTP_USER || 'bizleap1@gmail.com'}>`,
              to: user_email,
              subject: `🎁 Gift License: You received free access to ${templateObj.title}!`,
              html: giftHtml
            });
            console.log(`✅ Gift notification sent to ${user_email}`);
          } catch (mErr) {
            console.warn('Could not send gift email alert:', mErr.message);
          }
        }

        return res.status(200).json({
          success: true,
          purchase: newPurchase,
          message: `🎁 Successfully granted free access to '${templateObj?.title || 'Template'}'!`
        });
      }

      // ── B. Send Direct 1-to-1 Email to Customer ──
      if (action === 'email') {
        if (!user_email || !subject || !message) {
          return res.status(400).json({ error: 'user_email, subject, and message are required' });
        }

        const hostUrl = process.env.FRONTEND_URL || 'https://bizleap.in';

        const customEmailHtml = `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"><title>${subject}</title></head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; margin: 0; padding: 30px 16px;">
          <table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 580px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.06);">
            <tr>
              <td style="background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%); padding: 28px 28px; text-align: left;">
                <span style="color: #ffffff; font-size: 20px; font-weight: 900; letter-spacing: -0.5px;">BIZLEAP</span>
                <span style="color: #818cf8; font-size: 11px; font-weight: 700; margin-left: 6px;">Direct Message</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 30px 28px;">
                <h3 style="margin: 0 0 16px; color: #0f172a; font-size: 18px; font-weight: 800;">${subject}</h3>
                <div style="font-size: 14px; line-height: 1.6; color: #334155; white-space: pre-line;">
                  ${message}
                </div>
              </td>
            </tr>
            <tr>
              <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 18px; text-align: center; font-size: 11px; color: #64748b;">
                Sent directly by Bizleap Marketplace Management Team &bull; <a href="${hostUrl}" style="color: #6366f1; text-decoration: none;">www.bizleap.in</a>
              </td>
            </tr>
          </table>
        </body>
        </html>
        `;

        await transporter.sendMail({
          from: `"Bizleap Marketplace" <${process.env.SMTP_FROM || process.env.SMTP_USER || 'bizleap1@gmail.com'}>`,
          to: user_email,
          subject: subject,
          html: customEmailHtml
        });

        return res.status(200).json({
          success: true,
          message: `Email sent to ${user_email} successfully!`
        });
      }

      // ── C. Delete User Account Permanently (Hacker / Fraud Moderation) ──
      if (action === 'delete_user') {
        if (!user_id) {
          return res.status(400).json({ error: 'user_id is required' });
        }

        if (!supabaseAdmin) {
          return res.status(200).json({
            success: true,
            message: 'User account deleted (dev fallback mode)'
          });
        }

        // Safety check: Prevent admin from deleting their own admin account
        const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase() || 'bizleap1@gmail.com';
        const { data: targetUser } = await supabaseAdmin.auth.admin.getUserById(user_id);
        
        if (targetUser?.user?.email?.toLowerCase() === adminEmail) {
          return res.status(400).json({ error: 'Security Protection: Cannot delete primary Admin account.' });
        }

        // 1. Delete all purchases from purchases table
        await supabaseAdmin.from('purchases').delete().eq('user_id', user_id);

        // 2. Permanently delete user from Supabase Auth
        const { error: delErr } = await supabaseAdmin.auth.admin.deleteUser(user_id);
        if (delErr) throw delErr;

        return res.status(200).json({
          success: true,
          message: `User account for ${targetUser?.user?.email || 'user'} has been permanently deleted.`
        });
      }

      return res.status(400).json({ error: `Unsupported action: ${action}` });
    } catch (err) {
      console.error('Error in POST /api/admin-customers:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  // -------------------------------------------------------------
  // 3. DELETE /api/admin-customers: Revoke access
  // -------------------------------------------------------------
  if (req.method === 'DELETE') {
    try {
      const { purchase_id, user_id, template_id } = req.body || req.query;
      if (!purchase_id && (!user_id || !template_id)) {
        return res.status(400).json({ error: 'purchase_id or (user_id and template_id) is required' });
      }

      if (supabaseAdmin) {
        // 1. Delete from purchases table
        if (purchase_id) {
          await supabaseAdmin.from('purchases').delete().eq('id', purchase_id);
        }
        if (user_id && template_id) {
          await supabaseAdmin.from('purchases').delete().eq('user_id', user_id).eq('template_id', template_id);
        }

        // 2. Clean user_metadata.purchased_templates if user_id is provided
        if (user_id) {
          try {
            const { data: userData } = await supabaseAdmin.auth.admin.getUserById(user_id);
            if (userData?.user?.user_metadata?.purchased_templates) {
              const currentMeta = userData.user.user_metadata;
              const currentList = (currentMeta.purchased_templates || []).map(String);
              const updatedList = template_id
                ? currentList.filter(id => id !== String(template_id))
                : currentList;

              await supabaseAdmin.auth.admin.updateUserById(user_id, {
                user_metadata: {
                  ...currentMeta,
                  purchased_templates: updatedList
                }
              });
            }
          } catch (mErr) {
            console.warn('Could not clean user metadata:', mErr.message);
          }
        }
      }

      return res.status(200).json({ success: true, message: 'License access successfully revoked.' });
    } catch (err) {
      console.error('Error in DELETE /api/admin-customers:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
