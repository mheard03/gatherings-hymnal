import lunr from 'lunr'
import hymnalTokenizer from '../search/hymnal-tokenizer.js';
import hymnalStemmer from '../search/pipeline/hymnal-stemmer.js';
import hymnalTrimmer from '../search/pipeline/hymnal-trimmer.js';
import blankKiller from '../search/pipeline/blank-killer.js';
import contractionFixer from '../search/pipeline/contraction-fixer.js';
import consoleLogger from '../search/pipeline/console-logger.js';

const MAX_PHRASE_LENGTH = 2;
const collator = new Intl.Collator('en', { sensitivity: "base", ignorePunctuation: true });

function buildSearchIndex(documents) {
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

  let docsArray = [...documents.values()];
  let fieldNames = [...new Set(docsArray.flatMap(d => Object.keys(d)))];
  fieldNames = fieldNames.filter(f => !["hymnId", "line00", "chorus00", "url"].includes(f));

  let searchIndex = lunr(function () {
    this.use(hymnalPlugin);

    this.metadataWhitelist = ['position'];
    this.ref('hymnId'); 
    this.field('title', { boost: 3 });
    this.field('line00', { boost: 1.5 });
    this.field('chorus00', { boost: 2 });
    fieldNames.forEach(f => this.field(f));
    docsArray.forEach(d => this.add(d));
  });

  return searchIndex;
}

function buildDocuments(hymns) {
  let documents = new Map();

  for (let hymn of hymns.values()) {
    if (hymn.isStub) continue;

    let doc = { 
      hymnId: hymn.hymnId, 
      title: hymn.title,
      url: hymn.url
    };

    // Array of content lines
    let lines = hymn.lines
      .filter(l => l.type != "copyright")
      .map(l => Object.assign({}, l));
    
    // Non-chorus lines in order as line00 - lineXX
    let mainLines = lines.filter(l => l.type != "chorus").map(l => getInnerText(l.html));
    Object.assign(doc, linesToProps("line", mainLines));

    // Unique chorus lines in order as chorus00 - chorusXX
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
    Object.assign(doc, linesToProps("chorus", uniqueChorusLines));

    documents.set(hymn.hymnId, doc);
  }
  return documents;
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

// Fix error on hot-reload
lunr.utils.warn = function (message) {
  if (console && console.warn) console.warn(message);
};

export { buildSearchIndex, buildDocuments };