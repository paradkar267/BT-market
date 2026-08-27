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
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT');
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

  try {
    const { imageBase64, fileName = 'cover.png', mimeType = 'image/png' } = req.body || {};

    if (!imageBase64) {
      return res.status(400).json({ error: 'Missing imageBase64 data' });
    }

    // Extract raw base64 content
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    const cleanFileName = `${Date.now()}_${fileName.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const filePath = `covers/${cleanFileName}`;

    if (supabaseAdmin) {
      // Ensure bucket exists
      const bucketName = 'template_covers';
      try {
        const { data: bucketData } = await supabaseAdmin.storage.getBucket(bucketName);
        if (!bucketData) {
          await supabaseAdmin.storage.createBucket(bucketName, { public: true });
        }
      } catch (bErr) {
        // Bucket might already exist or create is prohibited
      }

      // Upload file buffer
      const { data: uploadData, error: uploadErr } = await supabaseAdmin
        .storage
        .from(bucketName)
        .upload(filePath, buffer, {
          contentType: mimeType,
          upsert: true
        });

      if (!uploadErr && uploadData) {
        const { data: publicUrlData } = supabaseAdmin
          .storage
          .from(bucketName)
          .getPublicUrl(filePath);

        if (publicUrlData?.publicUrl) {
          return res.status(200).json({
            success: true,
            url: publicUrlData.publicUrl,
            filePath
          });
        }
      } else if (uploadErr) {
        console.warn('Supabase storage upload failed, using data URI fallback:', uploadErr.message);
      }
    }

    // Fallback: return data URL
    const fallbackUrl = imageBase64.startsWith('data:') ? imageBase64 : `data:${mimeType};base64,${base64Data}`;
    return res.status(200).json({
      success: true,
      url: fallbackUrl,
      isDataUrl: true
    });

  } catch (err) {
    console.error('Error in /api/upload-image:', err);
    return res.status(500).json({ error: err.message });
  }
}
