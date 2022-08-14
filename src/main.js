// import './scss/hymnal.scss'
import { createApp } from 'vue';
import App from './App.vue';
import createRouter from './router';

// const searchWorker = new SharedWorker('searchWorker.js');

const app = createApp(App);
app.use(createRouter()).mount('#app');