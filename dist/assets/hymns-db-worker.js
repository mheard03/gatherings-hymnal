import { PWBWorker } from 'promise-worker-bi';
import HymnsDb from '@/hymnsDb/hymns-db.js';

let hymnsDbInstance = new HymnsDb();
self.hymnsDb = hymnsDbInstance;

async function messageHandler(message) {
  let functionName = message.fn;
  if (!functionName && typeof(message) == "string") functionName = message;

  if (!functionName) {
    let errorMessage = "hymns-db-worker: no function name specified";
    console.error(errorMessage, message);
    throw new Error(msg);
  }

  let fn = self.hymnsDb[functionName];
  let args = message.args || [];
  let result = await fn.apply(self.hymnsDb, args);
  return result;
}

const promiseWorker = new PWBWorker();
promiseWorker.register(messageHandler);

export default self;
export { hymnsDbInstance };