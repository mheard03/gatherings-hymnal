import { PWBHost } from "promise-worker-bi";
import hymnsDbWorker from '/hymns-db-worker.js?sharedworker';
import HymnsDb from './hymns-db.js';

const worker = new hymnsDbWorker();
const promiseWorker = new PWBHost(worker);

class HymnsDbClient {
  static {
    HymnsDbClient.addFunctions(...HymnsDb.clientFunctions);
    HymnsDbClient.addPromises(...HymnsDb.clientPromises);
  }
  
  static addFunctions() {
    [...arguments].forEach(arg => HymnsDbClient.addFunction(arg));
  }

  static addFunction(fn) {
    HymnsDbClient[fn] = async function() {
      let result = await promiseWorker.postMessage({ fn, args: [...arguments] });
      return result;
    }
  }

  static addPromises() {
    [...arguments].forEach(arg => HymnsDbClient.addPromise(arg));
  }

  static addPromise(promise) {
    HymnsDbClient[promise] = new Promise((resolve, reject) => {
      promiseWorker.postMessage({ promise })
        .then(r => resolve(r))
        .catch(r => reject(r));
    });
  }
}

export default HymnsDbClient;