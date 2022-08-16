import normalizeToAscii from './normalizeToAscii.js';
import { buildSearchIndex, MAX_PHRASE_LENGTH } from './hymns-db-indexer.js';
import lunr from 'lunr';

let hymns = undefined;
let index = undefined;

function attachSearchFunction(hymnsObj) {
  hymns = hymnsObj;
  let hymnArray = Object.values(hymnsObj).filter(h => !h.isStub);
  if (hymnsObj.search) return;
  Object.defineProperty(hymnsObj, 'search', {
    value: function(queryString) {
      index = index || buildSearchIndex(hymnArray);
      window.index = index;

      let clauses = buildClauses(queryString);
      let rawResults = index.query(function (q) {
        clauses.forEach(c => q.term(c.term, c.options));
      });

      let results = processSearchResults(rawResults);
      return results;
    }
  });
}

function buildClauses(text) {
  text = normalizeToAscii(text).toLocaleLowerCase();

  // Thank you https://stackoverflow.com/questions/11456850/split-a-string-by-commas-but-ignore-commas-within-double-quotes-using-javascript
  let wordsAndPhrases = text.match(/[\-\+]?(".*?"|[^"\s]+)(?=\s*|\s*$)/g);
  wordsAndPhrases = wordsAndPhrases.map(wp => wp.replaceAll('"', ''));

  let baseClauses = [];
  for (let wop of wordsAndPhrases) {
    let clause = { options: {} };
    if (wop.startsWith("+")) clause.options.presence = lunr.Query.presence.REQUIRED;
    if (wop.startsWith("-")) clause.options.presence = lunr.Query.presence.PROHIBITED;
    
    wop = wop.replace(/^[\-\+]+/, "");
    clause.term = wop;
    
    let wordCount = (wop.match(/[\s]+/g) || []).length;  
    if (wordCount > 1) {
      clause.options.boost = 0.5 + Math.pow(1.1, wordCount - 1);
    }

    baseClauses.push(clause);
  }

  if (!lunr.tokenizer.maxPhraseLength || lunr.tokenizer.maxPhraseLength <= 1) return baseClauses;

  let clausesToChain = [];
  for (let phraseLength = 2; phraseLength <= lunr.tokenizer.maxPhraseLength; phraseLength++) {
    for (let i = 0; i <= baseClauses.length - phraseLength; i++) {
      clausesToChain.push(baseClauses.slice(i, i + phraseLength));
    }
  }
  clausesToChain = clausesToChain.filter(chain => { 
    if (chain.some(c => c.options.presence == lunr.Query.presence.PROHIBITED)) return false;
    if (chain.some(c => c.term.includes(" "))) return false;
    return true;
  });
  let chainedClauses = clausesToChain.map(chain => {
    let clause = { options: {} };
    let words = chain.map(c => c.term);
    
    clause.term = words.join(" ");
    clause.options.boost = Math.pow(1.1, words.length - 1);
    return clause;
  });

  let allClauses = [...baseClauses, ...chainedClauses];

  let uniqueTerms = [...new Set(allClauses.map(c => c.term))];
  let uniqueClauses = uniqueTerms.map(t => {
    let matchingClauses = allClauses.filter(c => c.term == t);
    if (matchingClauses.length == 1) return matchingClauses[0];

    let clauseWithPresence = matchingClauses.find(c => c.presence != lunr.Query.presence.OPTIONAL);
    if (clauseWithPresence) return clauseWithPresence;

    let maxScore = Math.max(...matchingClauses.map(c => c.options.boost || 1));
    return matchingClauses.find(c => (c.options.boost || 1) == maxScore);
  })
  return uniqueClauses;
}

function processSearchResults(rawResults) {
  let processed = rawResults.map(r => invertSearchResult(r));
  for (let result of processed) {
    result.title = addHighlights(result.fields["title"]);
    result.preview = addHighlights(findPreviewField(result));
    result.preview = result.preview || "No preview";
    delete result.fields;
  }
  return processed;
}

function invertSearchResult(rawResult) {
  let invertedResult = {
    score: rawResult.score,
    hymnId: rawResult.ref,
    fields: {}
  };
  
  let hymn = hymns[invertedResult.hymnId];
  let fieldIds = ['title', ...Object.keys(hymn.searchLines)];
  let md = rawResult.matchData.metadata;

  for (let fieldId of fieldIds) {
    let fieldInfo = {
      fieldId: fieldId,
      text: hymn.searchLines[fieldId] || hymn[fieldId],
      keywords: []
    };
    for (let keyword of Object.keys(md)) {
      if (md[keyword][fieldId]) {
        fieldInfo.keywords.push({
          keyword,
          markPositions: md[keyword][fieldId].position
        });
      }
    }
    invertedResult.fields[fieldId] = fieldInfo;
  }
  return invertedResult;
}

function findPreviewField(result) {
  let fieldInfos = Object.values(result.fields)
    .filter(f => f.fieldId.startsWith("chorus") || f.fieldId.startsWith("line"));

  for (let fieldInfo of fieldInfos) {
    let keywordCount = fieldInfo.keywords.length;
    let keywordMatchCount = fieldInfo.keywords
      .map(k => Math.min(k.markPositions.length, 9))
      .reduce((a,b) => a + b, 0);
    fieldInfo.keywordMatchScore = 100 * keywordCount + keywordMatchCount
  }  
  fieldInfos.sort((a,b) => b.keywordMatchScore - a.keywordMatchScore)

  let highScore = fieldInfos[0].keywordMatchScore;
  if (highScore == 0) return result.fields["line00"];
  let bestFieldInfos = fieldInfos.filter(f => f.keywordMatchScore == highScore);
  if (bestFieldInfos.length == 1) return bestFieldInfos[0];

  let selectedFieldId;
  let fieldIds = bestFieldInfos.map(m => m.fieldId);
  let verseMatches = fieldIds.filter(f => f.startsWith("line"));
  verseMatches.sort()
  let chorusMatches = fieldIds.filter(f => f.startsWith("chorus"));
  chorusMatches.sort();
  
  if (verseMatches[0] == "line00") {
    selectedFieldId = verseMatches[0];
  } else if (chorusMatches[0] == "chorus00") {
    selectedFieldId = chorusMatches[0];
  } else {
    selectedFieldId = verseMatches[0] || chorusMatches[0];
  }
  selectedFieldId = selectedFieldId || "line00";
  return result.fields[selectedFieldId];
}

function addHighlights(fieldInfo) {
  let allMarkPositions = fieldInfo.keywords
    .flatMap(k => k.markPositions)
    .map(p => [p[0], p[0] + p[1]]);
  allMarkPositions.sort((a,b) => a[0] - b[0]);

  let combinedMarkPositions = allMarkPositions.reduce((all, p) => {
      if (all.length == 0) return [p];

      let prev = all.at(-1);
      if (p[0] < prev[1]) {
        prev[1] = Math.max(p[1], prev[1]);
      } else {
        all.push(p);
      }
      return all;
    }, []);

  let cursor = 0;
  let highlighted = "";
  for (let p of combinedMarkPositions) {
    if (cursor < p[0]) {
      highlighted += fieldInfo.text.substring(cursor, p[0]);
    }
    highlighted += `<mark>${fieldInfo.text.substring(p[0], p[1])}</mark>`
    cursor = p[1];
  }
  highlighted += fieldInfo.text.substring(cursor);
  return highlighted;
}

export default attachSearchFunction;