import { PWBHost } from "promise-worker-bi";
import hymnsDbWorker from '/hymnsDbWorker.js?sharedworker';

const worker = new hymnsDbWorker();
const promiseWorker = new PWBHost(worker);

let apiFunctionNames = [ "getStatus", "awaitStatus", "getSearchStatus", "awaitSearchStatus" ];
class HymnsDbClient {
  constructor() {
    for (let fn of apiFunctionNames) {
      this[fn] = async function() {
        let result = await promiseWorker.postMessage({ fn, args: [...arguments] });
        return result;
      }
    }
  }
}

window.hymnsDbClient = new HymnsDbClient();

export default HymnsDbClient;