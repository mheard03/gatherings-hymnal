const helperOptions = [
  {
    id: "hymnsDb", 
    functionNames: ["awaitReady"]
  },
  {
    id: "hymnals",
    progressProp: "hymnals",
    functionNames: ["getHymnals", "getHymnal", "cacheHymnalUrls"],
    objType: "HymnalBuilder"
  },
  {
    id: "hymns",
    dependsOn: ["hymnals"],
    functionNames: ["getHymns", "getAllHymns", "cacheHymnUrls"],
    objType: "HymnsBuilder"
  },
  {
    id: "hymnalSections",
    progressProp: "hymns",
    functionNames: ["getHymnalSections"],
    dependsOn: ["hymnals", "hymns"],
    objType: "HymnalSectionBuilder"
  },
  {
    id: "search",
    progressProp: "search",
    functionNames: ["search"],
    dependsOn: ["hymns"], 
    objType: "SearchBuilder"
  }
];

class HymnsDbAbstract {
  static hymnCompare(a,b) {
    let result = 0;
    if (result == 0 && a.hymnal && b.hymnal) result = a.hymnal.priority - b.hymnal.priority;
    if (result == 0) result = a.hymnNo - b.hymnNo;
    if (result == 0) result = a.hymnNoTxt - b.hymnNoTxt;
    if (result == 0) result = a.suffix - b.suffix;
    return result;
  }

  static hymnCompareAlpha(a,b) {
    return a.title.localeCompare(b.title, undefined, { sensitivity: 'base' });
  }

  static get helperOptions() {
    return helperOptions;
  }
    
  static getExposedPromise() {
    let resolve, reject;
    let promise = new Promise((fnResolve, fnReject) => {
      resolve = fnResolve;
      reject = fnReject;
    });
    Object.assign(promise, { resolve, reject });
    return promise;
  }
}

export default HymnsDbAbstract;