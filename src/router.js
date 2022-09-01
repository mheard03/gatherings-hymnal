import {
  createRouter,
  createWebHistory,
  createMemoryHistory
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

let base = new URL("..", import.meta.url);
base = base.pathname;

// TODO: Make sure this works if the app is deployed somewhere other than the server root, lol
let routes = [
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
    props: route => ({ keywords: route.query.keywords, page: parseInt(route.query.page) || undefined })
  }
];

function createFullRouter() {
  let router = createRouter({
    routes,
    history: createWebHistory(base),
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
    }
  });
  router.backOrDefault = async function(fallbackRoute) {
    fallbackRoute = fallbackRoute || { name: 'home' };
    if (!history.state.back) {
      router.push(fallbackRoute);
    }
    else {
      router.go(-1);
    }
  }

  router.beforeResolve(enableInstantScroll);
  return router;
}

function createHeadlessRouter() {
  return createRouter({ 
    routes,
    history: createMemoryHistory(base)
  });
}

export default createFullRouter;
export { createFullRouter, createHeadlessRouter };