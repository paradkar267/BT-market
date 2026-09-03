import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('Missing DATABASE_URL in .env.local');
  process.exit(1);
}

const sql = neon(connectionString);

async function runMigration() {
  console.log('🚀 Starting migration to Neon...');
  try {
    const sqlFile = path.resolve(__dirname, 'neon_schema.sql');
    const sqlContent = fs.readFileSync(sqlFile, 'utf8');

    console.log('Executing neon_schema.sql...');
    
    // Split by semicolons at end of line or before comments
    const statements = sqlContent
      .split(/;\s*$/m)
      .map(s => s.trim())
      .filter(s => s.length > 0);

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      if (stmt.replace(/--.*$/gm, '').trim().length === 0) continue;
      try {
        await sql.query(stmt);
      } catch (err) {
        console.error(`Error on statement #${i + 1}:`, err.message);
        console.error('Failed statement snippet:\n', stmt.substring(0, 200));
        throw err;
      }
    }

    console.log('✅ All schema statements executed successfully!');

    // Verify tables
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;
    console.log('📋 Public Tables in Neon:');
    console.log(tables.map(t => t.table_name));

    // Verify template count
    const templatesCount = await sql`SELECT count(*) FROM templates;`;
    console.log(`📦 Templates in Neon: ${templatesCount[0].count}`);

    // Verify coupon count
    const couponsCount = await sql`SELECT count(*) FROM coupons;`;
    console.log(`🎟️ Coupons in Neon: ${couponsCount[0].count}`);

    console.log('🎉 Migration to Neon completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
