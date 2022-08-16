import lunr from 'lunr'
import normalizeToAscii from './normalizeToAscii.js';

/* Overridable tokenizer  ---------------------------------------------------------------------- */
lunr._standardTokenizer = lunr._standardTokenizer || lunr.tokenizer;
lunr._customTokenizer = undefined;
Object.defineProperty(lunr, 'tokenizer', {
  get() {
    return lunr._customTokenizer || lunr._standardTokenizer;
  },
  set(value) {
    lunr._customTokenizer = value;
    lunr._customTokenizer.separator = value.separator || lunr._standardTokenizer.separator;
  },
  enumerable: true
});

let endsWithClauseMarkerRegex = /([:;!?\.]+|[^\w\-]+[\-]+|[\-]{2,})[\s]*$/;
let startsWithClauseMarkerRegex = /^[\s]*([:;!?\.]+|[\-]+[^\w\-]+|[\-]{2,})/;

/* the tokenizer  ------------------------------------------------------------------------------ */
// Based on https://lunrjs.com/docs/tokenizer.js.html
function hymnalTokenizer(obj, metadata) {
  if (Array.isArray(obj)) return lunr._standardTokenizer(obj, metadata);
  if (obj == null || typeof(obj) == 'undefined') return [];

  let str = obj.toString().toLocaleLowerCase();
  str = normalizeToAscii(str);
  let singleTokens = lunr._standardTokenizer(str, metadata);

  if (singleTokens.length < 2) return singleTokens[0];

  for (let token of singleTokens) {
    if (token.metadata.position) {
      let startIndex = token.metadata.position[0];
      let endIndex = startIndex + token.metadata.position[1];

      let textBeforeToken = str.slice(0, Math.max(0, startIndex - 1));
      token.metadata.isClauseStart = endsWithClauseMarkerRegex.test(textBeforeToken);
      
      let textAfterToken = str.slice(endIndex + 1);
      token.metadata.isClauseEnd = startsWithClauseMarkerRegex.test(textAfterToken);
    }
  }

  return [...singleTokens, ...getPhrases(singleTokens, metadata)];
}
hymnalTokenizer.maxPhraseLength ||= 3;

function getPhrases(tokens, metadata) {
  let phraseSet = [];
  let maxLength = Math.min(hymnalTokenizer.maxPhraseLength, tokens.length);

  for (let phraseLength = 2; phraseLength <= maxLength; phraseLength++) {
    for (let i = 0; i <= tokens.length - phraseLength; i++) {
      let tokensInPhrase = tokens.slice(i, i + phraseLength);
      phraseSet.push(getPhraseToken(tokensInPhrase, metadata));
    }
  }

  // remove phrases that include a clause break
  phraseSet = phraseSet.filter(phrase => {
    let tokensInPhrase = phrase.metadata.sourceTokens;
    if (tokensInPhrase.at(0).metadata.isClauseEnd) return false;
    if (tokensInPhrase.at(-1).metadata.isClauseStart) return false;
    if (tokensInPhrase.slice(1,-1).some(t => t.metadata.isClauseStart || t.metadata.isClauseEnd)) return false;
    return true;
  });

  return phraseSet;
}

// Convert an array of tokens to a token representing the combined phrase
function getPhraseToken(tokens, metadata) {
  if (tokens.length == 0) return;
  if (tokens.length == 1) return tokens[0];

  tokens.sort((a,b) => { 
    let result = a.metadata.position[0] - b.metadata.position[0];
    result = result || (a.metadata.position[1] + b.metadata.position[1]);
    return result;
  });
  let firstToken = tokens.at(0);
  let lastToken = tokens.at(-1);

  let mergedText = tokens.map(t => t.str).join(" ");

  let mergedMetadata = lunr.utils.clone(metadata) || {};
  mergedMetadata.phrase = true;
  mergedMetadata.sourceTokens = tokens;
  if (typeof(firstToken.metadata.index) == "number") {
    mergedMetadata.index = firstToken.metadata.index;
  }
  if (firstToken.metadata.position) {
    mergedMetadata.position = [];
    mergedMetadata.position[0] = firstToken.metadata.position[0];

    let lastIndex = lastToken.metadata.position[0] + lastToken.metadata.position[1];
    mergedMetadata.position[1] = lastIndex - firstToken.metadata.position[0];
  }

  return new lunr.Token(mergedText, mergedMetadata);
}

export default hymnalTokenizer;