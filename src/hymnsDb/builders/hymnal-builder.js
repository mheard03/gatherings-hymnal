import hymnalArray from '@/assets/hymnals.json';

let hymnals = hymnalArray.reduce((map, h) => {
  map.set(h.hymnalId, h);
  return map;
}, new Map());

class HymnalBuilder {
  static async build(hymnsDbInstance) {   
    hymnsDbInstance["getHymnals"] = function() {
      return hymnals;
    };
    hymnsDbInstance["getHymnal"] = function(hymnalId) {
      return hymnals.get(hymnalId);
    };
    hymnsDbInstance["cacheHymnalUrls"] = function(hymnalUrls) {
      for (let hymnal of hymnals.values()) {
        hymnal.url = hymnalUrls.get(hymnal.hymnalId);
      }
    }
  }
}

export default HymnalBuilder;