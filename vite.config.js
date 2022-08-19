import { resolve, path } from 'path';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import mkcert from'vite-plugin-mkcert'
const fs = require('fs');

const { buildHymnals } = require('./hymnals/build-scripts/build-hymnals');
import { existsSync } from 'fs';
if (!existsSync('./src/assets/hymns-db-generated.json')) {
  buildHymnals();
}

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    watch: {},
    https: true,
    host: true
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, "./src/")
    }
  },
  build: {
    watch: {},
    chunkSizeWarningLimit: 1300,
    emptyOutDir: true,
    rollupOptions: {
      input: {
        'index.html': resolve(__dirname, 'index.html'),
        'hymn.html': resolve(__dirname, 'hymn.html'),
        'hymnal.html': resolve(__dirname, 'hymnal.html'),
        'search.html': resolve(__dirname, 'search.html')
      }
    }
  },
  plugins: [
    mkcert(),
    vue(),
    {
      name: 'hot-reload-hymns',
      handleHotUpdate({ file, server }) {
        if (file.includes('hymnals') && file.endsWith(".html")) {
          console.log('updating hymns-db...');
          buildHymnals();
        }
        else if (file.includes('hymns-db-generated.json')) {
          console.log('hymns-db updated.');
        }
      }
    },
    {
      name: 'copy-index',
      handleHotUpdate({ file, server }) {
        if (file.endsWith('/index.html')) {
          fs.copyFile("index.html", "hymn.html", (err) => { if (err) throw err; });
          fs.copyFile("index.html", "hymnal.html", (err) => { if (err) throw err; });
          fs.copyFile("index.html", "search.html", (err) => { if (err) throw err; });
        }
      }
    }
  ]
});
