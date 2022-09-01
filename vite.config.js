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
  base: "./",
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
    watch: false,
    emptyOutDir: true,
    assetsInlineLimit: 2048,
    rollupOptions: {
      input: {
        'index.html': resolve(__dirname, 'index.html'),
        'hymn.html': resolve(__dirname, 'hymn.html'),
        'hymnal.html': resolve(__dirname, 'hymnal.html'),
        'search.html': resolve(__dirname, 'search.html'),
        'hymns-db-worker': resolve(__dirname, 'src/hymnsDb', 'hymns-db-worker.js'),
      },
      output: {
        entryFileNames: function (assetInfo) {
          return assetInfo.name === 'hymns-db-worker'
             ? '[name]-[hash].js'            // put service worker in root
             : 'assets/[name]-[hash].js';    // others in `assets/js/`
        }
      },
    }
  },
  plugins: [
    mkcert(),
    vue(),
    {
      name: 'hot-reload-hymns',
      async handleHotUpdate({ file, server }) {
        if (file.includes('hymnals') && file.endsWith(".html")) {
          console.log('updating hymns-db...');
          await buildHymnals();
        }
        else if (file.includes('hymns-db-version')) {
          console.log('hymns-db updated.');
        }
      }
    },
    {
      name: 'copy-index',
      handleHotUpdate({ file, server }) {
        if (file.endsWith('/index.html')) {
          let targets = ["hymn.html", "hymnal.html", "search.html"];
          targets.forEach(t => fs.copyFileSync("index.html", t, (err) => { if (err) throw err; }));
        }
      }
    }
  ]
});
