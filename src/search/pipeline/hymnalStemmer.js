import lunr, { Token } from 'lunr'

lunr._standardStemmer = lunr._standardStemmer || lunr.stemmer;
lunr._customStemmer = undefined;
Object.defineProperty(lunr, 'stemmer', {
  get() {
    return lunr._customStemmer || lunr._standardStemmer;
  },
  set(value) {
    lunr._customStemmer = value;
  },
  enumerable: true
});

function hymnalStemmer(token) {
  if (!token || !token.str.length || !token.str.includes(" ")) {
    return lunr._standardStemmer(token);
  }

  token.metadata.sourceTokens = token.metadata.sourceTokens || token.str.split(" ").map(s => new lunr.Token(s, {}));

  return token.update(function (str, metadata) {
    let sourceTokens = metadata.sourceTokens;
    for (let token of sourceTokens) {
      if (!token.metadata.isStemmed) {
        lunr._standardStemmer(token);
        token.metadata.isStemmed = true;
      }
    }
    
    return sourceTokens.join(" ");
  });
}

export default hymnalStemmer;