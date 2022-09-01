import HymnsDbAbstract from './hymns-db-abstract.js';
import HymnalBuilder from './builders/hymnal-builder.js';
import HymnsBuilder from './builders/hymns-builder.js';
import HymnalSectionBuilder from './builders/hymnal-section-builder.js';
import SearchBuilder from './builders/search-builder.js';

// let router = createHeadlessRouter();
let forceDelayTimeout = 1000;

let objTypes = {};
[HymnalBuilder, HymnsBuilder, HymnalSectionBuilder, SearchBuilder].forEach(obj => objTypes[obj.name] = obj);
let helperOptions = HymnsDbAbstract.helperOptions;
for (let ho of helperOptions.filter(h => h.objType)) {
  ho.obj = objTypes[ho.objType];
};
let ownOptions = helperOptions.find(ho => ho.id == "hymnsDb")

class HymnsDb extends HymnsDbAbstract {
  constructor() {
    verifyEnvironment();
    console.log("Initializing HymnsDb");
    super();

    // Build helper objects
    let helpers = helperOptions.reduce((helpers, options) => {
      let helper = Object.assign({ ready: HymnsDbAbstract.getExposedPromise() }, options);
      helper.dependsOn = (helper.dependsOn || []).map(id => id);
      helpers[options.id] = helper;
      helper.ready.then(() => console.log("helper ready", options.id, 'functions', (options.obj || {}).functions));
      return helpers;
    }, {});
    Object.values(helpers).forEach(h => h.dependsOn = h.dependsOn.map(id => helpers[id]));

    this.promises = Object.values(helpers).reduce((promises, helper) => {
      promises[helper.id] = helper.ready;
      return promises;
    }, {});

    let forceDelay = () => new Promise(r => setTimeout(r, forceDelayTimeout));
    for (let helper of Object.values(helpers)) {
      // if any precedent rejects, this helper rejects
      let precedentPromise = Promise.all(helper.dependsOn.map(h => h.ready));
      precedentPromise.catch(r => helper.ready.reject(r));

      // when precedents are ready, run this helper's build function and resolve/reject accordingly
      let fnBuild = (helper.obj && helper.obj.build) ? helper.obj.build : (() => true);
      let buildPromise = precedentPromise.then(() => fnBuild(this));
      buildPromise.then(() => forceDelay()).then(() => helper.ready.resolve());
      buildPromise.catch(r => helper.ready.reject(r));
    } 

    // Kick the whole thing off by resolving hymnsDb;
    forceDelay().then(() => this.promises[ownOptions.id].resolve());
  }

  async awaitReady(helperId) {
    await this.promises[helperId];
  }
}

function verifyEnvironment() {
  try {
    if (self instanceof SharedWorkerGlobalScope) return true;
  }
  catch {
    let message = "Warning! HymnsDb instance created in main browser window. For performance reasons, HymnsDb should only be instantiated in a SharedWorker!";
    if (window) {
      console.warn(message);
    }
    else {
      throw new Error(message);
    }
  }
}

export default HymnsDb;