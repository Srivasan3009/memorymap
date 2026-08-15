import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { copyFileSync } from 'node:fs';
import { resolve } from 'node:path';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'gh-pages-spa',
      closeBundle() {
        // GitHub Pages serves 404.html for unmatched routes; copying the built
        // index lets BrowserRouter deep links render instead of 404ing.
        copyFileSync(resolve(process.cwd(), 'dist/index.html'), resolve(process.cwd(), 'dist/404.html'));
      }
    }
  ],
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true
  },
  server: {
    proxy: {
      '/api': 'http://localhost:3001'
    }
  }
});