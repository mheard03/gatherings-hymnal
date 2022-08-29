import HymnsDbAbstract from '../hymns-db-abstract.js';
import { getMany as idbGet, setMany as idbSet } from 'idb-keyval';

let hymnArray;
let hymns;

class HymnsBuilder {
  static functions = ["getHymns", "getAllHymns"];

  static async build(hymnsDbInstance, router) {
    hymnArray = hymnArray || await loadHymnArray();
    hymns = hymns || buildHymnsObject();

    for (let hymn of hymns.values()) {
      let route = router.resolve({ name: 'hymn', query: { hymnal: hymn.hymnalId, hymnNo: hymn.hymnNo }, hash: ((hymn.suffix && hymn.suffix != 'A') ? `#${hymn.suffix}` : '') });
      hymn.url = route.href;
    }

    let hymnals = hymnsDbInstance.getHymnals();
    for (let hymnal of hymnals.values()) {
      getHymns(hymnal.hymnalId).forEach(h => h.hymnal = hymnal);
    }

    hymnsDbInstance.getHymns = getHymns;
    hymnsDbInstance.getAllHymns = function() {
      return hymns;
    };
  }
}


// https://vitejs.dev/guide/assets.html#new-url-url-import-meta-url
let arrayUrl = new URL("../../assets/hymns-db-generated.json", import.meta.url);
let versionUrl = new URL("../../assets/hymns-db-version.txt", import.meta.url);

async function loadHymnArray() {
  const arrayAbortController = new AbortController();
  const [ cachedVersion, cachedArrayString ] = await idbGet([versionUrl.toString(), arrayUrl.toString()]);
  async function storeText(version, arrayString) {
    await idbSet([
      [versionUrl.toString(), version],
      [arrayUrl.toString(), arrayString]
    ]);
    console.log('stored hymnsArray version', version);
  }
  
  let fetchedVersionPromise = fetchString(versionUrl, undefined, 2);
  fetchedVersionPromise.catch(e => console.log("Error fetching hymns version", e));

  let fetchedArrayPromise = fetchString(arrayUrl, { signal: arrayAbortController.signal }, 2);
  fetchedArrayPromise.catch(e => console.log("Error fetching hymns array", e));

  let resultPromise = getExposedPromise();

  if (!cachedVersion || !cachedArrayString) {
    let fetchedArrayString = await fetchedArrayPromise;
    resultPromise.resolve(JSON.parse(fetchedArrayString));

    fetchedVersionPromise.then(fetchedVersion => storeText(fetchedVersion, fetchedArrayString));
  }
  else {
    let cachedArray;
    try {
      cachedArray = JSON.parse(cachedArrayString);
      cachedArray = (Array.isArray(cachedArray) && cachedArray.length) ? cachedArray : undefined;
    }
    catch {}

    fetchedVersionPromise.then(fetchedVersion => {
      if (cachedArray && fetchedVersion == cachedVersion) {
        arrayAbortController.abort();
        console.log('returned cachedArray');
        resultPromise.resolve(cachedArray);
      }
    });
    fetchedArrayPromise.then(fetchedArrayString => {
      if (arrayAbortController.signal.aborted) {
        console.log('aborted fetchArray');
        return;
      }
      console.log('returned fetchedArray');
      resultPromise.resolve(JSON.parse(fetchedArrayString));
    }).catch(e => {
      if (cachedArray) {
        console.log('Error parsing fetched hymns array; returning cached version', e);
        resultPromise.resolve(cachedArray);
      }
      else {
        resultPromise.reject(e);
      }
    });
  }
  return await resultPromise;
}

async function fetchString(url, options, retryCount) {
  retryCount = retryCount || 0;
  try {
    let response = await fetch(url, options);
    if (!response.ok) {
      if (retryCount > 0) {
        await new Promise(r => setTimeout(r, Math.max(100, 1000 / retryCount)));
        return await fetchString(url, options, retryCount - 1);
      }
      throw new Error("Unable to fetch", url.toString(), response.status, response.statusText);
    }
    return await response.text();
  }
  catch (e) {
    if (e.name == "AbortError") return "";
    throw e;
  }
}


function buildHymnsObject() {
  hymns = new Map();

  for (let hymn of hymnArray) {
    // Populate metadata
    let idComponents = hymn.hymnId.split("-");
    hymn.hymnalId = idComponents[0];
    hymn.hymnNo = parseInt(idComponents[1]);
    if (idComponents[2]) hymn.suffix = idComponents[2];
    hymn.hymnNoTxt = hymn.hymnNo.toString() + (hymn.suffix || "");
    delete hymn.modifiedDate;

    // Add to hymns object
    hymns.set(hymn.hymnId, hymn);
  }

  // Find gaps and fill with stubs
  for (let hymn of hymns.values()) {
    if (hymn.isStub) continue;

    let hymnPlusOne = findHymnPlusN(hymn, 1);
    if (hymnPlusOne) continue;

    let hymnPlusTwo = findHymnPlusN(hymn, 2);
    if (!hymnPlusTwo) continue;
  
    let stubHymnNo = `${(hymn.hymnNo + 1).toString() + (hymn.suffix || "")}`;
    hymn.hymnNoTxt = `${hymn.hymnNoTxt}/${stubHymnNo}`;

    let stubHymnId = `${hymn.hymnalId}-${stubHymnNo}`;
    hymns.set(stubHymnId, {
      hymnId: stubHymnId,
      hymnal: hymn.hymnalId,
      hymnNo: hymn.hymnNo + 1,
      hymnNoTxt: hymn.hymnNoTxt,
      suffix: hymn.suffix,
      title: hymn.title,
      isStub: true
    });
  }

  return hymns;
}

function findHymnPlusN(hymn, n) {
  let hymnNoPlusN = hymn.hymnNo + n;
  let likelyId = `${hymn.hymnalId}-${hymnNoPlusN}`;
  let hymnPlusN = hymns[likelyId];
  if (!hymnPlusN) hymnPlusN = hymnArray.find(h => h.hymnalId == hymn.hymnalId && h.hymnNo == hymnNoPlusN);
  return hymnPlusN;
}

function getHymns() {
  let params = [];
  for (let arg of [...arguments].filter(a => a)) {
    if (typeof(arg) == "number") {
      params.push(arg);
    }
    else if (typeof(arg) == "string") {
      let intArg = parseInt(arg);
      if (intArg.toString() == arg) {
        params.push(intArg);
      }
      else {
        params.push(arg);
      }
    }
  }
  
  let results = [...hymns.values()];
  for (let param of params) {
    results = results.filter(h => h.hymnalId == param || h.hymnNo == param || h.suffix == param);
  }
  results.sort(HymnsDbAbstract.hymnCompare);
  return results;
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

export default HymnsBuilder;