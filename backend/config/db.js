import { neon, Pool } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'dns';

// Force IPv4 first to prevent timeout on IPv6 addresses in Node.js
dns.setDefaultResultOrder('ipv4first');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn('⚠️ Warning: Missing DATABASE_URL in environment configuration');
}

export const sql = connectionString ? neon(connectionString) : null;
export const pool = connectionString ? new Pool({ connectionString }) : null;

/**
 * Execute a SQL query with parameters against Neon Postgres with automatic retry
 * @param {string} text - Parameterized SQL query
 * @param {Array} params - Array of parameter values
 * @returns {Promise<{ rows: Array, rowCount: number }>}
 */
export const query = async (text, params = []) => {
  if (!sql) throw new Error('Database not configured: Missing DATABASE_URL');
  
  let lastError;
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const rows = await sql.query(text, params);
      return {
        rows: Array.isArray(rows) ? rows : (rows?.rows || []),
        rowCount: Array.isArray(rows) ? rows.length : (rows?.rowCount || 0)
      };
    } catch (error) {
      lastError = error;
      if (attempt === 1) {
        await new Promise(r => setTimeout(r, 500));
      }
    }
  }

  console.error('Neon DB Error:', lastError.message);
  throw lastError;
};

export default { sql, pool, query };
