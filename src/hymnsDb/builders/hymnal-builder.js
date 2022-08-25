import hymnalArray from '@/assets/hymnals.json';

let hymnals = hymnalArray.reduce((map, h) => {
  map.set(h.hymnalId, h);
  return map;
}, new Map());

class HymnalBuilder {
  static functions = ["getHymnals"];

  static async build(hymnsDbInstance, router) {
    for (let hymnal of hymnals.values()) {
      let route = router.resolve({ name: 'hymnal', query: { hymnal: hymnal.hymnalId } });
      hymnal.url = route.href;
    }
    
    hymnsDbInstance.getHymnals = function() {
      return hymnals;
    };
  }
}

export default HymnalBuilder;