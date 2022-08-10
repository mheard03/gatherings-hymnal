/* well-known contractions  -------------------------------------------------------------------- */
// When encountered, we'll just remove the apostrophe
const commonContractionsList = ["can't","dids't","didn't","don't","he'll","he'd","i'm","i've","i'll","i'd","isn't","there'll","they're","they've","they'll","thou'rt","we're","we've","we'll","we'd","who've","who'll","won't","wouldn't","you're","you've","you'll"]


/* silly contractions  ------------------------------------------------------------------------- */
// When encountered, [term] will be replaced with [replaceWith]
const sillyContractionsInfo = [
  { replaceWith: "even", term: "e'en" },
  { replaceWith: "beneath", term: "'neath" },
  { replaceWith: "jerusalem", wildcardAfter: true, term: "jerus'lem" },
  { replaceWith: "interest", wildcardAfter: true, term: "in'rest" },
  { replaceWith: "blossom", wildcardAfter: true, term: "bloss'm" },
  { replaceWith: "calvary", wildcardAfter: true, term: "calv'ry" },  
  { replaceWith: "family", wildcardAfter: true, term: "fam'ly" },
  { replaceWith: "jordan", wildcardAfter: true, term: "jord'n" },  
  { replaceWith: "orphan", wildcardAfter: true, term: "orph'n" },
  { replaceWith: "poison", wildcardAfter: true, term: "pois'n" },
  { replaceWith: "raptur", wildcardAfter: true, term: "rapt'r" },
  { replaceWith: "shadow", wildcardAfter: true, term: "shad'w" },
  { replaceWith: "travel", wildcardAfter: true, term: "trav'l" },
  { replaceWith: "toward", wildcardAfter: true, term: "t'ward" },
  { replaceWith: "victor", wildcardAfter: true, term: "vict'r" },
  { replaceWith: "abid", wildcardAfter: true, term: "'bid" },
  { replaceWith: "amid", wildcardAfter: true, term: "'mid" },
  { replaceWith: "ever", wildcardBefore: true, term: "e'er" },
  { replaceWith: "over", wildcardAfter: true, term: "o'er" },
  { replaceWith: "a", wildcardAfter: true, term: "a'" },
  { replaceWith: "ought", wildcardBefore: ".+", wildcardAfter: "s?", term: "o't" },
  { replaceWith: "quer", wildcardBefore: true, wildcardAfter: true, term: "q'r" },
  { replaceWith: "quer", wildcardBefore: true, wildcardAfter: true, term: "qu'r" },
  { replaceWith: "est", wildcardBefore: ".+[b-df-hj-np-tv-z]", term: "'st" },
  { replaceWith: "ed", wildcardBefore: ".+[b-df-hj-np-tv-z]", term: "'d" },
  { replaceWith: "en", wildcardBefore: ".+[b-df-hj-np-tv-z]", wildcardAfter: "(?:ing|ly)?", term: "'n" },
  { replaceWith: "er", wildcardBefore: ".+[b-df-hj-np-tv-z]", wildcardAfter: "(?:ish|ance)?|(?:er|est|ing)?(?:s)?", term: "'r" }
];

const sillyContractionReplacers = new Map();
for (let info of sillyContractionsInfo) {
  if (typeof(info.wildcardBefore) != "string") {
    info.wildcardBefore = (info.wildcardBefore) ? ".*" : "";
  }
  if (typeof(info.wildcardAfter) != "string") {
    info.wildcardAfter = (info.wildcardAfter) ? ".*" : "";
  }
  info.matchRegexTerm = `${info.wildcardBefore}(${info.term})${info.wildcardAfter}`;
  info.replaceRegex = new RegExp(`(^${info.wildcardBefore})${info.term}(${info.wildcardAfter}$)`);
  sillyContractionReplacers.set(info.term, (str) => str.replace(info.replaceRegex, `$1${info.replaceWith}$2`));
}
const sillyContractionsRegex = new RegExp("^" + sillyContractionsInfo.map(i => i.matchRegexTerm).join("|") + "$", "g");

function wildcardReplacer() {
  let args = [...arguments];
  // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace#specifying_a_function_as_a_parameter
  // arguments array is [match, p1, p2, ...pn, offset, string, groups]
  // parenGroups is created by slicing from p1 to the first numeric argument, which is guaranteed to be "offset".

  let match = args[0];
  let parenGroups = args.slice(1, args.findIndex(a => typeof(a) == "number"));
  let term = parenGroups.filter(g => typeof(g) != "undefined")[0];
  let replacer = sillyContractionReplacers.get(term);
  return (replacer) ? replacer(match) : match;
}

function repairContractions(token) {
  let str = token.str;
  if (!str || !str.includes("'")) {
    // No apostrophes: do nothing and return
    return token;
  }

  if (commonContractionsList.includes(str)) {
    // Common contraction: remove apostrophes and return
    token.str = str.replaceAll("'", "");
    return token;
  }

  // Silly contraction: return best-guess token and no-apostrophe token.
  let apostropheCount = [...str].filter(c => c == "'").length;
  for (let i = 0; i < apostropheCount; i++) {
    str = str.replace(sillyContractionsRegex, wildcardReplacer);
  }
  str = str.replaceAll("'", "");
  
  let bestGuessToken = token.clone();
  bestGuessToken.str = str;

  token.str = token.str.replaceAll("'", "");
  return [token, bestGuessToken];
}

export default repairContractions;