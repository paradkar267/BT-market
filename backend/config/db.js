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

const getConnectionString = () => {
  const raw = process.env.DATABASE_URL;
  return raw ? raw.trim().replace(/^['"]|['"]$/g, '') : null;
};

export const getSql = () => {
  const conn = getConnectionString();
  return conn ? neon(conn) : null;
};

export const sql = getSql();
export const pool = getConnectionString() ? new Pool({ connectionString: getConnectionString() }) : null;

/**
 * Execute a SQL query with parameters against Neon Postgres with automatic retry
 * @param {string} text - Parameterized SQL query
 * @param {Array} params - Array of parameter values
 * @returns {Promise<{ rows: Array, rowCount: number }>}
 */
export const query = async (text, params = []) => {
  const client = getSql();
  if (!client) throw new Error('Database not configured: Missing DATABASE_URL');
  
  let lastError;
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      let rows;
      if (typeof client.query === 'function') {
        rows = await client.query(text, params);
      } else {
        rows = await client(text, params);
      }
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
