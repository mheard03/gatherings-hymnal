//
// Run manually in the terminal using "node ./hymnals/build-scripts/build-hymnals.js"
// Runs automatically when...

import fs from 'node:fs';
import * as hymnFileReader from './read-hymn-files';
import readFile from './read-file';
const hymnalRoot = './hymnals/';
const cachePath = './src/assets/hymns-db-data.json';
const versionPath = './src/assets/hymns-db-version.txt';

run();
async function run() {
  console.log('Loading hymns from HTML files and JSON cache...');
  let html = await hymnFileReader.readAllHymnFiles(hymnalRoot);

  let json = [];
  if (fs.existsSync(cachePath)) {
    try {
      let jsonFile = await readFile(cachePath);
      json = JSON.parse(jsonFile.textContent);
      for (let hymn of json) {
        hymn.modifiedDate = new Date(hymn.modifiedDate);
      }
    } catch (e) {
      console.log("Couldn't load existing JSON cache.", e);
    }
  }

  console.log('Comparing versions...');
  let cache = await buildUpdatedCache(html, json);
  if (cache) {
    let newJson = JSON.stringify(cache, null, ' ');
    await fs.promises.writeFile(cachePath, newJson);
  }
  if (cache || !fs.existsSync(versionPath)) {
    let ts = new Date();
    await fs.promises.writeFile(versionPath, ts.getTime().toString());
  }
}
  
export default run;

function buildUpdatedCache(html, json) {
  let compare = {};

  for (let hymnFile of html) {
    let hymnFileId = hymnFile.hymnFileId;
    let record = (compare[hymnFileId] = compare[hymnFileId] || {});
    record['html'] = hymnFile;
  }
  for (let hymn of json) {
    let hymnFileId = hymn.hymnId.split('-').slice(0, 2).join('-');
    let record = (compare[hymnFileId] = compare[hymnFileId] || {});
    let json = (record['json'] = record['json'] || {
      hymnFileId,
      modifiedDate: hymn.modifiedDate,
      hymns: [],
    });
    if (hymn.exception) json.exception = hymn.exception;
    json.hymns.push(hymn);
  }

  let cache = [];
  let upsertCount = 0;
  for (let pair of Object.values(compare).filter((p) => p.html)) {
    let selectedFile = pair.html;
    if (pair.json && pair.json.modifiedDate >= pair.html.modifiedDate) {
      // fresh json version exists
      if (!pair.json.exception) {
        // it's clean
        selectedFile = pair.json;
      } else if (pair.html.exception && pair.json.hymns.length > 0) {
        // it has an exception, but the html version is broken too, and at least the json copy has some verses
        // leave a note about the html file on the json object and use it anyway
        pair.json.exception = pair.html.exception;
        selectedFile = pair.json;
      }
    }

    if (selectedFile == pair.html) upsertCount++;

    if (selectedFile.hymns.length == 0) {
      // create an exception for content-less hymns
      selectedFile.exception = selectedFile.exception || 'No hymns found.';
      cache.push(selectedFile);
    } else {
      for (let hymn of selectedFile.hymns) {
        if (selectedFile.exception)
          hymn.exception = hymn.exception || selectedFile.exception;
        cache.push(hymn);
      }
    }
  }
  let exceptions = cache.filter((c) => c.exception);
  let exceptionsList = '';
  if (exceptions.length > 0)
    exceptionsList = ': ' + exceptions.map((e) => e.hymnId).join(', ');

  console.log(`  ${upsertCount} hymns created or updated from HTML.`);
  console.log(`  ${exceptions.length} hymns have issues.${exceptionsList}`);

  return (upsertCount >= 1) ? cache : undefined;
}