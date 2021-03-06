import buildSearchIndex from './hymns-db-indexer.js';

let hymns = undefined;
let index = undefined;

function attachSearchFunction(hymnsObj) {
  hymns = hymnsObj;
  let hymnArray = Object.values(hymnsObj).filter(h => !h.isStub);
  Object.defineProperty(hymnsObj, 'search', {
    value: function() {
      index = index || buildSearchIndex(hymnArray);
      let rawResults = index.search(...arguments);
      let results = processSearchResults(rawResults);
      return results;
    }
  });
}

function processSearchResults(rawResults) {
  let processed = rawResults.map(r => invertSearchResult(r));
  for (let result of processed) {
    result.title = addHighlights(result.fields["title"]);
    result.preview = addHighlights(findPreviewField(result));
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
  return result.fields[selectedFieldId];
}

function addHighlights(fieldInfo) {
  let allMarkPositions = fieldInfo.keywords
    .flatMap(k => k.markPositions)
    .map(p => [p[0], p[0] + p[1]])
    .reduce((all, p) => {
      if (all.length == 0) return [p];

      let prev = all[all.length - 1]
      if (all[0] > prev[1]) {
        prev[1] = p[1];
      } else {
        all.push(p);
      }
      return all;
    }, [])

  let cursor = 0;
  let highlighted = "";
  for (let p of allMarkPositions) {
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