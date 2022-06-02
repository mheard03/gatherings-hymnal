import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
const fs = require('fs');

const { buildHymnals } = require('./hymnals/build-scripts/build-hymnals');
import { existsSync } from 'fs';
if (!existsSync('./src/assets/hymns-db-generated.json')) {
  buildHymnals();
}

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    watch: {

    }
  },
  build: {
    watch: {},
  },
  plugins: [
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
    }
  ]
});
