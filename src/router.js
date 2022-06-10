import {
  createRouter,
  createWebHistory,
} from 'vue-router/dist/vue-router.esm-bundler';

export default () =>
  createRouter({
    history: createWebHistory(),
    routes: [
      {
        path: '/',
        name: 'home',
        component: () => import('./views/Home.vue'),
      },
      {
        path: '/hymnal.html',
        name: 'hymnal',
        component: () => import('./views/Hymnal.vue'),
      },
      {
        path: '/hymn.html',
        name: 'hymn',
        component: () => import('./views/Hymn.vue'),
        props: route => ({ hymnal: route.query.hymnal, hymnNo: route.query.hymnNo, suffix: route.query.suffix })
      },
    ],
  });
