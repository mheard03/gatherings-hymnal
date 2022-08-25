// import './scss/hymnal.scss'
import { createApp } from 'vue';
import App from './App.vue';
import createRouter from './router';
import HymnsDbClient from '@/hymnsDb/hymns-db-client.js';

const app = createApp(App);
app.config.globalProperties.$hymnsDb = HymnsDbClient;
app.use(createRouter()).mount('#app');

// TODO: app.config.globalProperties.userSettings
// TODO: app.config.globalProperties.fontSize