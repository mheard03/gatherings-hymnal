const fs = require('fs');

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
    if (file) {
      await file.close();
    }
  }

  if (fileException) throw fileException;
  return { modifiedDate, textContent };
}

module.exports = { readFile };
