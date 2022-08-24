import hymnalArray from '@/assets/hymnals.json';

let hymnals = hymnalArray.reduce((map, h) => {
  map.set(h.hymnalId, h);
  return map;
}, new Map());

class HymnalBuilder {
  static functions = ["getHymnals"];

  static async build(hymnsDbInstance) {
    hymnsDbInstance.getHymnals = function() {
      return hymnals;
    };
  }
}

export default HymnalBuilder;