import {
  createRouter,
  createWebHistory,
} from 'vue-router/dist/vue-router.esm-bundler';

let instantScrollTimeout = 0;
function enableInstantScroll() {
  clearTimeout(instantScrollTimeout);
  document.scrollingElement.style.scrollBehavior = "auto";
  setTimeout(function() { 
    document.scrollingElement.style.scrollBehavior = "";
    instantScrollTimeout = 0;
  }, 500);
}

export default () => {
  let router = createRouter({
    history: createWebHistory(),
    routes: [
      {
        path: '/',
        component: () => import('./views/Home.vue'),
      },
      {
        path: '/index.html',
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
      {
        path: '/search.html',
        name: 'search',
        component: () => import('./views/SearchResults.vue'),
        props: route => ({ keywords: route.query.keywords })
      },
    ],
    scrollBehavior(to, from, savedPosition) {
      // console.log('scrollBehavior', to.fullPath, (from || {}).fullPath, savedPosition)
      if (savedPosition) {
        // console.log('savedPosition', savedPosition);
        return savedPosition;
      }
      if (to.hash) {
        // console.log('to.hash', to.hash)
        return { 
          el: to.hash
        }
      }
      else {
        // console.log('top 0')
        return { 
          top: 0
        }
      }
    },
  });
  
  router.beforeResolve(enableInstantScroll);
  return router;
}