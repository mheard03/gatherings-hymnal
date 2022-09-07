import { resolve } from 'path';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import mkcert from 'vite-plugin-mkcert'
import fs from 'node:fs';
import esbuild from 'esbuild';

import buildHymns from './hymnals/build-scripts/build-hymns';
import buildThemes from './hymnals/build-scripts/build-themes';

async function buildMaterialColorUtilities() {
  await esbuild.build({
    entryPoints: ['./node_modules/@material/material-color-utilities/dist/index.js'],
    outfile: './src/utils/material-color-utilities.js',
    format: 'esm',
    bundle: true
  });
  console.log('rebuilt material-color-utilities from source');
  return;
};
async function buildAssets() {
  if (!fs.existsSync('./src/assets/hymns-db-data.json')) {
    await buildHymns();
  }
  if (!fs.existsSync('./src/assets/hymnal-themes.css')) {
    await buildThemes();
  }
}

// https://vitejs.dev/config/
export default defineConfig(async ({ command, mode }) => {
  await buildMaterialColorUtilities();
  await buildAssets();
  return {
    base: "./",
    server: {
      watch: {},
      https: true,
      host: true
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, "./src/")
      },
    },
    build: {
      base: "/dist/",
      minify: "terser",
      sourcemap: true,
      watch: false,
      emptyOutDir: true,
      assetsInlineLimit: -1,
      terserOptions: {
        compress: {
          passes: 2,
          module: true,
          unused: false,
          keep_classnames: true,
          keep_fnames: true
        },
        mangle: {
          keep_classnames: true,
          keep_fnames: true,
          module: true
        }
      },
      rollupOptions: {
        input: {
          'index.html': resolve(__dirname, 'index.html'),
          'hymn.html': resolve(__dirname, 'hymn.html'),
          'hymnal.html': resolve(__dirname, 'hymnal.html'),
          'search.html': resolve(__dirname, 'search.html')
        },
        output: {
          entryFileNames: `assets/[name].js`,
          chunkFileNames: `assets/[name].js`,
          assetFileNames: `assets/[name].[ext]`,
        },
      }
    },
    worker: {
      rollupOptions: {
        output: {
          entryFileNames: `assets/[name].js`,
          chunkFileNames: `assets/[name].js`,
          assetFileNames: `assets/[name].[ext]`
        }
      }
    },
    plugins: [
      mkcert(),
      vue(),
      {
        name: 'hot-reload-hymns',
        async handleHotUpdate({ file, server }) {
          if (file.includes('hymnals/') && file.endsWith(".html")) {
            console.log('updating hymns-db...');
            await buildHymns();
          }
          else if (file.includes('hymns-db-version')) {
            console.log('hymns-db updated.');
          }
        }
      },
      {
        name: 'copy-index',
        async handleHotUpdate({ file, server }) {
          if (file.endsWith('/index.html')) {
            let targets = ["hymn.html", "hymnal.html", "search.html"];
            let copyPromises = targets.map(t => fs.promises.copyFile("index.html", t));
            await Promise.all(copyPromises);
          }
        }
      }
    ]
  };
});
