class Status {
  static {
    Status.CODES = {
      INIT: 1,
      LOADING: 2,
      PROCESSING: 3,
      READY: 4
    };
    Object.freeze(Status.CODES);

    Status.validStatusCodes = Object.values(Status.CODES);
    Object.freeze(Status.validStatusCodes);
  }

  constructor() {
    Object.defineProperty(this, "_code", { enumerable: false, value: Status.CODES.INIT });

    // Create status promises
    this.promises = [];
    for (let statusCode of Object.values(Status.CODES)) {
      let promise = getExposedPromise();
      promise.statusCode = statusCode;
      this.promises[statusCode] = promise;
    }

    // Wire up automatic resolution/failure
    for (let statusCode of Status.validStatusCodes) {
      let statusPromise = this.promises[statusCode];
      
      // If any status promise rejects, they all reject
      this.promises.filter(p => p).forEach(p => statusPromise.catch(r => p.reject(r)));

      // If any status promise resolves, all prior status promises resolve
      let priorPromises = this.promises.slice(0, statusCode).filter(s => s);
      priorPromises.forEach(p => statusPromise.then(() => p.resolve(this.code)));
    }

    
  }

  // Reject next status
  fail(messageOrException) {
    let ex = messageOrException; //(messageOrException instanceof Error) ? messageOrException : new Error(messageOrException);
    let nextStatusCode = this.code + 1;
    let nextStatusPromise = this.promises[nextStatusCode];
    if (nextStatusPromise) nextStatusPromise.reject(ex);
  }
  
  // Getter/setter for status code
  get code() {
    return this._code;
  }
  set code(newValue) {
    if (!Status.validStatusCodes.includes(newValue)) throw `Tried to set illegal status value`;
    if (statusObj.statusCode > newValue) throw `Tried to revert status`;
    this._code = newValue;
    this.promises[statusCode].resolve(this.code);
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


export default Status;