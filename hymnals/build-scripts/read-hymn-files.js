// reads <main> content from #.html files and returns a .json database

import fs from 'node:fs';
import readFile from './read-file';
import { JSDOM } from 'jsdom';

async function readAllHymnFiles(hymnalRoot = './hymnals/') {
  let folderNames = fs
    .readdirSync(hymnalRoot, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  let results = [];
  let promises = [];
  for (let folder of folderNames) {
    let promise = readHymnal(hymnalRoot, folder).then((hymns) =>
      hymns.forEach((h) => results.push(h))
    );
    promises.push(promise);
  }
  await Promise.all(promises);
  return results;
}

async function readHymnal(hymnalRoot, hymnalName) {
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
    let hymnFileId = `${hymnalName}-${parseInt(fileName)}`;
    try {
      let fileHymns = await readHymnFile(path, hymnFileId);
      hymns = hymns.concat(fileHymns);
    } catch (e) {
      hymns.push({
        hymnFileId,
        exception: e,
      });
    }
  }
  return hymns;
}

async function readHymnsFromFile(path, hymnFileId) {
  const hymnFile = await readHymnFile(path, hymnFileId);
  return hymnFile.hymns;
}

async function readHymnFile(path, hymnFileId) {
  const { modifiedDate, textContent } = await readFile(path);

  if (!hymnFileId) {
    let match = /\/([^\/]+)\/([\d]+)\.html/gi.exec(path);
    if (match) {
      hymnFileId = `${match[1]}-${match[2]}`;
    }
  }

  let hymnFile = { hymnFileId, modifiedDate, html: textContent };
  Object.defineProperty(hymnFile, 'hymns', {
    get() {
      const { document } = new JSDOM(hymnFile.html).window;
      let sections = [...document.querySelectorAll('main > section')];
      if (sections.length == 0) {
        sections = [document.querySelector('main')];
      }

      let hymns = [];
      for (let i = 0; i < sections.length; i++) {
        let hymn = {};
        try {
          if (hymnFileId) {
            hymn.hymnId = hymnFileId;
            if (sections.length > 1)
              hymn.hymnId += '-' + String.fromCharCode(65 + i);
          }
          hymn.modifiedDate = modifiedDate;
          Object.assign(hymn, readHymnContentFromElement(sections[i]));
          if (!hymn.lines) throw 'Hymn has no lines';
        } catch (e) {
          hymn.exception = e;
        }
        hymns.push(hymn);
      }

      delete hymnFile.hymns;
      hymnFile.hymns = hymns;
      return hymns;
    },
    enumerable: true,
    configurable: true,
  });
  return hymnFile;
}

function readHymnContentFromElement(element) {
  let children = [...element.children];

  let hymnContent = {};
  if (element.className) hymnContent.special = element.className;

  let h1 = children.find((e) => e.tagName == 'H1');
  hymnContent.title = h1 ? h1.innerHTML : undefined;

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

export { readAllHymnFiles, readHymnsFromFile };
