import express from 'express';
import multer from 'multer';
import AdmZip from 'adm-zip';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import util from 'util';
import { supabaseAdmin } from '../config/supabase.js';
import { requireAdmin } from '../middlewares/authMiddleware.js';

const execPromise = util.promisify(exec);

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

// Helper to flatten directory if index.html is nested
const flattenDirectory = (srcDir) => {
  const findIndexHtml = (dir) => {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        if (file === 'node_modules' || file === '.git') continue;
        const found = findIndexHtml(fullPath);
        if (found) return found;
      } else if (file.toLowerCase() === 'index.html') {
        return dir;
      }
    }
    return null;
  };

  const indexHtmlDir = findIndexHtml(srcDir);
  if (indexHtmlDir && indexHtmlDir !== srcDir) {
    console.log(`Flattening preview files: moving contents of ${indexHtmlDir} to ${srcDir}`);
    
    // Move all items from indexHtmlDir to srcDir
    const moveContents = (fromDir, toDir) => {
      const items = fs.readdirSync(fromDir);
      for (const item of items) {
        const srcPath = path.join(fromDir, item);
        const destPath = path.join(toDir, item);
        if (fs.existsSync(destPath)) {
          const srcStat = fs.statSync(srcPath);
          const destStat = fs.statSync(destPath);
          if (srcStat.isDirectory() && destStat.isDirectory()) {
            moveContents(srcPath, destPath);
            try {
              fs.rmdirSync(srcPath);
            } catch (e) {
              console.error(`Failed to remove empty source directory ${srcPath}:`, e);
            }
          } else {
            try {
              if (destStat.isDirectory()) {
                fs.rmdirSync(destPath, { recursive: true });
              } else {
                fs.unlinkSync(destPath);
              }
              fs.renameSync(srcPath, destPath);
            } catch (err) {
              console.error(`Error resolving conflict for ${item}:`, err);
            }
          }
        } else {
          fs.renameSync(srcPath, destPath);
        }
      }
    };

    moveContents(indexHtmlDir, srcDir);
    
    // Clean up empty nested directories starting from indexHtmlDir up to srcDir
    let currentDir = indexHtmlDir;
    while (currentDir !== srcDir && currentDir.startsWith(srcDir)) {
      try {
        if (fs.readdirSync(currentDir).length === 0) {
          fs.rmdirSync(currentDir);
        }
      } catch (e) {
        console.error(`Failed to clean up directory ${currentDir}:`, e);
      }
      currentDir = path.dirname(currentDir);
    }
  }
};

