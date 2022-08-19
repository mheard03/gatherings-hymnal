import { PWBWorker } from 'promise-worker-bi';
import HymnsDb from '@/hymnsDb/hymnsDb.js';

self.hymnsDb = new HymnsDb();

var promiseWorker = new PWBWorker();
async function messageHandler(message) {
  let functionName = message.fn || message;
  if (!functionName || typeof(functionName) != "string") {
    throw "hymnsDbWorker accepts messages in the format { fn: 'functionName', args: [ arguments, to, pass ] } or simply 'functionName'"
  }
  let fn = self.hymnsDb[functionName];
  let args = message.args || [];
  let result = await fn.apply(self.hymnsDb, args);
  return result;
}
promiseWorker.register(messageHandler);
