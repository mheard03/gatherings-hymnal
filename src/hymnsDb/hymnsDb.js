class HymnsDb {
  static {
    HymnsDb.STATUSES = {
      INIT: 1,
      LOADING: 2,
      PROCESSING: 3,
      READY: 4
    };
    Object.freeze(HymnsDb.STATUSES);

    HymnsDb.validStatusCodes = Object.values(HymnsDb.STATUSES);
    Object.freeze(HymnsDb.validStatusCodes);
  }

  constructor() {
    this.statusPromises = buildStatusProperty(this, 'status');
    this.searchStatusPromises = buildStatusProperty(this, 'searchStatus');   
    for (let propName in ["statusPromises", "searchStatusPromises"]) {
      Object.defineProperty(this, propName, { enumerable: false });
    }
    init(this);
  }

  getStatus() {
    return this.hymnsDbStatus;
  }
  async awaitStatus(statusCode) {
    if (this.hymnsDbStatus != statusCode) {
      await this.statusPromises[statusCode];
    }
    return this.hymnsDbStatus;
  }

  getSearchStatus() {
    return this.hymnsDbSearchStatus;
  }
  async awaitSearchStatus(statusCode) {
    if (this.hymnsDbSearchStatus != statusCode) {
      await this.searchStatusPromises[statusCode];
    }
    return this.hymnsDbSearchStatus;
  }
}

function failStatus(instance, messageOrException) {
  let ex = (messageOrException instanceof Error) ? messageOrException : new Error(messageOrException);
  let nextStatusCode = instance.status + 1;
  let nextStatusPromise = instance.statusPromises[nextStatusCode];
  if (nextStatusPromise) nextStatusPromise.reject(ex);
}
function failSearchStatus(instance, messageOrException) {
  let ex = (messageOrException instanceof Error) ? messageOrException : new Error(messageOrException);
  let nextStatusCode = instance.searchStatus + 1;
  let nextStatusPromise = instance.searchStatusPromises[nextStatusCode];
  if (nextStatusPromise) nextStatusPromise.reject(ex);
}

async function init(instance) {
  instance.status = HymnsDb.STATUSES.LOADING;
  instance.searchStatus = HymnsDb.STATUSES.LOADING;

  // Fetch hymns array
  try {
    instance.hymnArray = await fetchHymnArray();
  }
  catch (e) {
    failStatus(instance, e);
    failSearchStatus(instance, e);    
  }

  // Fetch hymns array
}

function buildStatusProperty(obj, propertyName) {
  let status = HymnsDb.STATUSES.INIT;
  const statusPromises = [];
  for (let status of Object.keys(HymnsDb.STATUSES)) {
    let statusCode = HymnsDb.STATUSES[status];
    let resolve, reject;
    let promise = new Promise((fnResolve, fnReject) => {
      resolve = fnResolve;
      reject = fnReject;
    });
    Object.assign(promise, { status, statusCode, resolve, reject});
    statusPromises[statusCode] = promise;
  }
  for (let statusCode of HymnsDb.validStatusCodes) {
    let promise = statusPromises[statusCode];
    let priorPromises = statusPromises.slice(0, statusCode).filter(s => s);
    priorPromises.forEach(p => promise.then(() => p.resolve()));
    
    let subsequentPromises = statusPromises.slice(statusCode + 1).filter(s => s);
    subsequentPromises.forEach(p => promise.catch(r => p.reject(r)));
  }

  Object.defineProperty(obj, propertyName, {
    get() {
      return status;
    },
    set(newValue) {
      if (!HymnsDb.validStatusCodes.includes(newValue)) throw `Tried to set illegal value for hymnsDbWorker.${propertyName}`;
      status = newValue;
      statusPromises[status].resolve();
    },
    enumerable: false
  });

  return statusPromises;
}


async function fetchHymnArray() {
  let doFetch = async url => {
    let response = await fetch(url);
    if (!response.ok) {
      throw new Error("Network response", response.status, response.statusText);
    }
    return await response.json();
  }

  let json;
  try {
    json = doFetch("src/assets/hymns-db-generated.json");

  }
  catch {
    json = doFetch("assets/hymns-db-generated.json");
  }
  return json;
}




export default HymnsDb;