import 'bootstrap/dist/css/bootstrap.min.css';
import { createApp } from 'vue';
import App from './App.vue';
import createRouter from './router';
import hymns from './assets/hymns-db';
import 'bootstrap/dist/js/bootstrap.js';

const app = createApp(App);
app.provide('hymns', hymns)
app.use(createRouter()).mount('#app');


