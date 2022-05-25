// reads <main> content from #.html files and returns a .json database

const fs = require('fs');
const jsdom = require('jsdom');
const JSDOM = jsdom.JSDOM;

async function readAllHymnals(hymnalRoot = './hymnals/') {
  let folderNames = fs
    .readdirSync(hymnalRoot, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  let results = [];
  let promises = [];
  let i = 0;
  for (let folder of folderNames) {
    let promise = readHymnal(hymnalRoot, folder,).then((hymns) =>
      hymns.forEach((h) => results.push(h))
    );
    promises.push(promise);
    i++;
  }
  await Promise.all(promises);
  return results;
}

async function readHymnal(hymnalRoot, hymnalName, i) {
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
      let fileHymns = await readHymnsFromFile(path, hymnId, i);
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

async function readHymnsFromFile(fileName, hymnIdBase, i) {
  console.log(i);
  const { modifiedDate, textContent } = await readFile(fileName);
  const { document } = new JSDOM(textContent).window;

  if (!hymnIdBase) {
    let match = /\/([^\/]+)\/([\d]+)\.html/gi.exec(fileName);
    if (match) {
      hymnIdBase = `${match[1]}-${match[2]}`;
    }
  }

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

// exports.readAllHymnals = readAllHymnals;
// exports.readHymnsFromFile = readHymnsFromFile;
module.exports = { readAllHymnals, readHymnsFromFile };
