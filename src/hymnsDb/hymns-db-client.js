import { PWBHost } from "promise-worker-bi";
import hymnsDbWorker from '/hymns-db-worker.js?sharedworker';
import HymnsDb from './hymns-db.js';

const worker = new hymnsDbWorker();
const promiseWorker = new PWBHost(worker);

class HymnsDbClient {
  static {
    for (let { helperId, functionNames } of HymnsDb.helperFunctions) {
      for (let fn of functionNames) {
        HymnsDbClient[fn] = async function() {
          // console.log('HymnsDbClient', `waiting for worker.${fn} ready...`, performance.now());
          await promiseWorker.postMessage({ fn: "awaitReady", args: [ helperId ] });
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