import express from 'express';
import multer from 'multer';
import AdmZip from 'adm-zip';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { supabaseAdmin } from '../config/supabase.js';
import { requireAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadsDir = path.resolve(__dirname, '../../backend/uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Use Disk Storage to prevent Memory Exhaustion
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Helper to extract zip asynchronously
const extractZipAsync = (zip, targetPath) => {
  return new Promise((resolve, reject) => {
    // adm-zip extractAllToAsync signature: (targetPath, overwrite, keepOriginalPermission, callback)
    // Sometimes it's just (targetPath, overwrite, callback)
    try {
      zip.extractAllToAsync(targetPath, true, false, (error) => {
        if (error) reject(error);
        else resolve();
      });
    } catch (e) {
      // Fallback if signature is different
      try {
        zip.extractAllToAsync(targetPath, true, (error) => {
          if (error) reject(error);
          else resolve();
        });
      } catch (err) {
        reject(err);
      }
    }
  });
};

router.get('/stats', requireAdmin, async (req, res) => {
  try {
    const { data: purchases } = await supabaseAdmin.from('purchases').select('*');
    const { count: userCount } = await supabaseAdmin.auth.admin.listUsers();

    const actualUserCount = userCount || 0;
    let totalRevenue = 0;
    if (purchases) {
      totalRevenue = purchases.reduce((acc, curr) => acc + (parseFloat(curr.price) || 0), 0);
    }

    res.json({
      totalSales: purchases ? purchases.length : 0,
      totalRevenue,
      totalUsers: actualUserCount
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/upload-template', requireAdmin, upload.single('file'), async (req, res) => {
  try {
    const { title, description, price, category, tag, keywords, image } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'ZIP file is required' });
    }

    const fileName = file.filename;
    const filePath = `templates/${fileName}`;

    // Read file from disk to upload to Supabase
    const fileBuffer = await fs.promises.readFile(file.path);

    // Upload ZIP to Supabase Storage
    const { error: uploadError } = await supabaseAdmin.storage
      .from('secure_templates')
      .upload(filePath, fileBuffer, {
        contentType: file.mimetype,
        upsert: true
      });

    if (uploadError) throw uploadError;

    // Asynchronously unzip to frontend public directory for live preview
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const extractPath = path.resolve(__dirname, '../../frontend/public/previews', slug);
    
    // We do this in the background, not blocking the response
    setImmediate(async () => {
      try {
        const zip = new AdmZip(file.path);
        await extractZipAsync(zip, extractPath);
        // Clean up the uploaded file from disk after successful extraction
        fs.unlinkSync(file.path);
      } catch (unzipErr) {
        console.error('Failed to extract zip for preview:', unzipErr);
        // Clean up the uploaded file on error too
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      }
    });

    // Parse keywords safely
    let parsedKeywords = [];
    try {
      parsedKeywords = JSON.parse(keywords);
    } catch (e) {
      if (typeof keywords === 'string') {
        parsedKeywords = keywords.split(',').map(k => k.trim());
      }
    }

    // Insert into templates
    const { data: templateData, error: dbError } = await supabaseAdmin
      .from('templates')
      .insert({
        id: Math.floor(Math.random() * 2000000000),
        title,
        description,
        price,
        category,
        tag,
        image,
        keywords: parsedKeywords,
        author: 'Nexus Themes',
        sales: 0,
        rating: 5.0
      }).select().single();

    if (dbError) throw dbError;

    // Insert into template_files
    const { error: mappingError } = await supabaseAdmin
      .from('template_files')
      .insert({
        template_id: templateData.id,
        file_path: filePath
      });

    if (mappingError) throw mappingError;

    res.status(200).json({ success: true, template: templateData });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.delete('/template/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Fetch template
    const { data: template, error: fetchErr } = await supabaseAdmin
      .from('templates')
      .select('title')
      .eq('id', id)
      .single();

    if (fetchErr) {
      console.warn('Template fetch error (might be invalid ID):', fetchErr.message);
    }

    // 2. Fetch file mapping
    const { data: fileMapping } = await supabaseAdmin
      .from('template_files')
      .select('file_path')
      .eq('template_id', id)
      .single();

    // 3. Delete from DB (ignore out of range errors)
    await supabaseAdmin.from('template_files').delete().eq('template_id', id);
    await supabaseAdmin.from('templates').delete().eq('id', id);

    // 4. Delete from Storage
    if (fileMapping && fileMapping.file_path) {
      await supabaseAdmin.storage
        .from('secure_templates')
        .remove([fileMapping.file_path]);
    }

    if (template && template.title) {
      // Fallback: also try to delete templates/${template.title}.zip (legacy script uploads)
      await supabaseAdmin.storage.from('secure_templates').remove([`templates/${template.title}.zip`]);

      // 5. Delete Preview folder
      const slug = template.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      const previewPath = path.resolve(__dirname, '../../frontend/public/previews', slug);
      try {
        if (fs.existsSync(previewPath)) {
          fs.rmSync(previewPath, { recursive: true, force: true });
        }
      } catch (fsErr) {
        if (process.env.NODE_ENV !== 'production') console.warn('Could not delete preview folder:', fsErr.message);
      }

      // 6. Delete Original Source Folder (if exists)
      const sourcePath = path.resolve(__dirname, '../../templates', template.title);
      try {
        if (fs.existsSync(sourcePath)) {
          fs.rmSync(sourcePath, { recursive: true, force: true });
        }
      } catch (fsErr) {
        if (process.env.NODE_ENV !== 'production') console.warn('Could not delete source folder:', fsErr.message);
      }
    }

    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/update-price', requireAdmin, async (req, res) => {
  try {
    const { templateId, newPrice } = req.body;
    if (!templateId || !newPrice) return res.status(400).json({ error: 'Missing data' });

    const { error: updateError } = await supabaseAdmin
      .from('templates')
      .update({ price: newPrice })
      .eq('id', templateId);

    if (updateError) throw updateError;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Full template update
router.put('/template/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, price, category, tag, keywords, image } = req.body;

    const updates = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (price !== undefined) updates.price = price;
    if (category !== undefined) updates.category = category;
    if (tag !== undefined) updates.tag = tag;
    if (image !== undefined) updates.image = image;
    if (keywords !== undefined) {
      updates.keywords = Array.isArray(keywords)
        ? keywords
        : typeof keywords === 'string'
          ? keywords.split(',').map(k => k.trim())
          : [];
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    const { data, error } = await supabaseAdmin
      .from('templates')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, template: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
