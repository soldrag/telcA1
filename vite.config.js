import fs from 'node:fs';
import { execSync } from 'node:child_process';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { compression } from 'vite-plugin-compression2';
import { i18nContractValidatorPlugin } from './src/i18n/build/i18nPlugin.js';

const pkg = JSON.parse(fs.readFileSync(new URL('./package.json', import.meta.url), 'utf8'));

function resolveGitCommit() {
  if (process.env.VITE_GIT_COMMIT) {
    return process.env.VITE_GIT_COMMIT.slice(0, 7);
  }
  try {
    return execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim();
  } catch {
    return 'dev';
  }
}

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
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
    __COMMIT_HASH__: JSON.stringify(resolveGitCommit()),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
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
