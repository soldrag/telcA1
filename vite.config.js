import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { i18nContractValidatorPlugin } from './src/i18n/build/i18nPlugin.js';

export default defineConfig({
  base: './',
  plugins: [react(), i18nContractValidatorPlugin()],
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
