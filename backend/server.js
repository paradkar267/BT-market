import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dns from 'dns';

// Import our Neon config, routes, and services
import { query } from './config/db.js';
import adminRoutes from './routes/adminRoutes.js';
import publicRoutes from './routes/publicRoutes.js';
import authRoutes from './routes/authRoutes.js';

// Force IPv4 for Nodemailer
dns.setDefaultResultOrder('ipv4first');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const app = express();
const PORT = process.env.PORT || 3000;

// Trust reverse proxy
app.set('trust proxy', 1);

// Security Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false, // Allow loading local uploads & images
  noSniff: true,
  xssFilter: true,
  hidePoweredBy: true
}));

// Rate Limiter: General API
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5000, // 5,000 requests per 15 minutes
  skip: (req) => {
    const ip = req.ip || req.connection?.remoteAddress || '';
    const host = req.get('host') || '';
    return (
      ip === '127.0.0.1' ||
      ip === '::1' ||
      ip.includes('127.0.0.1') ||
      host.includes('localhost') ||
      host.includes('127.0.0.1')
    );
  },
  message: { error: 'Too many requests from this IP, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict Rate Limiter for Authentication & Passwords (Anti-Brute Force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Max 20 attempts per IP per 15 minutes
  skip: (req) => {
    const ip = req.ip || req.connection?.remoteAddress || '';
    return ip === '127.0.0.1' || ip === '::1' || ip.includes('127.0.0.1');
  },
  message: { error: 'Too many authentication attempts. Please try again after 15 minutes for security.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Contact Form Limiter (Anti-Spam)
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 6, // Max 6 messages per 15 mins per IP
  message: { error: 'Too many messages sent. Please wait before submitting again.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', apiLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/password', authLimiter);
app.use('/api/contact', contactLimiter);

// Flexible & Secure CORS
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (
      allowedOrigins.includes(origin) ||
      origin.endsWith('.vercel.app') ||
      origin.endsWith('.onrender.com') ||
      origin.includes('bizleap.in')
    ) {
      return callback(null, true);
    }
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    return callback(new Error('Blocked by CORS policy'));
  },
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With']
}));

app.use(express.json({ limit: '10mb' }));

// Secure Static Uploads: Serve ONLY safe image assets; block ZIP, code, scripts, and executables
const ALLOWED_IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif', '.ico']);
app.use('/uploads', (req, res, next) => {
  const ext = path.extname(req.path).toLowerCase();
  // Block any non-image file access directly from static uploads
  if (!ALLOWED_IMAGE_EXTS.has(ext)) {
    return res.status(403).json({ error: 'Access denied: Direct access to this file type is prohibited' });
  }
  // Prevent directory traversal attacks
  if (req.path.includes('..') || req.path.includes('//')) {
    return res.status(400).json({ error: 'Invalid file path' });
  }
  next();
}, express.static(path.resolve(__dirname, 'uploads'), {
  dotfiles: 'ignore',
  etag: true,
  maxAge: '7d'
}));

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', adminRoutes);
app.use('/api', publicRoutes);

// Dynamic Sitemap Generation from Neon Postgres
app.get('/sitemap.xml', async (req, res) => {
  try {
    const { rows: templates } = await query('SELECT id FROM templates');

    const baseUrl = 'https://btmarket.com';
    const staticPages = ['', '/templates', '/featured', '/ui-kits', '/contact'];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // Static pages
    for (const page of staticPages) {
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}${page}</loc>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>${page === '' ? '1.0' : '0.8'}</priority>\n`;
      xml += `  </url>\n`;
    }

    // Dynamic product pages
    if (templates && templates.length) {
      for (const t of templates) {
        xml += `  <url>\n`;
        xml += `    <loc>${baseUrl}/product/${t.id}</loc>\n`;
        xml += `    <changefreq>monthly</changefreq>\n`;
        xml += `    <priority>0.7</priority>\n`;
        xml += `  </url>\n`;
      }
    }

    xml += `</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (err) {
    console.error('Sitemap error:', err);
    res.status(500).send('Error generating sitemap');
  }
});

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Global Error Handler (Sanitized for security)
app.use((err, req, res, next) => {
  console.error('Unhandled Backend Error:', err);
  const isProd = process.env.NODE_ENV === 'production';
  res.status(err.status || 500).json({ 
    error: isProd ? 'Internal Server Error' : (err.message || 'Internal Server Error')
  });
});

app.listen(PORT, () => {
  console.log(`Backend Server running at http://localhost:${PORT}`);
});
