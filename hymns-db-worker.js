import { PWBWorker } from 'promise-worker-bi';
import HymnsDb from '@/hymnsDb/hymns-db.js';

self.hymnsDb = new HymnsDb();

var promiseWorker = new PWBWorker();
async function messageHandler(message) {
  let functionName = message.fn;
  let promiseName = message.promise;

  if (!functionName && !promiseName && !fieldName) {
    let msg = "hymns-db-worker takes messages of the form\n" + 
              "  { fn: functionName, args: [arguments, to, provide] } or" +
              "  { promise: promiseName }";
    throw new Error(msg);
  }

  if (functionName) {
    let fn = self.hymnsDb[functionName];
    let args = message.args || [];
    console.log('calling', fn.name, args);
    let result = await fn.apply(self.hymnsDb, args);
    console.log('result', result);
    return result;
  }

  if (promiseName) {
    let promise = self.hymnsDb[promiseName];
    console.log('awaiting', promiseName);
    let result = await promise;
    console.log('result', result);
    return result;
  }

  
}
promiseWorker.register(messageHandler);
