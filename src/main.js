import 'bootstrap/dist/css/bootstrap.min.css';
import { createApp } from 'vue';
import App from './App.vue';
import createRouter from './router';

createApp(App).use(createRouter()).mount('#app');
import 'bootstrap/dist/js/bootstrap.js';
