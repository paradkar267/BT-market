import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL, pathToFileURL } from 'node:url'
import path from 'node:path'
import dns from 'dns'

// Force IPv4 for Nodemailer
dns.setDefaultResultOrder('ipv4first');

// Resolve absolute path to api directory
const projectRootDir = fileURLToPath(new URL('..', import.meta.url));
const loadApi = async (filename) => {
  const absolutePath = path.resolve(projectRootDir, 'api', filename);
  const fileUrl = pathToFileURL(absolutePath).href;
  const mod = await import(`${fileUrl}?t=${Date.now()}`);
  return mod.default;
};

function devApiPlugin() {
  return {
    name: 'dev-api-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const urlPath = req.url ? req.url.split('?')[0] : '';
        if (!urlPath.startsWith('/api/')) {
          return next();
        }

        // Shim Express/Vercel response helpers if missing in Connect
        if (!res.status) {
          res.status = function(code) {
            this.statusCode = code;
            return this;
          };
        }
        if (!res.json) {
          res.json = function(data) {
            this.setHeader('Content-Type', 'application/json');
            this.end(JSON.stringify(data));
            return this;
          };
        }
        if (!res.send) {
          res.send = function(data) {
            this.end(data);
            return this;
          };
        }

        const getBody = () => new Promise((resolve) => {
          let data = '';
          req.on('data', chunk => { data += chunk; });
          req.on('end', () => {
            try {
              resolve(data ? JSON.parse(data) : {});
            } catch {
              resolve({});
            }
          });
        });

        try {
          if (urlPath === '/api/send-receipt' && req.method === 'POST') {
            req.body = await getBody();
            const handler = await loadApi('send-receipt.js');
            return await handler(req, res);
          } else if (urlPath === '/api/verify-payment' && req.method === 'POST') {
            req.body = await getBody();
            const handler = await loadApi('verify-payment.js');
            return await handler(req, res);
          } else if (urlPath === '/api/generate-download' && req.method === 'POST') {
            req.body = await getBody();
            const handler = await loadApi('generate-download.js');
            return await handler(req, res);
          } else if (urlPath === '/api/contact' && req.method === 'POST') {
            req.body = await getBody();
            const handler = await loadApi('contact.js');
            return await handler(req, res);
          } else if (
            urlPath.startsWith('/api/admin-') ||
            urlPath === '/api/admin' ||
            urlPath === '/api/campaigns' ||
            urlPath === '/api/announcement-banner'
          ) {
            if (req.method === 'POST' || req.method === 'PATCH' || req.method === 'DELETE' || req.method === 'PUT') {
              req.body = await getBody();
            }
            const handler = await loadApi(urlPath === '/api/announcement-banner' ? 'announcement-banner.js' : 'admin.js');
            return await handler(req, res);
          } else if (urlPath === '/api/request-refund' && req.method === 'POST') {
            req.body = await getBody();
            const handler = await loadApi('request-refund.js');
            return await handler(req, res);
          }
        } catch (err) {
          console.error("Dev API Middleware Error:", err);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: err.message }));
          return;
        }

        next();
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), devApiPlugin()],
  envDir: '../',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      '/api/admin': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      }
    }
  }
})


