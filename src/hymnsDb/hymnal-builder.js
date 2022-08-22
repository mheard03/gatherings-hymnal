import hymnalArray from '@/assets/hymnals.json';

let hymnals = hymnalArray.reduce((obj, h) => {
  obj[h.hymnalId] = h
  return obj;
}, {});

class HymnalBuilder {
  static functions = ["getHymnals"];

  static build(hymnsDbInstance) {
    hymnsDbInstance.getHymnals = function() {
      return hymnals;
    };
  }
}

export default HymnalBuilder;