import {
  createRouter,
  createWebHistory,
} from 'vue-router/dist/vue-router.esm-bundler';

export default () => {
  let router = createRouter({
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
        props: route => ({ hymnalId: route.query.hymnal, sort: route.query.sort })
      },
      {
        path: '/hymn.html',
        name: 'hymn',
        component: () => import('./views/Hymn.vue'),
        props: route => ({ hymnalId: route.query.hymnal, hymnNo: route.query.hymnNo, suffix: route.query.suffix })
      },
    ],
  });
  window.router = router;
  return router;
}