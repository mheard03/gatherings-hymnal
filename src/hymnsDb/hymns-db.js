import { h } from 'vue';
import HymnalBuilder from './hymnal-builder.js';

let dummyHelperOptions = { id: "hymnsDb", obj: { functions: ["add", "awaitReady"] } }
let helperOptions = [
  { id: "hymnals", obj: HymnalBuilder },
  { id: "hymns", obj: HymnalBuilder, dependsOn: ["hymnals"] },
];
let helperAndSelfOptions = [dummyHelperOptions, ...helperOptions];
helperAndSelfOptions.forEach(h => h.dependsOn = [dummyHelperOptions.id, ...(h.dependsOn || [])]);

class HymnsDb {
  constructor() {
    // Build helper objects
    let helpers = helperAndSelfOptions.reduce((helpers, options) => {
      let helper = Object.assign({ ready: getExposedPromise() }, options);
      helper.dependsOn = helper.dependsOn.map(id => id);
      helpers[options.id] = helper;
      return helpers;
    }, {});
    Object.values(helpers).forEach(h => h.dependsOn = h.dependsOn.map(id => helpers[id]));

    this.promises = Object.values(helpers).reduce((promises, helper) => {
      promises[helper.id] = helper.ready;
      return promises;
    }, {});

    for (let helper of Object.values(helpers)) {
      // if any precedent rejects, this helper rejects
      let precedentPromise = Promise.all(helper.dependsOn.map(h => h.ready));
      precedentPromise.catch(r => helper.ready.reject(r));

      // when precedents are ready, run this helper's build function and resolve/reject accordingly
      let fnBuild = helper.obj.build || (() => true);
      let buildPromise = precedentPromise.then(() => fnBuild(this));
      buildPromise.then(() => helper.ready.resolve());
      buildPromise.catch(r => helper.ready.reject(r));
    } 

    // Kick the whole thing off by resolving hymnsDb;
    let pause = new Promise(r => setTimeout(r, 1000));
    pause.then(() => this.promises[dummyHelperOptions.id].resolve());
  }

  async add(a, b) {
    await new Promise(r => setTimeout(r, 1000));
    return a + b;
  }

  async awaitReady(helperId) {
    await this.promises[helperId];
  }

  static get helperFunctions() {
    return helperAndSelfOptions.map(o => ({
      helperId: o.id, 
      functionNames: (o.obj.functions || [])
    }));
  }
}

function getExposedPromise() {
  let resolve, reject;
  let promise = new Promise((fnResolve, fnReject) => {
    resolve = fnResolve;
    reject = fnReject;
  });
  Object.assign(promise, { resolve, reject });
  return promise;
}

export default HymnsDb;