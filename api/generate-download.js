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
  // CORS setup for Vercel
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

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  if (!supabaseAdmin) {
    return res.status(500).json({ error: 'Server configuration error: Missing Supabase Admin key' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Missing authorization header' });
  }

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

  if (userError || !user) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  const { templateId } = req.body;
  if (!templateId) {
    return res.status(400).json({ error: 'Missing templateId' });
  }

  try {
    // 1. Verify Active Purchase Record in Database
    const { data: purchase } = await supabaseAdmin
      .from('purchases')
      .select('*')
      .eq('user_id', user.id)
      .eq('template_id', templateId)
      .maybeSingle();

    if (!purchase) {
      return res.status(403).json({ error: 'Access denied: You do not have an active license for this template.' });
    }

    // 2. Get file path from mapping table
    let { data: mapping } = await supabaseAdmin
      .from('template_files')
      .select('file_path')
      .eq('template_id', templateId)
      .maybeSingle();

    if (!mapping || !mapping.file_path) {
      const { data: tmpl } = await supabaseAdmin
        .from('templates')
        .select('title')
        .eq('id', templateId)
        .maybeSingle();

      if (tmpl?.title) {
        mapping = { file_path: `templates/${tmpl.title}.zip` };
      } else {
        mapping = { file_path: 'demo-template.zip' };
      }
    }

    // 3. Generate Signed URL (valid for 60 seconds)
    const { data: signedUrlData, error: signedUrlError } = await supabaseAdmin
      .storage
      .from('secure_templates')
      .createSignedUrl(mapping.file_path, 60);

    if (signedUrlError || !signedUrlData?.signedUrl) {
      console.warn("Storage sign note, falling back to demo zip:", signedUrlError?.message);
      const { data: fallbackSigned } = await supabaseAdmin
        .storage
        .from('secure_templates')
        .createSignedUrl('demo-template.zip', 60);

      if (fallbackSigned?.signedUrl) {
        return res.status(200).json({ success: true, downloadUrl: fallbackSigned.signedUrl });
      }

      return res.status(500).json({ error: 'Unable to generate secure download link at this time' });
    }

    return res.status(200).json({ success: true, downloadUrl: signedUrlData.signedUrl });
  } catch (error) {
    console.error("Error generating download:", error);
    return res.status(500).json({ error: 'Internal server error generating download link' });
  }
}
