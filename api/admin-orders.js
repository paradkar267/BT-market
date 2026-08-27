import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

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

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  if (!supabaseAdmin) {
    return res.status(500).json({ error: 'Server misconfiguration: Missing Supabase Service Role Key' });
  }

  // Auth verification
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Missing authorization header' });
  }

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

  if (userError || !user) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase() || 'bizleap1@gmail.com';
  if (user.email?.toLowerCase() !== adminEmail) {
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }

  try {
    // 1. Fetch all purchases
    const { data: purchases, error: purchasesErr } = await supabaseAdmin
      .from('purchases')
      .select('*')
      .order('created_at', { ascending: false });

    if (purchasesErr) throw purchasesErr;

    // 2. Fetch all users from Supabase Auth
    const { data: usersData } = await supabaseAdmin.auth.admin.listUsers();
    const userMap = {};
    if (usersData?.users) {
      usersData.users.forEach(u => {
        userMap[u.id] = {
          id: u.id,
          email: u.email || 'N/A',
          fullName: u.user_metadata?.full_name || u.user_metadata?.name || u.email?.split('@')[0] || 'Customer',
          createdAt: u.created_at,
        };
      });
    }

    // 3. Fetch all templates
    const { data: templates } = await supabaseAdmin
      .from('templates')
      .select('id, title, price, category, image, author');

    const templateMap = {};
    if (templates) {
      templates.forEach(t => {
        templateMap[t.id] = t;
      });
    }

    // 4. Combine into rich order objects
    let totalRevenue = 0;
    const orders = (purchases || []).map(p => {
      const template = templateMap[p.template_id] || {
        id: p.template_id,
        title: 'Template #' + p.template_id,
        price: '0',
        category: 'Template',
        image: ''
      };
      const customer = userMap[p.user_id] || {
        id: p.user_id,
        email: 'User ' + (p.user_id ? String(p.user_id).substring(0, 8) : 'Unknown'),
        fullName: 'Customer'
      };

      const priceNum = parseFloat(template.price) || 0;
      totalRevenue += priceNum;

      return {
        id: p.id,
        paymentId: p.payment_id || `ORD-${p.id ? String(p.id).substring(0, 8).toUpperCase() : 'UNKNOWN'}`,
        createdAt: p.created_at,
        template: {
          id: template.id,
          title: template.title,
          category: template.category,
          price: template.price,
          image: template.image
        },
        customer: {
          id: customer.id,
          email: customer.email,
          name: customer.fullName
        },
        amount: priceNum,
        status: 'Completed'
      };
    });

    const uniqueCustomers = new Set((purchases || []).map(p => p.user_id)).size;

    res.json({
      success: true,
      orders,
      stats: {
        totalOrders: orders.length,
        totalRevenue,
        totalCustomers: uniqueCustomers,
        totalUsers: usersData?.users?.length || 0
      }
    });
  } catch (err) {
    console.error('Error fetching admin orders:', err);
    res.status(500).json({ error: err.message });
  }
}
