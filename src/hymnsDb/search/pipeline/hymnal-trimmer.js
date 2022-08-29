import lunr from 'lunr'

lunr._standardTrimmer = lunr._standardTrimmer || lunr.trimmer;
lunr._customTrimmer = undefined;
Object.defineProperty(lunr, 'trimmer', {
  get() {
    return lunr._customTrimmer || lunr._standardTrimmer;
  },
  set(value) {
    lunr._customTrimmer = value;
  },
  enumerable: true
});

function hymnalTrimmer(token) {
  if (!token || !token.str.length || !token.str.includes(" ")) {
    return lunr._standardTrimmer(token);
  }

  token.metadata.sourceTokens = token.metadata.sourceTokens || token.str.split(" ").map(s => new lunr.Token(s, {}));

  return token.update(function (str, metadata) {
    let sourceTokens = metadata.sourceTokens;
    for (let token of sourceTokens) {
      if (!token.metadata.isTrimmed) {
        lunr._standardTrimmer(token);
        token.metadata.isTrimmed = true;
      }
    }
    
    return sourceTokens.map(t => t.str).filter(str => str).join(" ");
  });
}

export default hymnalTrimmer;