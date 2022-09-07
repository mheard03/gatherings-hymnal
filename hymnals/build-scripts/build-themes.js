// const fs = require('fs');
// const { readFile } = require('./read-file');
import * as materialColor from "../../src/utils/material-color-utilities";

run();
async function run() {
  console.log('materialColor', materialColor);
  return;
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
      console.log("Couldn't load existing JSON cache.");
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