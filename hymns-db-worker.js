import { PWBWorker } from 'promise-worker-bi';
import HymnsDb from '@/hymnsDb/hymns-db.js';

self.hymnsDb = new HymnsDb();

var promiseWorker = new PWBWorker();
async function messageHandler(message) {
  let functionName = message.fn;
  if (!functionName && typeof(message) == "string") functionName = message;

  if (!functionName) {
    let msg = "hymns-db-worker takes messages of the form { fn: functionName, args: [arguments, to, provide] }";
    throw new Error(msg);
  }

  let fn = self.hymnsDb[functionName];
  let args = message.args || [];
  // console.log('HymnsDbWorker', 'calling', fn.name, args);
  let result = await fn.apply(self.hymnsDb, args);
  // console.log('HymnsDbWorker', 'returning result', result);
  return result;
}
promiseWorker.register(messageHandler);
