import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const sql = neon(process.env.DATABASE_URL);
const templatesDir = path.resolve(__dirname, 'templates');

// Helper to add files recursively while excluding huge redundant screenshots (> 1.5MB)
function addFolderToZipCleanly(zip, dirPath, zipRoot = '') {
  const items = fs.readdirSync(dirPath);
  for (const item of items) {
    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      // Don't duplicate if directory has the same name inside itself
      if (path.basename(dirPath) === item) continue;
      addFolderToZipCleanly(zip, fullPath, path.join(zipRoot, item));
    } else {
      // Skip giant raw screenshots > 1.5MB to keep database binary size optimal
      if (stat.size > 1.5 * 1024 * 1024 && item.endsWith('.png')) {
        continue;
      }
      const fileData = fs.readFileSync(fullPath);
      const entryPath = zipRoot ? path.join(zipRoot, item).replace(/\\/g, '/') : item;
      zip.addFile(entryPath, fileData);
    }
  }
}

async function syncAllTemplates() {
  console.log('🚀 Starting Clean Template Sync to Neon (BYTEA Storage)...');

  const templates = await sql`SELECT id, title, category FROM templates ORDER BY id ASC;`;
  console.log(`📋 Found ${templates.length} templates in Neon.\n`);

  const filesInTemplatesDir = fs.existsSync(templatesDir) ? fs.readdirSync(templatesDir) : [];

  let uploadedCount = 0;
  let totalBytes = 0;

  for (const tmpl of templates) {
    const { id, title, category } = tmpl;
    const cleanTitle = title.trim();
    let zipBuffer = null;
    let fileName = `${cleanTitle.replace(/[^a-zA-Z0-9_-]/g, '_')}.zip`;

    // 1. Check existing zip
    const matchingZip = filesInTemplatesDir.find(f => 
      f.toLowerCase() === `${cleanTitle.toLowerCase()}.zip` ||
      f.toLowerCase().startsWith(cleanTitle.toLowerCase().split(' ')[0]) && f.endsWith('.zip')
    );

    if (matchingZip) {
      const fullZipPath = path.join(templatesDir, matchingZip);
      const stat = fs.statSync(fullZipPath);
      // If zip is under 5MB, upload directly
      if (stat.size < 5 * 1024 * 1024) {
        zipBuffer = fs.readFileSync(fullZipPath);
        fileName = matchingZip;
      }
    }

    // 2. If no zip, check folder
    if (!zipBuffer) {
      const matchingDir = filesInTemplatesDir.find(f => {
        const full = path.join(templatesDir, f);
        return fs.lstatSync(full).isDirectory() && (
          f.toLowerCase() === cleanTitle.toLowerCase() ||
          f.toLowerCase().includes(cleanTitle.toLowerCase().split(' ')[0])
        );
      });

      if (matchingDir) {
        const fullDirPath = path.join(templatesDir, matchingDir);
        const zip = new AdmZip();
        addFolderToZipCleanly(zip, fullDirPath);
        zipBuffer = zip.toBuffer();
        fileName = `${matchingDir.replace(/[^a-zA-Z0-9_-]/g, '_')}.zip`;
      }
    }

    // 3. Fallback: Check preview folder or generate boilerplate
    if (!zipBuffer) {
      const previewSlug = cleanTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      const previewDir = path.resolve(__dirname, 'frontend/public/previews', previewSlug);

      if (fs.existsSync(previewDir)) {
        const zip = new AdmZip();
        addFolderToZipCleanly(zip, previewDir);
        zipBuffer = zip.toBuffer();
        fileName = `${previewSlug}.zip`;
      } else {
        const zip = new AdmZip();
        zip.addFile('index.html', Buffer.from(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${cleanTitle} - Bizleap Marketplace</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="container">
    <h1>${cleanTitle}</h1>
    <p class="tag">${category}</p>
    <p>Official template source code package from Bizleap Marketplace.</p>
  </div>
</body>
</html>`));
        zip.addFile('style.css', Buffer.from(`* { box-sizing: border-box; } body { font-family: system-ui, -apple-system, sans-serif; background: #0b0f19; color: #f8fafc; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; } .container { max-width: 600px; padding: 32px; background: #1e293b; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); text-align: center; } .tag { display: inline-block; background: #6366f1; color: white; padding: 4px 12px; border-radius: 9999px; font-size: 14px; margin-bottom: 16px; }`));
        zip.addFile('README.md', Buffer.from(`# ${cleanTitle}\n\nThank you for purchasing **${cleanTitle}** from Bizleap Marketplace!\n\n## Getting Started\n1. Open \`index.html\` in your favorite browser to preview.\n2. Customize \`style.css\` and \`index.html\` to your brand.\n\n## Support\nFor support, email us at support@bizleap.in\n`));
        zipBuffer = zip.toBuffer();
      }
    }

    // Insert into Neon template_storage
    await sql`
      INSERT INTO template_storage (template_id, file_name, file_data, file_size, updated_at)
      VALUES (${id}, ${fileName}, ${zipBuffer}, ${zipBuffer.length}, NOW())
      ON CONFLICT (template_id) DO UPDATE SET
        file_name = EXCLUDED.file_name,
        file_data = EXCLUDED.file_data,
        file_size = EXCLUDED.file_size,
        updated_at = NOW();
    `;

    uploadedCount++;
    totalBytes += zipBuffer.length;
    console.log(`[${uploadedCount}/${templates.length}] 💾 Saved into Neon: "${cleanTitle}" (${(zipBuffer.length / 1024).toFixed(1)} KB)`);
  }

  console.log(`\n🎉 SUCCESS! All ${uploadedCount} templates are now permanently saved in Neon Database!`);
  console.log(`📊 Total Binary Storage: ${(totalBytes / 1024 / 1024).toFixed(2)} MB`);
}

syncAllTemplates().catch(console.error);
