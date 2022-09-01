import { reactive } from "vue";
import { createHeadlessRouter } from '@/router.js';
import { PWBHost } from "promise-worker-bi";
import HymnsDbAbstract from './hymns-db-abstract.js';

let promiseWorker;
try {
  throw "potato";
  let hymnsDbWorkerUrl = new URL('./hymns-db-worker.js', import.meta.url);
  const sharedWorker = new SharedWorker(hymnsDbWorkerUrl, { type: 'module' });
  promiseWorker = new PWBHost(sharedWorker);
  console.log("SharedWorker launched successfully.");
}
catch (e) {
  console.warn("Unable to launch shared worker; falling back");
  const HymnsDb = (await import('./hymns-db.js')).default;
  const hymnsDb = new HymnsDb();
  promiseWorker = {
    async postMessage(message) {
      let { fn, args } = message;
      
      fn = hymnsDb[fn];
      args = message.args || [];
      let result = await fn.apply(hymnsDb, args);
      return result;
    }
  }
}

let router = createHeadlessRouter();
let onReadyFunctions = {
  "hymnals": async function() {
    let hymnalUrls = new Map();
    let hymnals = await promiseWorker.postMessage({ fn: "getHymnals" });
    for (let hymnal of hymnals.values()) {
      let route = router.resolve({ name: 'hymnal', query: { hymnal: hymnal.hymnalId } });
      hymnalUrls.set(hymnal.hymnalId, route.href);
    }
    await promiseWorker.postMessage({ fn: "cacheHymnalUrls", args: [ hymnalUrls ] });
  },
  "hymns": async function() {
    let hymnUrls = new Map();
    let hymns = await promiseWorker.postMessage({ fn: "getHymns" });
    for (let hymn of hymns.values()) {
      let route = router.resolve({ name: 'hymn', query: { hymnal: hymn.hymnalId, hymnNo: hymn.hymnNo }, hash: ((hymn.suffix && hymn.suffix != 'A') ? `#${hymn.suffix}` : '') });
      hymnUrls.set(hymn.hymnId, route.href);
    }
    await promiseWorker.postMessage({ fn: "cacheHymnUrls", args: [ hymnUrls ] });
  }
}

class HymnsDbClient extends HymnsDbAbstract {
  static STATES = {
    ERROR: 0,
    LOADING: undefined,
    READY: 1,
  };

  static progress;

  static {
    // HymnsDbClient.STATES
    Object.freeze(HymnsDbClient.STATES);
    let STATES = HymnsDbClient.STATES;

    // HymnsDbClient.progress (initialization)
    let progressProps = HymnsDbAbstract.helperOptions.map(h => h.progressProp).filter(h => h);
    let progress = progressProps.reduce((obj, propName) => {
      obj[propName] = {
        status: STATES.LOADING,
        error: undefined,
        errorMessage: undefined
      };
      return obj;
    }, {});
    HymnsDbClient.progress = reactive(progress);


    // Process helpers
    for (let helperInfo of HymnsDbAbstract.helperOptions) {
      let { id, functionNames, progressProp } = helperInfo;
      let readyPromise = (async function() {
        await promiseWorker.postMessage({ fn: "awaitReady", args: [ id ] });
        let onReady = onReadyFunctions[id];
        if (onReady) await onReady();
      })();

      // wire up progress tracker, if requested
      if (progressProp) {        
        readyPromise.then(() => {
          let progressTracker = HymnsDbClient.progress[progressProp];
          progressTracker.status = STATES.READY;
        }).catch((ex) => {
          let progressTracker = HymnsDbClient.progress[progressProp];
          progressTracker.status = STATES.ERROR;
          if (progressTracker.error || progressTracker.errorMessage) return;

          if (typeof(ex) == "string" && ex.trim().length) {
            progressTracker.errorMessage = ex;
          }
          else {
            progressTracker.error = ex;
            if (ex instanceof Error) progressTracker.errorMessage = ex.toString();
          }
        });
      }

      // build an async HymnsDbClient function for each function specified by a helper; await ready, then call.
      for (let fn of functionNames) {
        HymnsDbClient[fn] = async function() {
          await readyPromise;
          let result = await promiseWorker.postMessage({ fn, args: [...arguments] });
          return result;
        }
      }
    }
  }
}


export default HymnsDbClient;

let HymnsDbStates = HymnsDbClient.STATES;
export { HymnsDbClient, HymnsDbStates };