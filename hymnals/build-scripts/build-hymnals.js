//
// Run manually in the terminal using "node ./hymnals/build-scripts/build-hymnals.js"
// Runs automatically when...

const fs = require('fs');
const jsdom = require('jsdom');
const JSDOM = jsdom.JSDOM;
const hymnalRoot = './hymnals/';

const STATUS_ERROR = -1;
const STATUS_SKIP = 1;
const STATUS_UPSERT = 2;
const STATUS_DELETE = 3;

readAllHymnals();

async function readAllHymnals() {
  let folderNames = fs
    .readdirSync(hymnalRoot, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  let results = [];
  for (let folder of folderNames) {
    let folderHymns = await readHymnal(folder);
    if (folderHymns.length) results = results.concat(folderHymns);
  }
  console.log(results);
  return results;
}

async function readHymnal(hymnalName) {
  let hymnalFolder = `${hymnalRoot}${hymnalName}`;

  let files = fs
    .readdirSync(hymnalFolder, { withFileTypes: true })
    .filter((f) => f.isFile())
    .map((f) => f.name)
    .filter((fn) => /[\d]+\.html/gi.test(fn));

  files.sort((a, b) => parseInt(a) - parseInt(b));

  let hymns = [];
  for (let fileName of files) {
    let path = `${hymnalFolder}/${fileName}`;
    let hymnId = `${hymnalName}-${parseInt(fileName)}`;
    try {
      let fileHymns = await readHymnsFromFile(path, hymnId);
      hymns = hymns.concat(fileHymns);
    } catch (e) {
      hymns.push({
        hymnId,
        exception: e,
      });
    }
  }

  return hymns;
}

async function readHymnsFromFile(fileName, hymnIdBase) {
  const { modifiedDate, textContent } = await readFile(fileName);
  const { document } = new JSDOM(textContent).window;

  let sections = [...document.querySelectorAll('main > section')];
  if (sections.length == 0) {
    sections = [document.querySelector('main')];
  }

  let hymns = [];
  for (let i = 0; i < sections.length; i++) {
    let hymn = {};
    if (hymnIdBase) {
      hymn.hymnId = hymnIdBase;
      if (sections.length > 1) hymn.hymnId += '-' + String.fromCharCode(65 + i);
    }
    Object.assign(hymn, readHymnContentFromElement(sections[i]));
    hymn.modifiedDate = modifiedDate;
    hymns.push(hymn);
  }
  return hymns;
}

function readHymnContentFromElement(element) {
  let children = [...element.children];

  let hymnContent = {};
  if (element.className) hymnContent.special = element.className;

  let h1 = children.find((e) => e.tagName == 'H1');
  hymnContent.title = h1.innerHTML;

  hymnContent.lines = children
    .filter((e) => e.tagName == 'P')
    .map((p) => {
      return {
        type: p.className,
        html: p.innerHTML.trim(),
      };
    });
  console.log(hymnContent.lines);
  return hymnContent;
}

async function readFile(fileName) {
  let file, modifiedDate, textContent, fileException;

  try {
    file = await fs.promises.open(fileName, 'r');
    const stat = await file.stat();
    modifiedDate = new Date(stat.mtime || stat.birthtime || 0);
    textContent = await file.readFile('utf-8');
  } catch (e) {
    fileException = e;
  } finally {
    await file.close();
  }

  if (fileException) throw e;
  return { modifiedDate, textContent };
}

/*
function buildHymnals() {
  let path = './hymnals/missions/1.html';
  console.log(path, fs.pathExistsSync(path));
  let contents = fs.readdirSync('./hymnals/missions/', { withFileTypes: true });
  console.log(JSON.stringify(contents.filter((d) => d.isFile())));
}
*/
