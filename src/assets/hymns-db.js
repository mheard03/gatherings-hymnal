import hymnArray from './hymns-db-generated.json';

let hymns = {};
for (let hymn of hymnArray) {
  let idComponents = hymn.hymnId.split("-");
  hymn.hymnal = idComponents[0];
  hymn.hymnNo = parseInt(idComponents[1]);
  if (idComponents[2]) hymn.suffix = idComponents[2];
  
  let lines = hymn.lines
    .filter(l => l.type != "copyright")
    .map(l => Object.assign({}, l));
  let mainLines = lines.filter(l => l.type != "chorus").map(l => l.html);
  let chorusLines = lines.filter(l => l.type == "chorus").map(l => l.html);
  chorusLines = [...new Set(chorusLines)];
  
  hymn.searchLines = {};
  Object.assign(hymn.searchLines, linesToProps("verse", mainLines));
  Object.assign(hymn.searchLines, linesToProps("chorus", chorusLines));

  hymns[hymn.hymnId] = hymn;
}

function linesToProps(key, lines) {
  let result = {};
  for (let i = 0; i < lines.length; i++) {
    let propName = key + i.toString().padStart(2, '0');
    let div = document.createElement("div");
    div.innerHTML = lines[i];
    result[propName] = div.innerText;
  }
  return result;
}


export default hymns;