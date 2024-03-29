import lunr from 'lunr'
import hymnalStemmer from './pipeline/hymnal-stemmer.js';
import hymnalTrimmer from './pipeline/hymnal-trimmer.js';
import blankKiller from './pipeline/blank-killer.js';
import hymnalTokenizer from './hymnal-tokenizer.js';
import contractionFixer from './pipeline/contraction-fixer.js';
import consoleLogger from './pipeline/console-logger.js';

const collator = new Intl.Collator('en', { sensitivity: "base", ignorePunctuation: true });
const MAX_PHRASE_LENGTH = 2;

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

  var hymnalPlugin = function (builder) {
    builder.tokenizer = hymnalTokenizer;
    builder.tokenizer.separator = /[\-\s,]/;
    builder.tokenizer.maxPhraseLength = MAX_PHRASE_LENGTH;

    lunr.Pipeline.registerFunction(hymnalTrimmer, 'hymnalTrimmer');
    lunr.Pipeline.registerFunction(contractionFixer, 'contractionFixer');
    lunr.Pipeline.registerFunction(hymnalStemmer, 'hymnalStemmer');
    lunr.Pipeline.registerFunction(blankKiller, 'blankKiller');
    lunr.Pipeline.registerFunction(consoleLogger, 'consoleLogger');
    
    builder.pipeline.reset();
    builder.pipeline.add(
      hymnalTrimmer,
      contractionFixer,
      lunr.stopWordFilter,
      hymnalStemmer,
      blankKiller
    );
    builder.searchPipeline.reset();
    builder.searchPipeline.add(
      hymnalTrimmer,
      contractionFixer,
      hymnalStemmer,
      // consoleLogger
    );
  }


  // Fix error on hot-reload
  lunr.utils.warn = function (message) {
    if (console && console.warn) console.warn(message);
  };

  let searchIndex = lunr(function () {
    this.use(hymnalPlugin);

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

  // Fix punctuation spacing
  text = text.replaceAll(/([,;:!\.\?])([^\s])/g, "$1 $2");

  // Remove double spaces and trim
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
export { buildSearchIndex, MAX_PHRASE_LENGTH };