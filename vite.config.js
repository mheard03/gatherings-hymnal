import { resolve } from 'path';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import mkcert from 'vite-plugin-mkcert'
import fs from 'node:fs';
import esbuild from 'esbuild';

import buildHymns from './hymnals/build-scripts/build-hymns';
import buildThemes from './hymnals/build-scripts/build-themes';

async function buildMaterialColorUtilities() {
  let outfile = './hymnals/build-scripts/build-themes/jch/material-color-utilities.js';
  await esbuild.build({
    entryPoints: ['./node_modules/@material/material-color-utilities/dist/index.js'],
    outfile,
    format: 'esm',
    bundle: true,
    banner: {
      js: "/* Exact copy of @material/material-color-utilities, but bundled because Google didn't write the export statements correctly. */\n/* Built automatically by vite.config */\n"
    }
  });
  let file = await fs.promises.open(outfile, 'r');
  let textContent = await file.readFile('utf-8');
  let revised = textContent.replaceAll(/(export {[^}]+)(^[\s]+Hct,[\s]*$)/gm, "$1  Hct, HctSolver,");
  await fs.promises.writeFile(outfile, revised);
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
      base: "/",
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
