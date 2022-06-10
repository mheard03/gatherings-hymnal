// import './scss/hymnal.scss'
import { createApp } from 'vue';
import App from './App.vue';
import createRouter from './router';
import hymns from './assets/hymns-db';

const app = createApp(App);
app.provide('hymnsDB', hymns);
app.provide('userSettings', { });
app.use(createRouter()).mount('#app');

// TODO: Remove
window.hymnsDB = hymns;