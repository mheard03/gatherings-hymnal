import HymnalBuilder from './hymnal-builder.js';

let helpers = [
  { obj: HymnalBuilder, onBuild: "hymnalsReady" }
];

class HymnsDb {
  constructor() {
    this.ready = getExposedPromise();
    this.hymnalsReady = getExposedPromise();
    this.hymnsReady = getExposedPromise();
    this.searchReady = getExposedPromise();

    this.hymnalsReady.catch(r => {
      r.hymnsReady.reject();
      r.searchReady.reject();
    });
    this.hymnsReady.catch(r => {
      r.searchReady.reject();
    });

    setTimeout(() => init(this), 50);
  }

  add(a, b) {
    return a + b;
  }

  static get clientFunctions() {
    let helperFunctions = helpers.flatMap(h => (h.obj.functions || []));
    return ["add", ...helperFunctions];
  }
  static get clientPromises() {
    let helperPromises = helpers.flatMap(h => (h.obj.promises || []));
    return ["ready", "hymnalsReady", "hymnsReady", "searchReady", ...helperPromises];
  }
}

async function init(instance) {
  this.ready.resolve();
  for (let helper of helpers) {
    let promise = instance[helper.onBuild] || new Promise(r => r);
    try {
      await helper.obj.build(instance);  
      promise.resolve();
    }
    catch (e) {
      promise.reject(e);
    }
  }
}

function getExposedPromise() {
  let resolve, reject;
  let promise = new Promise((fnResolve, fnReject) => {
    resolve = fnResolve;
    reject = fnReject;
  });
  Object.assign(promise, { resolve, reject });
  return promise;
}




/* Status helpers  -----------------------------------------------------------------------------
function buildStatusProperty(obj, propertyName) {
  const statusObj = {
    code: HymnsDb.STATUSCODES.INIT,
    promises: []
  };
  Object.defineProperty(statusObj, "promises", { enumerable: false });

  for (let statusCode of Object.values(HymnsDb.STATUSCODES)) {
    let resolve, reject;
    let promise = new Promise((fnResolve, fnReject) => {
      resolve = fnResolve;
      reject = fnReject;
    });
    Object.assign(promise, { statusCode, resolve, reject});
    statusObj.promises[statusCode] = promise;
  }
  for (let statusCode of HymnsDb.validStatusCodes) {
    let promise = statusObj.promises[statusCode];
    let priorPromises = statusObj.promises.slice(0, statusCode).filter(s => s);
    priorPromises.forEach(p => promise.then(() => p.resolve()));
    
    let subsequentPromises = statusObj.promises.slice(statusCode + 1).filter(s => s);
    subsequentPromises.forEach(p => promise.catch(r => p.reject(r)));
  }
  
  statusObj.fail = function (messageOrException) {
    let ex = (messageOrException instanceof Error) ? messageOrException : new Error(messageOrException);
    let nextStatusCode = statusObj.code + 1;
    let nextStatusPromise = statusObj.promises[nextStatusCode];
    if (nextStatusPromise) nextStatusPromise.reject(ex);
  }

  Object.defineProperty(obj, propertyName, {
    get() {
      return statusObj;
    },
    set(newValue) {
      if (!HymnsDb.validStatusCodes.includes(newValue)) throw `Tried to set illegal value for hymnsDbWorker.${propertyName}`;
      if (statusObj.statusCode > newValue) throw `Tried to revert hymnsDbWorker.${propertyName}`;
      statusCode = newValue;
      statusPromises[statusCode].resolve();
    },
    enumerable: false
  });
}
*/

export default HymnsDb;