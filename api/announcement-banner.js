import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

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

// In-memory fallback banner config
let memoryBannerConfig = {
  id: 'primary_banner',
  is_enabled: true,
  headline: '🔥 Weekend Mega Flash Sale Ends in:',
  coupon_code: 'LAUNCH50',
  discount_badge: '50% OFF',
  button_text: 'Claim 50% OFF Now →',
  button_url: '/explore',
  end_time: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
  theme: 'fire', // 'fire' | 'cyber' | 'emerald' | 'sunset'
  is_dismissible: true,
  updated_at: new Date().toISOString()
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 1. GET /api/announcement-banner
  if (req.method === 'GET') {
    try {
      if (supabaseAdmin) {
        const { data, error } = await supabaseAdmin
          .from('store_announcements')
          .select('*')
          .eq('id', 'primary_banner')
          .maybeSingle();

        if (!error && data) {
          memoryBannerConfig = { ...memoryBannerConfig, ...data };
          return res.status(200).json({ success: true, banner: data });
        }
      }

      return res.status(200).json({ success: true, banner: memoryBannerConfig });
    } catch (err) {
      console.error('Error fetching announcement banner:', err);
      return res.status(200).json({ success: true, banner: memoryBannerConfig });
    }
  }

  // 2. POST /api/announcement-banner (Save & Update Settings)
  if (req.method === 'POST' || req.method === 'PATCH') {
    try {
      const {
        is_enabled,
        headline,
        coupon_code,
        discount_badge,
        button_text,
        button_url,
        end_time,
        theme,
        is_dismissible
      } = req.body || {};

      const updatedRecord = {
        id: 'primary_banner',
        is_enabled: is_enabled !== undefined ? Boolean(is_enabled) : memoryBannerConfig.is_enabled,
        headline: headline !== undefined ? headline : memoryBannerConfig.headline,
        coupon_code: coupon_code !== undefined ? coupon_code : memoryBannerConfig.coupon_code,
        discount_badge: discount_badge !== undefined ? discount_badge : memoryBannerConfig.discount_badge,
        button_text: button_text !== undefined ? button_text : memoryBannerConfig.button_text,
        button_url: button_url !== undefined ? button_url : memoryBannerConfig.button_url,
        end_time: end_time !== undefined ? end_time : memoryBannerConfig.end_time,
        theme: theme || memoryBannerConfig.theme,
        is_dismissible: is_dismissible !== undefined ? Boolean(is_dismissible) : memoryBannerConfig.is_dismissible,
        updated_at: new Date().toISOString()
      };

      if (supabaseAdmin) {
        try {
          const { data: upsertData, error: upsertErr } = await supabaseAdmin
            .from('store_announcements')
            .upsert(updatedRecord)
            .select()
            .single();

          if (!upsertErr && upsertData) {
            memoryBannerConfig = upsertData;
            return res.status(200).json({
              success: true,
              banner: upsertData,
              message: 'Flash sale banner settings saved successfully!'
            });
          } else if (upsertErr) {
            console.warn('Supabase store_announcements note:', upsertErr.message);
          }
        } catch (dbErr) {
          console.warn('Could not upsert in DB, updating memory store:', dbErr?.message);
        }
      }

      memoryBannerConfig = updatedRecord;
      return res.status(200).json({
        success: true,
        banner: memoryBannerConfig,
        message: 'Flash sale banner settings saved successfully!'
      });
    } catch (err) {
      console.error('Error updating announcement banner:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
