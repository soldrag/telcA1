import fs from 'node:fs';
import { execSync } from 'node:child_process';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { compression } from 'vite-plugin-compression2';
import { VitePWA } from 'vite-plugin-pwa';
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
  if (id.includes('node_modules/@huggingface/transformers/') || id.includes('node_modules/onnxruntime-')) {
    return 'vendor-ai-runtime';
  }
  if (id.includes('/src/data/exams/')) {
    return 'exam-seeds';
  }
}

// The Lexicon TSV is the largest file the app needs offline; Workbox skips anything above its 2 MB default.
const PRECACHE_FILE_LIMIT_BYTES = 6 * 1024 * 1024;

// Offline-first (CLAUDE.md §0): the service worker precaches every file of the build, lazy chunks included,
// so the app opens and grades without a network after the first visit. The ONNX wasm (22 MB) is left out:
// grading falls back to the limited mode offline. Registration stays in src/services/pwaRegister.js.
function offlinePrecachePlugin() {
  return VitePWA({
    injectRegister: false,
    manifest: false,
    filename: 'sw.js',
    workbox: {
      globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2,webmanifest,tsv}'],
      maximumFileSizeToCacheInBytes: PRECACHE_FILE_LIMIT_BYTES,
      navigateFallback: 'index.html',
      cleanupOutdatedCaches: true,
      clientsClaim: true,
      skipWaiting: true,
    },
  });
}

const MAIN_CHUNK_LIMIT_BYTES = 300 * 1000;

// Vite's chunkSizeWarningLimit covers every chunk, and the lazy AI runtime and seeds are large by design:
// only the entry chunk has a budget (CLAUDE.md §11), and exceeding it fails the build.
function mainChunkBudgetPlugin() {
  return {
    name: 'main-chunk-budget',
    generateBundle(_, bundle) {
      for (const chunk of Object.values(bundle)) {
        const size = chunk.type === 'chunk' && chunk.isEntry ? Buffer.byteLength(chunk.code) : 0;
        if (size > MAIN_CHUNK_LIMIT_BYTES) {
          this.error(`${chunk.fileName} is ${(size / 1000).toFixed(1)} kB, over the ${MAIN_CHUNK_LIMIT_BYTES / 1000} kB main bundle budget`);
        }
      }
    },
  };
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
    rollupOptions: {
      output: {
        manualChunks: getVendorChunk,
      },
    },
  },
  plugins: [
    react(),
    i18nContractValidatorPlugin(),
    mainChunkBudgetPlugin(),
    offlinePrecachePlugin(),
    compression({
      algorithms: ['gzip', 'brotliCompress'],
      include: /\.(html|css|js|svg|json|wasm|tsv)$/,
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
  },
});
