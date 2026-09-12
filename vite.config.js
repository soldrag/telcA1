import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { compression } from 'vite-plugin-compression2';
import { i18nContractValidatorPlugin } from './src/i18n/build/i18nPlugin.js';

function getVendorChunk(id) {
  if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
    return 'vendor-react';
  }
  if (id.includes('node_modules/lucide-react/')) {
    return 'vendor-icons';
  }
  if (id.includes('/server/seeds/') || id.includes('server/seed-data.js')) {
    return 'exam-seeds';
  }
}

export default defineConfig({
  base: './',
  worker: {
    format: 'es',
  },
  plugins: [
    react(),
    i18nContractValidatorPlugin(),
    compression({
      algorithms: ['gzip', 'brotliCompress'],
      include: /\.(html|css|js|svg|json)$/,
    }),
  ],
  build: {
    target: 'es2022',
    emptyOutDir: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        passes: 2,
      },
      format: {
        comments: false,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: getVendorChunk,
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});
