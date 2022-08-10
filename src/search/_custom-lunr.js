import lunr from 'lunr'

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


/* Overridable stemmer  ------------------------------------------------------------------------ */
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


/* lunr.utils.asBasicString()  ----------------------------------------------------------------- */
const bestFitInverse = {0:"０₀",1:"１₁¹",2:"２₂²",3:"３₃³",4:"４₄⁴",5:"５₅⁵",6:"６₆⁶",7:"７₇⁷",8:"８₈⁸∞",9:"９₉","**":"‡","...":"…","+-":"±","<<":"《«≪",">>":"》»≫",ae:"æ",AE:"Æ",oe:"œ",OE:"Œ","!":"！ǃ",'"':"＂“”„","#":"＃",$:"＄","%":"％","&":"＆","'":"＇‘’‚","(":"（⌠",")":"）⌡","*":"＊∗†","+":"＋",",":"，","-":"－−‐‑–—․•",".":"．","/":"／⁄∕÷",":":"：∶",";":"；","<":"‹〈〈＜","=":"＝≡≤≥",">":"›〉〉＞","?":"？","@":"＠",A:"Ａ",B:"Ｂℬ",C:"Ｃℂℭ",D:"ＤĐÐƉ",E:"Ｅℰℇ",F:"ＦℱƑ",G:"ＧǤ",H:"ＨℋℍℌĦ",I:"ＩℐℑƗ",J:"Ｊ",K:"Ｋ",L:"ＬℒŁ",M:"Ｍℳ",N:"Ｎℕ",O:"ＯƟØ",P:"Ｐℙ℘",Q:"Ｑℚ",R:"Ｒℝℛℜ",S:"Ｓß",T:"ＴƮŦ",U:"Ｕ",V:"Ｖ",W:"Ｗ",X:"Ｘ",Y:"ÞＹ",Z:"Ｚℤℨ","[":"［〚","\\":"＼∖","]":"］〛","^":"＾⌃",_:"＿‗","`":"｀",a:"ａ",b:"ｂƀ",c:"ｃ",d:"ｄđð",e:"ｅℯ℮",f:"ｆƒ",g:"ｇℊǥɡ",h:"ｈℎħ",i:"ｉı",j:"ｊ",k:"ｋ",l:"ｌℓƚł",m:"ｍ",n:"∩ｎⁿ",o:"ｏℴø",p:"ｐ",q:"ｑ",r:"ｒ",s:"ｓ",t:"ｔƫŧ",u:"ｕ",v:"√ｖ",w:"ｗ",x:"×ｘ",y:"þｙ",z:"ｚƶ","{":"｛","|":"｜ǀ∣","}":"｝","~":"～˜∼"};
const bestFitMap = new Map();
Object.entries(bestFitInverse).forEach(([asciiChar, unicodeChars]) => {
  [...unicodeChars].forEach(uc => bestFitMap.set(uc, asciiChar));
})
const mappableUnicodeCharsRegex = new RegExp(("[" + [...bestFitMap.keys()].join("") + "]"), "gu");
const nonAsciiCharsRegex = /\P{ASCII}/u;

function downgradeExtendedCharacters(str) {
  if (!nonAsciiCharsRegex.test(str)) return str;

  // Use built-in function to strip diacritics
  // https://stackoverflow.com/questions/990904/remove-accents-diacritics-in-a-string-in-javascript
  let result = str.normalize("NFD").replace(/\p{Diacritic}/gu, "");

  // Do best-fit replacement on remaining characters and return
  return result.replace(mappableUnicodeCharsRegex, m => bestFitMap.get(m));
}

lunr.utils.asBasicString = function(obj) {
  let txt = lunr.utils.asString(obj);
  return downgradeExtendedCharacters(txt);
}

export default lunr;