// Helper to fix absolute asset paths in HTML/JS/CSS files for live previews
const processPreviewPaths = (dir, slug) => {
  if (!fs.existsSync(dir)) return;
  const prefix = `/previews/${slug}`;
  const replacements = [
    { from: /src="\/(?!previews\/)([^"]*)"/g, to: `src="${prefix}/$1"` },
    { from: /src='\/(?!previews\/)([^']*)'/g, to: `src='${prefix}/$1'` },
    { from: /href="\/(?!previews\/)([^"]*)"/g, to: `href="${prefix}/$1"` },
    { from: /href='\/(?!previews\/)([^']*)'/g, to: `href='${prefix}/$1'` },
    { from: /url\("\/(?!previews\/)([^"]*)"\)/g, to: `url("${prefix}/$1")` },
    { from: /url\('\/(?!previews\/)([^']*)'\)/g, to: `url('${prefix}/$1')` },
    { from: /url\(\/(?!previews\/)([^\)'"]*)\)/g, to: `url(${prefix}/$1)` }
  ];

  const processDir = (currentDir) => {
    const files = fs.readdirSync(currentDir);
    for (const file of files) {
      const fullPath = path.join(currentDir, file);
      if (fs.statSync(fullPath).isDirectory()) {
        processDir(fullPath);
      } else if (fullPath.endsWith('.html') || fullPath.endsWith('.js') || fullPath.endsWith('.css')) {
        let content = fs.readFileSync(fullPath, 'utf8');
        let changed = false;
        for (const { from, to } of replacements) {
          if (from.test(content)) {
            content = content.replace(from, to);
            changed = true;
          }
        }
        if (changed) {
          fs.writeFileSync(fullPath, content, 'utf8');
        }
      }
    }
  };

  processDir(dir);
};

// Helper to detect if extracted dir is a React/Vite source project and build it automatically if needed
const ensurePreviewBuild = async (extractPath, slug) => {
  if (!fs.existsSync(extractPath)) return;
  const indexPath = path.join(extractPath, 'index.html');
  const pkgPath = path.join(extractPath, 'package.json');
  
  let isReactVite = fs.existsSync(pkgPath);
  if (fs.existsSync(indexPath)) {
    const content = fs.readFileSync(indexPath, 'utf8');
    if (content.includes('.tsx') || content.includes('.jsx') || content.includes('main.tsx') || content.includes('main.jsx')) {
      isReactVite = true;
    }
  }

  if (isReactVite) {
    console.log(`Detected React/Vite template source project for "${slug}". Building production static bundle...`);
    try {
      if (fs.existsSync(indexPath)) {
        let indexContent = fs.readFileSync(indexPath, 'utf8');
        indexContent = indexContent.replace(new RegExp(`/previews/${slug}/src/`, 'g'), '/src/');
        fs.writeFileSync(indexPath, indexContent, 'utf8');
      }

      const viteConfigTs = path.join(extractPath, 'vite.config.ts');
      const viteConfigJs = path.join(extractPath, 'vite.config.js');
      const targetViteConfig = fs.existsSync(viteConfigTs) ? viteConfigTs : (fs.existsSync(viteConfigJs) ? viteConfigJs : null);
      
      if (targetViteConfig) {
        let vContent = fs.readFileSync(targetViteConfig, 'utf8');
        if (!vContent.includes("base:")) {
          vContent = vContent.replace(/return\s*\{/, `return {\n    base: './',`);
          if (!vContent.includes("base: './'")) {
            vContent = vContent.replace(/defineConfig\(\{/, `defineConfig({\n  base: './',`);
          }
          fs.writeFileSync(targetViteConfig, vContent, 'utf8');
        }
      }

      await execPromise(`npm install --legacy-peer-deps`, { cwd: extractPath });
      await execPromise(`npx vite build --base=./`, { cwd: extractPath });

      const distDir = path.join(extractPath, 'dist');
      if (fs.existsSync(distDir)) {
        const distFiles = fs.readdirSync(distDir);
        for (const file of distFiles) {
          const srcP = path.join(distDir, file);
          const destP = path.join(extractPath, file);
          if (fs.existsSync(destP)) {
            if (fs.statSync(destP).isDirectory()) {
              fs.rmdirSync(destP, { recursive: true });
            } else {
              fs.unlinkSync(destP);
            }
          }
          fs.renameSync(srcP, destP);
        }
        try { fs.rmdirSync(distDir); } catch(e) {}
      }

      const itemsToClean = ['src', 'node_modules', 'package.json', 'package-lock.json', 'tsconfig.json', 'vite.config.ts', 'vite.config.js', 'bun.lock', '.git', '.env'];
      for (const item of itemsToClean) {
        const itemP = path.join(extractPath, item);
        if (fs.existsSync(itemP)) {
          try {
            if (fs.statSync(itemP).isDirectory()) {
              fs.rmdirSync(itemP, { recursive: true });
            } else {
              fs.unlinkSync(itemP);
            }
          } catch(e) {}
        }
      }
      processPreviewPaths(extractPath, slug);
      console.log(`Successfully built & sanitized React/Vite preview for "${slug}"!`);
    } catch (buildErr) {
      console.error(`Failed to build React/Vite template for "${slug}":`, buildErr.message);
      processPreviewPaths(extractPath, slug);
    }
  } else {
    // Standard static HTML template
    processPreviewPaths(extractPath, slug);
  }
};

router.get('/stats', requireAdmin, async (req, res) => {
  try {
    const { data: purchases } = await supabaseAdmin.from('purchases').select('template_id');
    const { data: usersData } = await supabaseAdmin.auth.admin.listUsers();
    const { data: templates } = await supabaseAdmin.from('templates').select('id, price');

    const actualUserCount = usersData?.users?.length || 0;
    let totalRevenue = 0;
    if (purchases && templates) {
      const priceMap = {};
      templates.forEach(t => {
        priceMap[t.id] = parseFloat(t.price) || 0;
      });
      totalRevenue = purchases.reduce((acc, curr) => acc + (priceMap[curr.template_id] || 0), 0);
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

    // Unzip, flatten, auto-build if React/Vite, and fix paths synchronously for live preview
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const extractPath = path.resolve(__dirname, '../../frontend/public/previews', slug);
    
    try {
      if (!fs.existsSync(extractPath)) {
        fs.mkdirSync(extractPath, { recursive: true });
      }
      const zip = new AdmZip(file.path);
      await extractZipAsync(zip, extractPath);
      // Flatten the extracted zip contents if nested
      flattenDirectory(extractPath);
      // Automatically detect & build React/Vite source or process static HTML paths
      await ensurePreviewBuild(extractPath, slug);
      // Clean up the uploaded file from disk after successful extraction
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
    } catch (unzipErr) {
      console.error('Failed to extract zip for preview:', unzipErr);
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
    }

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
        rating: 5.0,
        previewUrl: `/previews/${slug}/index.html`
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
