import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import dns from 'dns';

// Force IPv4 for Nodemailer & local network
dns.setDefaultResultOrder('ipv4first');

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  envDir: '../',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  optimizeDeps: {
    entries: ['src/**/*.{js,jsx}']
  },
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      }
    }
  }
});
