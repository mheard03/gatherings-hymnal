/* well-known contractions  -------------------------------------------------------------------- */
// When encountered, we'll just remove the apostrophe
const commonContractionsList = ["can't","didn't","don't","he'll","he'd","i'm","i've","i'll","i'd","isn't","there'll","they're","they've","they'll","we're","we've","we'll","we'd","who've","who'll","won't","wouldn't","you're","you've","you'll"]

/* well-known contractions  -------------------------------------------------------------------- */
// When encountered, [term] will be replaced with [replaceWith]
const wildcardContractionsInfo = [
  { term: "even", replaceWith: "een" },
  { term: "calvary", wildcardAfter: true, replaceWith: "calvry" },
  { term: "jordan", wildcardAfter: true, replaceWith: "jordn" },
  { term: "jerusalem", wildcardAfter: true, replaceWith: "jeruslem" },
  { term: "abid", wildcardAfter: true, replaceWith: "bid" },
  { term: "amid", wildcardAfter: true, replaceWith: "mid" },
  { term: "family", wildcardAfter: true, replaceWith: "famly" },
  { term: "blossom", wildcardAfter: true, replaceWith: "blossm" },
  { term: "toward", wildcardAfter: true, replaceWith: "tward" },
  { term: "victor", wildcardAfter: true, replaceWith: "victr" },
  { term: "interest", wildcardAfter: true, replaceWith: "inrest" },
  { term: "over", wildcardAfter: true, replaceWith: "oer" },
  { term: "ought", wildcardBefore: ".+", wildcardAfter: true, replaceWith: "ot" },
  { term: "ever", wildcardBefore: true, wildcardAfter: true, replaceWith: "eer" },
  { term: "qur", wildcardBefore: true, wildcardAfter: ".+", replaceWith: "qr" },
  { term: "quer", wildcardBefore: true, wildcardAfter: ".+", replaceWith: "qr" },
  { term: "est", wildcardBefore: ".+[b-df-hj-np-tv-z]", replaceWith: "st" },
  { term: "en", wildcardBefore: ".+[b-df-hj-np-tv-z]", wildcardAfter: "(?:ing)?", replaceWith: "n" },
  { term: "er", wildcardBefore: ".+[b-df-hj-np-tv-z]", wildcardAfter: "(?:er|est|ing|ish|s)?", replaceWith: "r" },
];
const wildcardContractionReplacers = new Map();
for (let info of wildcardContractionsInfo) {
  if (typeof(info.wildcardBefore) != "string") {
    info.wildcardBefore = (info.wildcardBefore) ? ".*" : "";
  }
  if (typeof(info.wildcardAfter) != "string") {
    info.wildcardAfter = (info.wildcardAfter) ? ".*" : "";
  }
  info.matchRegexTerm = `${info.wildcardBefore}(${info.term})${info.wildcardAfter}`;
  info.replaceRegex = new RegExp(`(^${info.wildcardBefore})${info.term}(${info.wildcardAfter}$)`);
  wildcardContractionReplacers.set(info.term, (str) => str.replace(info.replaceRegex, `$1${info.replaceWith}$2`));
}
const wildcardContractionsRegex = new RegExp("^" + wildcardContractionsInfo.map(i => i.matchRegexTerm).join("|") + "$");

function wildcardReplacer() {
  let args = [...arguments];
  // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace#specifying_a_function_as_a_parameter
  // arguments array is [match, p1, p2, ...pn, offset, string, groups]
  // parenGroups is created by slicing from p1 to the first numeric argument, which is guaranteed to be "offset".

  let match = args[0];
  let parenGroups = args.slice(1, args.findIndex(a => typeof(a) == "number"));
  let term = parenGroups.filter(g => typeof(g) != "undefined")[0];
  let replacer = wildcardContractionReplacers.get(term);
  console.log('replacer', replacer);
  return replacer(match);
}


function replaceContractions(token) {
  if (!str.includes("'")) return token;
  
  let str = token.str;

  // For common contractions, drop the apostrophe and return
  if (commonContractionsList.includes(str)) {
    token.str = str.replace("'", "");
    return token;
  }

  // Remove all apostrophes
  str = str.replace("'", "");

  // Remove all letters that might be apostrophied
  str = str.replace(wildcardContractionsRegex, wildcardReplacer);

  // Update the token and return
  token.str = str;
  return token;
}

export default replaceContractions;