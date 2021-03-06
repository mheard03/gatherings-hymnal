import hymnArray from './hymns-db-generated.json';
import hymnalArray from './hymnals.json';
import attachSearchFunction from './hymns-db-search';

let hymns = {};

// Hydrate hymns
for (let hymn of hymnArray) {
  // Populate metadata
  let idComponents = hymn.hymnId.split("-");
  hymn.hymnal = idComponents[0];
  hymn.hymnNo = parseInt(idComponents[1]);
  if (idComponents[2]) hymn.suffix = idComponents[2];

  // Build clone function

  // Add to hymns object
  hymns[hymn.hymnId] = hymn;
}

// Find gaps
for (let hymn of Object.values(hymns)) {
  if (hymn.isStub) continue;

  let suffix = hymn.suffix || ""; 
  hymn.hymnNoTxt = hymn.hymnNo.toString() + suffix;

  let hymnPlusOne = findHymnPlusN(hymn, 1);
  if (hymnPlusOne) continue;

  let hymnPlusTwo = findHymnPlusN(hymn, 2);
  if (!hymnPlusTwo) continue;
 
  hymn.hymnNoTxt = `${hymn.hymnNoTxt}/${(hymn.hymnNo + 1).toString() + suffix}`;
  let stubHymnId = `${hymn.hymnal}-${hymn.hymnNo + 1}`;
  if (suffix) stubHymnId += `-${suffix}`;

  hymns[stubHymnId] = {
    hymnId: hymn.hymnId,
    hymnal: hymn.hymnal,
    hymnNo: hymn.hymnNo + 1,
    hymnNoTxt: hymn.hymnNoTxt,
    suffix: hymn.suffix,
    title: hymn.title,
    isStub: true
  }
}

attachSearchFunction(hymns);

function findHymnPlusN(hymn, n) {
  let hymnNoPlusN = hymn.hymnNo + n;
  let likelyId = `${hymn.hymnal}-${hymnNoPlusN}`;
  let hymnPlusN = hymns[likelyId];
  if (!hymnPlusN) hymnPlusN = hymnArray.find(h => h.hymnal == hymn.hymnal && h.hymnNo == hymnNoPlusN);
  return hymnPlusN;
}

// TODO: Refer to config instead
let hymnalOrder = [ "redbook", "supplement", "missions" ];
function hymnCompare(a,b) {
  let result = 0;
  if (result == 0) result = hymnalOrder.indexOf(a.hymnal) - hymnalOrder.indexOf(b.hymnal);
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
    results = results.filter(h => h.hymnal == param || h.hymnNo == param || h.suffix == param);
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

let hymnals = hymnalArray.reduce((obj, h) => {
  obj[h.hymnalId] = h
  return obj;
}, {})
Object.defineProperty(hymns, 'hymnals', {
  value: hymnals,
  configurable: false,
  enumerable: false
});


export default hymns;
export { hymns, hymnCompare }