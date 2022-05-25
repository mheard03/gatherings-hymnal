import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
// import hymnContent from './vite-plugin-hymn-content/hymn-content.js';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()], //, hymnContent({ include: './hymnals/*.html' })],
});
