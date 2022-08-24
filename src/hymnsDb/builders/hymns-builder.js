import HymnsDbAbstract from '../hymns-db-abstract.js';

let hymnArray;
let hymns;

class HymnsBuilder {
  static functions = ["getHymns"];

  static async build(hymnsDbInstance, router) {
    hymnArray = hymnArray || await fetchHymnArray();
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
  }
}

async function fetchHymnArray() {
  // https://vitejs.dev/guide/assets.html#new-url-url-import-meta-url
  let arrayUrl = new URL("../../assets/hymns-db-generated.json", import.meta.url);
  let response = await fetch(arrayUrl);
  if (!response.ok) {
    throw new Error("Unable to fetch", arrayUrl.toString(), response.status, response.statusText);
  }
  return await response.json();
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

export default HymnsBuilder;

/*
// Build hymns object
for (let hymn of hymnArray) {
  // Populate metadata
  let idComponents = hymn.hymnId.split("-");
  hymn.hymnalId = idComponents[0];
  hymn.hymnNo = parseInt(idComponents[1]);
  if (idComponents[2]) hymn.suffix = idComponents[2];

  // Add to hymns object
  hymns[hymn.hymnId] = hymn;
}

// Find gaps and fill with stubs
for (let hymn of Object.values(hymns)) {
  if (hymn.isStub) continue;

  let suffix = hymn.suffix || ""; 
  hymn.hymnNoTxt = hymn.hymnNo.toString() + suffix;

  let hymnPlusOne = findHymnPlusN(hymn, 1);
  if (hymnPlusOne) continue;

  let hymnPlusTwo = findHymnPlusN(hymn, 2);
  if (!hymnPlusTwo) continue;
 
  hymn.hymnNoTxt = `${hymn.hymnNoTxt}/${(hymn.hymnNo + 1).toString() + suffix}`;
  let stubHymnId = `${hymn.hymnalId}-${hymn.hymnNo + 1}`;
  if (suffix) stubHymnId += `-${suffix}`;

  hymns[stubHymnId] = {
    hymnId: stubHymnId,
    hymnal: hymn.hymnalId,
    hymnNo: hymn.hymnNo + 1,
    hymnNoTxt: hymn.hymnNoTxt,
    suffix: hymn.suffix,
    title: hymn.title,
    isStub: true
  }
}

// Build hymnals object
let hymnals = hymnalArray.reduce((obj, h) => {
  obj[h.hymnalId] = h
  return obj;
}, {});

for (let hymnal of Object.values(hymnals)) {
  getHymns(hymnal.hymnalId).forEach(h => h.hymnal = hymnal);
  for (let section of hymnal.sections || []) {
    applySectionHeaders(hymnal.hymnalId, section);
  }
}

function applySectionHeaders(hymnalId, section, parentHeadings) {
  parentHeadings = parentHeadings || [];
  
  if (section.range) {
    for (let i = section.range[0]; i <= section.range[1]; i++) {
      for (let hymn of getHymns(hymnalId, i)) {
        hymn.sectionHeaders = [...parentHeadings, section.name];
      }
    }
  }
  for (let childSection of section.children || []) {
    applySectionHeaders(hymnalId, childSection, [...parentHeadings, section.name]);
  }
}


// Attach search functions
attachSearchFunction(hymns);


function findHymnPlusN(hymn, n) {
  let hymnNoPlusN = hymn.hymnNo + n;
  let likelyId = `${hymn.hymnalId}-${hymnNoPlusN}`;
  let hymnPlusN = hymns[likelyId];
  if (!hymnPlusN) hymnPlusN = hymnArray.find(h => h.hymnalId == hymn.hymnalId && h.hymnNo == hymnNoPlusN);
  return hymnPlusN;
}

function hymnCompare(a,b) {
  let result = 0;
  if (result == 0 && a.hymnal && b.hymnal) result = a.hymnal.priority - b.hymnal.priority;
  if (result == 0) result = a.hymnNo - b.hymnNo;
  if (result == 0) result = a.hymnNoTxt - b.hymnNoTxt;
  if (result == 0) result = a.suffix - b.suffix;
  return result;
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

  let results = Object.values(hymns);
  for (let param of params) {
    results = results.filter(h => h.hymnalId == param || h.hymnNo == param || h.suffix == param);
  }
  results.sort(hymnCompare);
  return results;
}

Object.defineProperty(hymns, 'getHymns', {
  value: getHymns,
  writable: false,
  configurable: false,
  enumerable: false
});

Object.defineProperty(hymns, 'length', {
  get() {
    return Object.values(this).length;
  },
  configurable: false,
  enumerable: false
});

Object.defineProperty(hymns, 'hymnals', {
  value: hymnals,
  configurable: false,
  enumerable: false
});

hymns.cacheRoutes = function(router) {
  let allHymns = Object.values(hymns).filter(h => h.hymnId);
  for (let hymn of allHymns) {
    let route = router.resolve({ name: 'hymn', query: { hymnal: hymn.hymnalId, hymnNo: hymn.hymnNo }, hash: ((hymn.suffix && hymn.suffix != 'A') ? `#${hymn.suffix}` : '') });
    hymn.url = route.href;
  }
}
*/