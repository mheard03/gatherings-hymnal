// import './scss/hymnal.scss'
import { createApp } from 'vue';
import App from './App.vue';
import createRouter from './router';
import HymnsDbClient from '@/hymnsDb/hymns-db-client.js';

const app = createApp(App);
app.use(createRouter()).mount('#app');

window.client = HymnsDbClient;
console.log('hymnalsReady');
HymnsDbClient.hymnalsReady.then(() => {
  console.log('hymnalsReady done');
});

console.log('add');
let result = await HymnsDbClient.add(3, 7);
console.log('add done', result);


