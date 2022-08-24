import HymnsDbAbstract from './hymns-db-abstract.js';
import HymnalBuilder from './builders/hymnal-builder.js';
import HymnsBuilder from './builders/hymns-builder.js';
import HymnalSectionBuilder from './builders/hymnal-section-builder.js';

let dummyHelperOptions = { id: "hymnsDb", obj: { functions: ["awaitReady"] } }
let helperOptions = [
  { id: "hymnals", obj: HymnalBuilder },
  { id: "hymns", obj: HymnsBuilder, dependsOn: ["hymnals"] },
  { id: "hymnalSections", obj: HymnalSectionBuilder, dependsOn: ["hymnals", "hymns"] }
];
let helperAndSelfOptions = [dummyHelperOptions, ...helperOptions];
helperAndSelfOptions.forEach(h => h.dependsOn = [dummyHelperOptions.id, ...(h.dependsOn || [])]);

class HymnsDb extends HymnsDbAbstract {
  constructor() {
    super();

    // Build helper objects
    let helpers = helperAndSelfOptions.reduce((helpers, options) => {
      let helper = Object.assign({ ready: getExposedPromise() }, options);
      helper.dependsOn = helper.dependsOn.map(id => id);
      helpers[options.id] = helper;
      helper.ready.then(() => console.log("helper ready", options.id, options.obj.functions));
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
    let pause = new Promise(r => setTimeout(r, 0)); //5000));
    pause.then(() => this.promises[dummyHelperOptions.id].resolve());
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