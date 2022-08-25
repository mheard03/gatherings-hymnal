import { reactive } from "vue";
import { PWBHost } from "promise-worker-bi";
import hymnsDbWorker from '/hymns-db-worker.js?sharedworker';
import HymnsDbAbstract from './hymns-db-abstract.js';
import HymnsDb from './hymns-db.js';

const worker = new hymnsDbWorker();
const promiseWorker = new PWBHost(worker);

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
    let progressProps = HymnsDb.helperFunctions.map(h => h.progressProp).filter(h => h);
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
    for (let helperInfo of HymnsDb.helperFunctions) {
      let { helperId, functionNames, progressProp } = helperInfo;

      // wire up progress tracker, if requested
      if (progressProp) {        
        let readyPromise = promiseWorker.postMessage({ fn: "awaitReady", args: [ helperId ] });
        readyPromise.then(() => {
          let progressTracker = HymnsDbClient.progress[progressProp];
          progressTracker.status = STATES.READY
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
          if (!progressTracker || !progressTracker.status) {
            // console.log('HymnsDbClient', `waiting for worker.${fn} ready...`, performance.now());
            await promiseWorker.postMessage({ fn: "awaitReady", args: [ helperId ] });
          }
          // console.log('HymnsDbClient', `calling worker.${fn}(${[...arguments]})...`, performance.now());
          let result = await promiseWorker.postMessage({ fn, args: [...arguments] });
          // console.log('HymnsDbClient', 'got result', performance.now(), result);
          return result;
        }
      }
    }
  }
}


export default HymnsDbClient;

let HymnsDbStates = HymnsDbClient.STATES;
export { HymnsDbClient, HymnsDbStates };