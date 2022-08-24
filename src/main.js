// import './scss/hymnal.scss'
import { createApp } from 'vue';
import App from './App.vue';
import createRouter from './router';
import HymnsDbClient from '@/hymnsDb/hymns-db-client.js';

const app = createApp(App);
app.use(createRouter()).mount('#app');


let result;
window.client = HymnsDbClient;
console.log('getHymnals');
result = await HymnsDbClient.getHymnals();
console.log('getHymnals result', result);

console.log('getHymns');
result = await HymnsDbClient.getHymns(153);
console.log('getHymns result', result);

console.log('getHymnalSections');
result = await HymnsDbClient.getHymnalSections("redbook");
console.log('getHymnalSections result', result);