// import './scss/hymnal.scss'
import { createApp } from 'vue';
import App from './App.vue';
import createRouter from './router';
import HymnsDbClient from '@/hymnsDb/hymns-db-client.js';
import * as d3 from "d3-scale";
import Color from '../hymnals/build-scripts/build-themes/jch/cam16';
import PaletteBase from '../hymnals/build-scripts/build-themes/palette-base';
import Palette from '../hymnals/build-scripts/build-themes/palette'
import NeutralPalette from '../hymnals/build-scripts/build-themes/neutral-palette'
import Scheme from '../hymnals/build-scripts/build-themes/scheme'


// import ColorSpace from "colorjs.io/src/space.js";

const app = createApp(App);
app.config.globalProperties.$hymnsDb = HymnsDbClient;
app.use(createRouter()).mount('#app');
window.d3 = d3;
window.Palette = Palette;
window.PaletteBase = PaletteBase;
window.NeutralPalette = NeutralPalette;
window.Color = Color;
window.Scheme = Scheme;
// window.ColorSpace = ColorSpace;

// TODO: app.config.globalProperties.userSettings
// TODO: app.config.globalProperties.fontSize