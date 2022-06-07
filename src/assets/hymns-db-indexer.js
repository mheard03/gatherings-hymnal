import lunr from 'lunr'
const collator = new Intl.Collator('en', { sensitivity: "base", ignorePunctuation: true });

let maxFieldCounts = {
  line: 0,
  chorus: 0
}
let maxLineCount = 0;
let maxChorusCount = 0;

function buildSearchIndex(hymnArray) {
  for (let hymn of hymnArray) {
    // Create indexable fields
    hymn.searchLines = {};

    let lines = hymn.lines
      .filter(l => l.type != "copyright")
      .map(l => Object.assign({}, l));
    
    let mainLines = lines.filter(l => l.type != "chorus").map(l => getInnerText(l.html));
    Object.assign(hymn.searchLines, linesToProps("line", mainLines));

    let chorusLines = lines.filter(l => l.type == "chorus").map(l => getInnerText(l.html));
    let uniqueChorusLines = chorusLines.reduce((uniques, txt) => {
      let existing = uniques.find(u => isSameText(u.txt, txt));
      if (existing) {
        existing.count++;
      } else {
        uniques.push({ txt, count: 1 });
      }
      return uniques;
    }, []);
    uniqueChorusLines.sort((a,b) => b.count - a.count);
    uniqueChorusLines = uniqueChorusLines.map(l => l.txt);
    Object.assign(hymn.searchLines, linesToProps("chorus", uniqueChorusLines));

    // Track longest field lines
    maxFieldCounts.line = Math.max(maxFieldCounts.line, mainLines.length);
    maxFieldCounts.chorus = Math.max(maxFieldCounts.chorus, uniqueChorusLines.length);
  }

  let searchIndex = lunr(function () {
    this.metadataWhitelist = ['position'];
    this.ref('hymnId');
    this.field('title', { boost: 3 });
    this.field('line00', { boost: 1.5 });
    this.field('chorus00', { boost: 2 });
  
    for (let fieldName of Object.keys(maxFieldCounts)) {
      for (let i = 1; i < maxFieldCounts[fieldName]; i++) {
        let suffix = i.toString().padStart(2, '0');
        this.field(fieldName + suffix);
      }
    }
  
    hymnArray.forEach(function (hymn) {
      let flattened = {}
      Object.assign(flattened, pick(hymn, ['hymnId', 'title']));
      Object.assign(flattened, hymn.searchLines);
      this.add(flattened)
    }, this)
  });

  return searchIndex;
}

function linesToProps(key, lines) {
  let result = {};
  lines.forEach((line, i) => {
    let propName = key + i.toString().padStart(2, '0');
    result[propName] = line;
  });

  return result;
}

function getInnerText(html) {
  if (!html) return html;

  let text = html;
  if (html.indexOf("<") >= 0) {
    let div = document.createElement("div");
    div.innerHTML = html;
    text = div.innerText;
  }
  text = text.replace(/[\s]+/g, " ").trim();
  return text;
}

function isSameText(a, b) {
  return collator.compare(a, b) == 0;
}

function pick(obj, keys) {
  return Object.keys(obj)
    .filter(k => keys.indexOf(k) >= 0)
    .reduce(function (clone, key) {
      clone[key] = obj[key];
      return clone;
  }, {});
}

export default buildSearchIndex;