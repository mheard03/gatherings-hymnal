// import './scss/hymnal.scss'
import { createApp } from 'vue';
import App from './App.vue';
import createRouter from './router';
import HymnsDbClient from '@/hymnsDb/hymnsDbClient.js';

const app = createApp(App);
app.use(createRouter()).mount('#app');

let client = new HymnsDbClient();
for (let i = 1; i <= 4; i++) {
  client.awaitStatus(i).then(r => console.log('awaitStatus', i, r));
}
