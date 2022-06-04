import hymnArray from './hymns-db-generated.json';

let hymns = {};
const collator = new Intl.Collator('en', { sensitivity: "base", ignorePunctuation: true });

for (let hymn of hymnArray) {
  let idComponents = hymn.hymnId.split("-");
  hymn.hymnal = idComponents[0];
  hymn.hymnNo = parseInt(idComponents[1]);
  if (idComponents[2]) hymn.suffix = idComponents[2];
  
  let lines = hymn.lines
    .filter(l => l.type != "copyright")
    .map(l => Object.assign({}, l));

  hymn.searchLines = {};
  
  let mainLines = lines.filter(l => l.type != "chorus").map(l => getInnerText(l.html));
  Object.assign(hymn.searchLines, linesToProps("verse", mainLines));

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

function linesToProps(key, lines) {
  let result = {};
  lines.forEach((line, i) => {
    let propName = key + i.toString().padStart(2, '0');
    result[propName] = line;
  })
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

function findHymnPlusN(hymn, n) {
  let hymnNoPlusN = hymn.hymnNo + n;
  let likelyId = `${hymn.hymnal}-${hymnNoPlusN}`;
  let hymnPlusN = hymns[likelyId];
  if (!hymnPlusN) hymnPlusN = hymnArray.find(h => h.hymnal == hymn.hymnal && h.hymnId == hymnNoPlusN);
  return hymnPlusN;
}

// TODO: Refer to config instead
let hymnalOrder = [ "redbook", "supplement", "missions" ];
function hymnCompare(a,b) {
  let result = 0;
  if (result == 0) result = hymnalOrder.indexOf(a.hymnal) - hymnalOrder.indexOf(b.hymnal);
  if (result == 0) result = a.hymnNo - b.hymnNo;
  return result;
}

export default hymns;
export { hymns, hymnCompare }