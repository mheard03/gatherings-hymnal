var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};

// node_modules/lunr/lunr.js
var require_lunr = __commonJS({
  "node_modules/lunr/lunr.js"(exports, module) {
    (function() {
      var lunr6 = function(config) {
        var builder = new lunr6.Builder();
        builder.pipeline.add(
          lunr6.trimmer,
          lunr6.stopWordFilter,
          lunr6.stemmer
        );
        builder.searchPipeline.add(
          lunr6.stemmer
        );
        config.call(builder, builder);
        return builder.build();
      };
      lunr6.version = "2.3.9";
      lunr6.utils = {};
      lunr6.utils.warn = function(global) {
        return function(message) {
          if (global.console && console.warn) {
            console.warn(message);
          }
        };
      }(this);
      lunr6.utils.asString = function(obj) {
        if (obj === void 0 || obj === null) {
          return "";
        } else {
          return obj.toString();
        }
      };
      lunr6.utils.clone = function(obj) {
        if (obj === null || obj === void 0) {
          return obj;
        }
        var clone = /* @__PURE__ */ Object.create(null), keys = Object.keys(obj);
        for (var i = 0; i < keys.length; i++) {
          var key = keys[i], val = obj[key];
          if (Array.isArray(val)) {
            clone[key] = val.slice();
            continue;
          }
          if (typeof val === "string" || typeof val === "number" || typeof val === "boolean") {
            clone[key] = val;
            continue;
          }
          throw new TypeError("clone is not deep and does not support nested objects");
        }
        return clone;
      };
      lunr6.FieldRef = function(docRef, fieldName, stringValue) {
        this.docRef = docRef;
        this.fieldName = fieldName;
        this._stringValue = stringValue;
      };
      lunr6.FieldRef.joiner = "/";
      lunr6.FieldRef.fromString = function(s) {
        var n = s.indexOf(lunr6.FieldRef.joiner);
        if (n === -1) {
          throw "malformed field ref string";
        }
        var fieldRef = s.slice(0, n), docRef = s.slice(n + 1);
        return new lunr6.FieldRef(docRef, fieldRef, s);
      };
      lunr6.FieldRef.prototype.toString = function() {
        if (this._stringValue == void 0) {
          this._stringValue = this.fieldName + lunr6.FieldRef.joiner + this.docRef;
        }
        return this._stringValue;
      };
      lunr6.Set = function(elements) {
        this.elements = /* @__PURE__ */ Object.create(null);
        if (elements) {
          this.length = elements.length;
          for (var i = 0; i < this.length; i++) {
            this.elements[elements[i]] = true;
          }
        } else {
          this.length = 0;
        }
      };
      lunr6.Set.complete = {
        intersect: function(other) {
          return other;
        },
        union: function() {
          return this;
        },
        contains: function() {
          return true;
        }
      };
      lunr6.Set.empty = {
        intersect: function() {
          return this;
        },
        union: function(other) {
          return other;
        },
        contains: function() {
          return false;
        }
      };
      lunr6.Set.prototype.contains = function(object) {
        return !!this.elements[object];
      };
      lunr6.Set.prototype.intersect = function(other) {
        var a, b, elements, intersection = [];
        if (other === lunr6.Set.complete) {
          return this;
        }
        if (other === lunr6.Set.empty) {
          return other;
        }
        if (this.length < other.length) {
          a = this;
          b = other;
        } else {
          a = other;
          b = this;
        }
        elements = Object.keys(a.elements);
        for (var i = 0; i < elements.length; i++) {
          var element = elements[i];
          if (element in b.elements) {
            intersection.push(element);
          }
        }
        return new lunr6.Set(intersection);
      };
      lunr6.Set.prototype.union = function(other) {
        if (other === lunr6.Set.complete) {
          return lunr6.Set.complete;
        }
        if (other === lunr6.Set.empty) {
          return this;
        }
        return new lunr6.Set(Object.keys(this.elements).concat(Object.keys(other.elements)));
      };
      lunr6.idf = function(posting, documentCount) {
        var documentsWithTerm = 0;
        for (var fieldName in posting) {
          if (fieldName == "_index")
            continue;
          documentsWithTerm += Object.keys(posting[fieldName]).length;
        }
        var x = (documentCount - documentsWithTerm + 0.5) / (documentsWithTerm + 0.5);
        return Math.log(1 + Math.abs(x));
      };
      lunr6.Token = function(str, metadata) {
        this.str = str || "";
        this.metadata = metadata || {};
      };
      lunr6.Token.prototype.toString = function() {
        return this.str;
      };
      lunr6.Token.prototype.update = function(fn) {
        this.str = fn(this.str, this.metadata);
        return this;
      };
      lunr6.Token.prototype.clone = function(fn) {
        fn = fn || function(s) {
          return s;
        };
        return new lunr6.Token(fn(this.str, this.metadata), this.metadata);
      };
      lunr6.tokenizer = function(obj, metadata) {
        if (obj == null || obj == void 0) {
          return [];
        }
        if (Array.isArray(obj)) {
          return obj.map(function(t) {
            return new lunr6.Token(
              lunr6.utils.asString(t).toLowerCase(),
              lunr6.utils.clone(metadata)
            );
          });
        }
        var str = obj.toString().toLowerCase(), len = str.length, tokens = [];
        for (var sliceEnd = 0, sliceStart = 0; sliceEnd <= len; sliceEnd++) {
          var char = str.charAt(sliceEnd), sliceLength = sliceEnd - sliceStart;
          if (char.match(lunr6.tokenizer.separator) || sliceEnd == len) {
            if (sliceLength > 0) {
              var tokenMetadata = lunr6.utils.clone(metadata) || {};
              tokenMetadata["position"] = [sliceStart, sliceLength];
              tokenMetadata["index"] = tokens.length;
              tokens.push(
                new lunr6.Token(
                  str.slice(sliceStart, sliceEnd),
                  tokenMetadata
                )
              );
            }
            sliceStart = sliceEnd + 1;
          }
        }
        return tokens;
      };
      lunr6.tokenizer.separator = /[\s\-]+/;
      lunr6.Pipeline = function() {
        this._stack = [];
      };
      lunr6.Pipeline.registeredFunctions = /* @__PURE__ */ Object.create(null);
      lunr6.Pipeline.registerFunction = function(fn, label) {
        if (label in this.registeredFunctions) {
          lunr6.utils.warn("Overwriting existing registered function: " + label);
        }
        fn.label = label;
        lunr6.Pipeline.registeredFunctions[fn.label] = fn;
      };
      lunr6.Pipeline.warnIfFunctionNotRegistered = function(fn) {
        var isRegistered = fn.label && fn.label in this.registeredFunctions;
        if (!isRegistered) {
          lunr6.utils.warn("Function is not registered with pipeline. This may cause problems when serialising the index.\n", fn);
        }
      };
      lunr6.Pipeline.load = function(serialised) {
        var pipeline = new lunr6.Pipeline();
        serialised.forEach(function(fnName) {
          var fn = lunr6.Pipeline.registeredFunctions[fnName];
          if (fn) {
            pipeline.add(fn);
          } else {
            throw new Error("Cannot load unregistered function: " + fnName);
          }
        });
        return pipeline;
      };
      lunr6.Pipeline.prototype.add = function() {
        var fns = Array.prototype.slice.call(arguments);
        fns.forEach(function(fn) {
          lunr6.Pipeline.warnIfFunctionNotRegistered(fn);
          this._stack.push(fn);
        }, this);
      };
      lunr6.Pipeline.prototype.after = function(existingFn, newFn) {
        lunr6.Pipeline.warnIfFunctionNotRegistered(newFn);
        var pos = this._stack.indexOf(existingFn);
        if (pos == -1) {
          throw new Error("Cannot find existingFn");
        }
        pos = pos + 1;
        this._stack.splice(pos, 0, newFn);
      };
      lunr6.Pipeline.prototype.before = function(existingFn, newFn) {
        lunr6.Pipeline.warnIfFunctionNotRegistered(newFn);
        var pos = this._stack.indexOf(existingFn);
        if (pos == -1) {
          throw new Error("Cannot find existingFn");
        }
        this._stack.splice(pos, 0, newFn);
      };
      lunr6.Pipeline.prototype.remove = function(fn) {
        var pos = this._stack.indexOf(fn);
        if (pos == -1) {
          return;
        }
        this._stack.splice(pos, 1);
      };
      lunr6.Pipeline.prototype.run = function(tokens) {
        var stackLength = this._stack.length;
        for (var i = 0; i < stackLength; i++) {
          var fn = this._stack[i];
          var memo = [];
          for (var j = 0; j < tokens.length; j++) {
            var result = fn(tokens[j], j, tokens);
            if (result === null || result === void 0 || result === "")
              continue;
            if (Array.isArray(result)) {
              for (var k = 0; k < result.length; k++) {
                memo.push(result[k]);
              }
            } else {
              memo.push(result);
            }
          }
          tokens = memo;
        }
        return tokens;
      };
      lunr6.Pipeline.prototype.runString = function(str, metadata) {
        var token = new lunr6.Token(str, metadata);
        return this.run([token]).map(function(t) {
          return t.toString();
        });
      };
      lunr6.Pipeline.prototype.reset = function() {
        this._stack = [];
      };
      lunr6.Pipeline.prototype.toJSON = function() {
        return this._stack.map(function(fn) {
          lunr6.Pipeline.warnIfFunctionNotRegistered(fn);
          return fn.label;
        });
      };
      lunr6.Vector = function(elements) {
        this._magnitude = 0;
        this.elements = elements || [];
      };
      lunr6.Vector.prototype.positionForIndex = function(index2) {
        if (this.elements.length == 0) {
          return 0;
        }
        var start = 0, end = this.elements.length / 2, sliceLength = end - start, pivotPoint = Math.floor(sliceLength / 2), pivotIndex = this.elements[pivotPoint * 2];
        while (sliceLength > 1) {
          if (pivotIndex < index2) {
            start = pivotPoint;
          }
          if (pivotIndex > index2) {
            end = pivotPoint;
          }
          if (pivotIndex == index2) {
            break;
          }
          sliceLength = end - start;
          pivotPoint = start + Math.floor(sliceLength / 2);
          pivotIndex = this.elements[pivotPoint * 2];
        }
        if (pivotIndex == index2) {
          return pivotPoint * 2;
        }
        if (pivotIndex > index2) {
          return pivotPoint * 2;
        }
        if (pivotIndex < index2) {
          return (pivotPoint + 1) * 2;
        }
      };
      lunr6.Vector.prototype.insert = function(insertIdx, val) {
        this.upsert(insertIdx, val, function() {
          throw "duplicate index";
        });
      };
      lunr6.Vector.prototype.upsert = function(insertIdx, val, fn) {
        this._magnitude = 0;
        var position = this.positionForIndex(insertIdx);
        if (this.elements[position] == insertIdx) {
          this.elements[position + 1] = fn(this.elements[position + 1], val);
        } else {
          this.elements.splice(position, 0, insertIdx, val);
        }
      };
      lunr6.Vector.prototype.magnitude = function() {
        if (this._magnitude)
          return this._magnitude;
        var sumOfSquares = 0, elementsLength = this.elements.length;
        for (var i = 1; i < elementsLength; i += 2) {
          var val = this.elements[i];
          sumOfSquares += val * val;
        }
        return this._magnitude = Math.sqrt(sumOfSquares);
      };
      lunr6.Vector.prototype.dot = function(otherVector) {
        var dotProduct = 0, a = this.elements, b = otherVector.elements, aLen = a.length, bLen = b.length, aVal = 0, bVal = 0, i = 0, j = 0;
        while (i < aLen && j < bLen) {
          aVal = a[i], bVal = b[j];
          if (aVal < bVal) {
            i += 2;
          } else if (aVal > bVal) {
            j += 2;
          } else if (aVal == bVal) {
            dotProduct += a[i + 1] * b[j + 1];
            i += 2;
            j += 2;
          }
        }
        return dotProduct;
      };
      lunr6.Vector.prototype.similarity = function(otherVector) {
        return this.dot(otherVector) / this.magnitude() || 0;
      };
      lunr6.Vector.prototype.toArray = function() {
        var output = new Array(this.elements.length / 2);
        for (var i = 1, j = 0; i < this.elements.length; i += 2, j++) {
          output[j] = this.elements[i];
        }
        return output;
      };
      lunr6.Vector.prototype.toJSON = function() {
        return this.elements;
      };
      lunr6.stemmer = function() {
        var step2list = {
          "ational": "ate",
          "tional": "tion",
          "enci": "ence",
          "anci": "ance",
          "izer": "ize",
          "bli": "ble",
          "alli": "al",
          "entli": "ent",
          "eli": "e",
          "ousli": "ous",
          "ization": "ize",
          "ation": "ate",
          "ator": "ate",
          "alism": "al",
          "iveness": "ive",
          "fulness": "ful",
          "ousness": "ous",
          "aliti": "al",
          "iviti": "ive",
          "biliti": "ble",
          "logi": "log"
        }, step3list = {
          "icate": "ic",
          "ative": "",
          "alize": "al",
          "iciti": "ic",
          "ical": "ic",
          "ful": "",
          "ness": ""
        }, c = "[^aeiou]", v = "[aeiouy]", C = c + "[^aeiouy]*", V = v + "[aeiou]*", mgr0 = "^(" + C + ")?" + V + C, meq1 = "^(" + C + ")?" + V + C + "(" + V + ")?$", mgr1 = "^(" + C + ")?" + V + C + V + C, s_v = "^(" + C + ")?" + v;
        var re_mgr0 = new RegExp(mgr0);
        var re_mgr1 = new RegExp(mgr1);
        var re_meq1 = new RegExp(meq1);
        var re_s_v = new RegExp(s_v);
        var re_1a = /^(.+?)(ss|i)es$/;
        var re2_1a = /^(.+?)([^s])s$/;
        var re_1b = /^(.+?)eed$/;
        var re2_1b = /^(.+?)(ed|ing)$/;
        var re_1b_2 = /.$/;
        var re2_1b_2 = /(at|bl|iz)$/;
        var re3_1b_2 = new RegExp("([^aeiouylsz])\\1$");
        var re4_1b_2 = new RegExp("^" + C + v + "[^aeiouwxy]$");
        var re_1c = /^(.+?[^aeiou])y$/;
        var re_2 = /^(.+?)(ational|tional|enci|anci|izer|bli|alli|entli|eli|ousli|ization|ation|ator|alism|iveness|fulness|ousness|aliti|iviti|biliti|logi)$/;
        var re_3 = /^(.+?)(icate|ative|alize|iciti|ical|ful|ness)$/;
        var re_4 = /^(.+?)(al|ance|ence|er|ic|able|ible|ant|ement|ment|ent|ou|ism|ate|iti|ous|ive|ize)$/;
        var re2_4 = /^(.+?)(s|t)(ion)$/;
        var re_5 = /^(.+?)e$/;
        var re_5_1 = /ll$/;
        var re3_5 = new RegExp("^" + C + v + "[^aeiouwxy]$");
        var porterStemmer = function porterStemmer2(w) {
          var stem, suffix, firstch, re2, re22, re3, re4;
          if (w.length < 3) {
            return w;
          }
          firstch = w.substr(0, 1);
          if (firstch == "y") {
            w = firstch.toUpperCase() + w.substr(1);
          }
          re2 = re_1a;
          re22 = re2_1a;
          if (re2.test(w)) {
            w = w.replace(re2, "$1$2");
          } else if (re22.test(w)) {
            w = w.replace(re22, "$1$2");
          }
          re2 = re_1b;
          re22 = re2_1b;
          if (re2.test(w)) {
            var fp = re2.exec(w);
            re2 = re_mgr0;
            if (re2.test(fp[1])) {
              re2 = re_1b_2;
              w = w.replace(re2, "");
            }
          } else if (re22.test(w)) {
            var fp = re22.exec(w);
            stem = fp[1];
            re22 = re_s_v;
            if (re22.test(stem)) {
              w = stem;
              re22 = re2_1b_2;
              re3 = re3_1b_2;
              re4 = re4_1b_2;
              if (re22.test(w)) {
                w = w + "e";
              } else if (re3.test(w)) {
                re2 = re_1b_2;
                w = w.replace(re2, "");
              } else if (re4.test(w)) {
                w = w + "e";
              }
            }
          }
          re2 = re_1c;
          if (re2.test(w)) {
            var fp = re2.exec(w);
            stem = fp[1];
            w = stem + "i";
          }
          re2 = re_2;
          if (re2.test(w)) {
            var fp = re2.exec(w);
            stem = fp[1];
            suffix = fp[2];
            re2 = re_mgr0;
            if (re2.test(stem)) {
              w = stem + step2list[suffix];
            }
          }
          re2 = re_3;
          if (re2.test(w)) {
            var fp = re2.exec(w);
            stem = fp[1];
            suffix = fp[2];
            re2 = re_mgr0;
            if (re2.test(stem)) {
              w = stem + step3list[suffix];
            }
          }
          re2 = re_4;
          re22 = re2_4;
          if (re2.test(w)) {
            var fp = re2.exec(w);
            stem = fp[1];
            re2 = re_mgr1;
            if (re2.test(stem)) {
              w = stem;
            }
          } else if (re22.test(w)) {
            var fp = re22.exec(w);
            stem = fp[1] + fp[2];
            re22 = re_mgr1;
            if (re22.test(stem)) {
              w = stem;
            }
          }
          re2 = re_5;
          if (re2.test(w)) {
            var fp = re2.exec(w);
            stem = fp[1];
            re2 = re_mgr1;
            re22 = re_meq1;
            re3 = re3_5;
            if (re2.test(stem) || re22.test(stem) && !re3.test(stem)) {
              w = stem;
            }
          }
          re2 = re_5_1;
          re22 = re_mgr1;
          if (re2.test(w) && re22.test(w)) {
            re2 = re_1b_2;
            w = w.replace(re2, "");
          }
          if (firstch == "y") {
            w = firstch.toLowerCase() + w.substr(1);
          }
          return w;
        };
        return function(token) {
          return token.update(porterStemmer);
        };
      }();
      lunr6.Pipeline.registerFunction(lunr6.stemmer, "stemmer");
      lunr6.generateStopWordFilter = function(stopWords) {
        var words = stopWords.reduce(function(memo, stopWord) {
          memo[stopWord] = stopWord;
          return memo;
        }, {});
        return function(token) {
          if (token && words[token.toString()] !== token.toString())
            return token;
        };
      };
      lunr6.stopWordFilter = lunr6.generateStopWordFilter([
        "a",
        "able",
        "about",
        "across",
        "after",
        "all",
        "almost",
        "also",
        "am",
        "among",
        "an",
        "and",
        "any",
        "are",
        "as",
        "at",
        "be",
        "because",
        "been",
        "but",
        "by",
        "can",
        "cannot",
        "could",
        "dear",
        "did",
        "do",
        "does",
        "either",
        "else",
        "ever",
        "every",
        "for",
        "from",
        "get",
        "got",
        "had",
        "has",
        "have",
        "he",
        "her",
        "hers",
        "him",
        "his",
        "how",
        "however",
        "i",
        "if",
        "in",
        "into",
        "is",
        "it",
        "its",
        "just",
        "least",
        "let",
        "like",
        "likely",
        "may",
        "me",
        "might",
        "most",
        "must",
        "my",
        "neither",
        "no",
        "nor",
        "not",
        "of",
        "off",
        "often",
        "on",
        "only",
        "or",
        "other",
        "our",
        "own",
        "rather",
        "said",
        "say",
        "says",
        "she",
        "should",
        "since",
        "so",
        "some",
        "than",
        "that",
        "the",
        "their",
        "them",
        "then",
        "there",
        "these",
        "they",
        "this",
        "tis",
        "to",
        "too",
        "twas",
        "us",
        "wants",
        "was",
        "we",
        "were",
        "what",
        "when",
        "where",
        "which",
        "while",
        "who",
        "whom",
        "why",
        "will",
        "with",
        "would",
        "yet",
        "you",
        "your"
      ]);
      lunr6.Pipeline.registerFunction(lunr6.stopWordFilter, "stopWordFilter");
      lunr6.trimmer = function(token) {
        return token.update(function(s) {
          return s.replace(/^\W+/, "").replace(/\W+$/, "");
        });
      };
      lunr6.Pipeline.registerFunction(lunr6.trimmer, "trimmer");
      lunr6.TokenSet = function() {
        this.final = false;
        this.edges = {};
        this.id = lunr6.TokenSet._nextId;
        lunr6.TokenSet._nextId += 1;
      };
      lunr6.TokenSet._nextId = 1;
      lunr6.TokenSet.fromArray = function(arr) {
        var builder = new lunr6.TokenSet.Builder();
        for (var i = 0, len = arr.length; i < len; i++) {
          builder.insert(arr[i]);
        }
        builder.finish();
        return builder.root;
      };
      lunr6.TokenSet.fromClause = function(clause) {
        if ("editDistance" in clause) {
          return lunr6.TokenSet.fromFuzzyString(clause.term, clause.editDistance);
        } else {
          return lunr6.TokenSet.fromString(clause.term);
        }
      };
      lunr6.TokenSet.fromFuzzyString = function(str, editDistance) {
        var root = new lunr6.TokenSet();
        var stack = [{
          node: root,
          editsRemaining: editDistance,
          str
        }];
        while (stack.length) {
          var frame = stack.pop();
          if (frame.str.length > 0) {
            var char = frame.str.charAt(0), noEditNode;
            if (char in frame.node.edges) {
              noEditNode = frame.node.edges[char];
            } else {
              noEditNode = new lunr6.TokenSet();
              frame.node.edges[char] = noEditNode;
            }
            if (frame.str.length == 1) {
              noEditNode.final = true;
            }
            stack.push({
              node: noEditNode,
              editsRemaining: frame.editsRemaining,
              str: frame.str.slice(1)
            });
          }
          if (frame.editsRemaining == 0) {
            continue;
          }
          if ("*" in frame.node.edges) {
            var insertionNode = frame.node.edges["*"];
          } else {
            var insertionNode = new lunr6.TokenSet();
            frame.node.edges["*"] = insertionNode;
          }
          if (frame.str.length == 0) {
            insertionNode.final = true;
          }
          stack.push({
            node: insertionNode,
            editsRemaining: frame.editsRemaining - 1,
            str: frame.str
          });
          if (frame.str.length > 1) {
            stack.push({
              node: frame.node,
              editsRemaining: frame.editsRemaining - 1,
              str: frame.str.slice(1)
            });
          }
          if (frame.str.length == 1) {
            frame.node.final = true;
          }
          if (frame.str.length >= 1) {
            if ("*" in frame.node.edges) {
              var substitutionNode = frame.node.edges["*"];
            } else {
              var substitutionNode = new lunr6.TokenSet();
              frame.node.edges["*"] = substitutionNode;
            }
            if (frame.str.length == 1) {
              substitutionNode.final = true;
            }
            stack.push({
              node: substitutionNode,
              editsRemaining: frame.editsRemaining - 1,
              str: frame.str.slice(1)
            });
          }
          if (frame.str.length > 1) {
            var charA = frame.str.charAt(0), charB = frame.str.charAt(1), transposeNode;
            if (charB in frame.node.edges) {
              transposeNode = frame.node.edges[charB];
            } else {
              transposeNode = new lunr6.TokenSet();
              frame.node.edges[charB] = transposeNode;
            }
            if (frame.str.length == 1) {
              transposeNode.final = true;
            }
            stack.push({
              node: transposeNode,
              editsRemaining: frame.editsRemaining - 1,
              str: charA + frame.str.slice(2)
            });
          }
        }
        return root;
      };
      lunr6.TokenSet.fromString = function(str) {
        var node = new lunr6.TokenSet(), root = node;
        for (var i = 0, len = str.length; i < len; i++) {
          var char = str[i], final = i == len - 1;
          if (char == "*") {
            node.edges[char] = node;
            node.final = final;
          } else {
            var next = new lunr6.TokenSet();
            next.final = final;
            node.edges[char] = next;
            node = next;
          }
        }
        return root;
      };
      lunr6.TokenSet.prototype.toArray = function() {
        var words = [];
        var stack = [{
          prefix: "",
          node: this
        }];
        while (stack.length) {
          var frame = stack.pop(), edges = Object.keys(frame.node.edges), len = edges.length;
          if (frame.node.final) {
            frame.prefix.charAt(0);
            words.push(frame.prefix);
          }
          for (var i = 0; i < len; i++) {
            var edge = edges[i];
            stack.push({
              prefix: frame.prefix.concat(edge),
              node: frame.node.edges[edge]
            });
          }
        }
        return words;
      };
      lunr6.TokenSet.prototype.toString = function() {
        if (this._str) {
          return this._str;
        }
        var str = this.final ? "1" : "0", labels = Object.keys(this.edges).sort(), len = labels.length;
        for (var i = 0; i < len; i++) {
          var label = labels[i], node = this.edges[label];
          str = str + label + node.id;
        }
        return str;
      };
      lunr6.TokenSet.prototype.intersect = function(b) {
        var output = new lunr6.TokenSet(), frame = void 0;
        var stack = [{
          qNode: b,
          output,
          node: this
        }];
        while (stack.length) {
          frame = stack.pop();
          var qEdges = Object.keys(frame.qNode.edges), qLen = qEdges.length, nEdges = Object.keys(frame.node.edges), nLen = nEdges.length;
          for (var q = 0; q < qLen; q++) {
            var qEdge = qEdges[q];
            for (var n = 0; n < nLen; n++) {
              var nEdge = nEdges[n];
              if (nEdge == qEdge || qEdge == "*") {
                var node = frame.node.edges[nEdge], qNode = frame.qNode.edges[qEdge], final = node.final && qNode.final, next = void 0;
                if (nEdge in frame.output.edges) {
                  next = frame.output.edges[nEdge];
                  next.final = next.final || final;
                } else {
                  next = new lunr6.TokenSet();
                  next.final = final;
                  frame.output.edges[nEdge] = next;
                }
                stack.push({
                  qNode,
                  output: next,
                  node
                });
              }
            }
          }
        }
        return output;
      };
      lunr6.TokenSet.Builder = function() {
        this.previousWord = "";
        this.root = new lunr6.TokenSet();
        this.uncheckedNodes = [];
        this.minimizedNodes = {};
      };
      lunr6.TokenSet.Builder.prototype.insert = function(word) {
        var node, commonPrefix = 0;
        if (word < this.previousWord) {
          throw new Error("Out of order word insertion");
        }
        for (var i = 0; i < word.length && i < this.previousWord.length; i++) {
          if (word[i] != this.previousWord[i])
            break;
          commonPrefix++;
        }
        this.minimize(commonPrefix);
        if (this.uncheckedNodes.length == 0) {
          node = this.root;
        } else {
          node = this.uncheckedNodes[this.uncheckedNodes.length - 1].child;
        }
        for (var i = commonPrefix; i < word.length; i++) {
          var nextNode = new lunr6.TokenSet(), char = word[i];
          node.edges[char] = nextNode;
          this.uncheckedNodes.push({
            parent: node,
            char,
            child: nextNode
          });
          node = nextNode;
        }
        node.final = true;
        this.previousWord = word;
      };
      lunr6.TokenSet.Builder.prototype.finish = function() {
        this.minimize(0);
      };
      lunr6.TokenSet.Builder.prototype.minimize = function(downTo) {
        for (var i = this.uncheckedNodes.length - 1; i >= downTo; i--) {
          var node = this.uncheckedNodes[i], childKey = node.child.toString();
          if (childKey in this.minimizedNodes) {
            node.parent.edges[node.char] = this.minimizedNodes[childKey];
          } else {
            node.child._str = childKey;
            this.minimizedNodes[childKey] = node.child;
          }
          this.uncheckedNodes.pop();
        }
      };
      lunr6.Index = function(attrs) {
        this.invertedIndex = attrs.invertedIndex;
        this.fieldVectors = attrs.fieldVectors;
        this.tokenSet = attrs.tokenSet;
        this.fields = attrs.fields;
        this.pipeline = attrs.pipeline;
      };
      lunr6.Index.prototype.search = function(queryString) {
        return this.query(function(query) {
          var parser = new lunr6.QueryParser(queryString, query);
          parser.parse();
        });
      };
      lunr6.Index.prototype.query = function(fn) {
        var query = new lunr6.Query(this.fields), matchingFields = /* @__PURE__ */ Object.create(null), queryVectors = /* @__PURE__ */ Object.create(null), termFieldCache = /* @__PURE__ */ Object.create(null), requiredMatches = /* @__PURE__ */ Object.create(null), prohibitedMatches = /* @__PURE__ */ Object.create(null);
        for (var i = 0; i < this.fields.length; i++) {
          queryVectors[this.fields[i]] = new lunr6.Vector();
        }
        fn.call(query, query);
        for (var i = 0; i < query.clauses.length; i++) {
          var clause = query.clauses[i], terms = null, clauseMatches = lunr6.Set.empty;
          if (clause.usePipeline) {
            terms = this.pipeline.runString(clause.term, {
              fields: clause.fields
            });
          } else {
            terms = [clause.term];
          }
          for (var m = 0; m < terms.length; m++) {
            var term = terms[m];
            clause.term = term;
            var termTokenSet = lunr6.TokenSet.fromClause(clause), expandedTerms = this.tokenSet.intersect(termTokenSet).toArray();
            if (expandedTerms.length === 0 && clause.presence === lunr6.Query.presence.REQUIRED) {
              for (var k = 0; k < clause.fields.length; k++) {
                var field = clause.fields[k];
                requiredMatches[field] = lunr6.Set.empty;
              }
              break;
            }
            for (var j = 0; j < expandedTerms.length; j++) {
              var expandedTerm = expandedTerms[j], posting = this.invertedIndex[expandedTerm], termIndex = posting._index;
              for (var k = 0; k < clause.fields.length; k++) {
                var field = clause.fields[k], fieldPosting = posting[field], matchingDocumentRefs = Object.keys(fieldPosting), termField = expandedTerm + "/" + field, matchingDocumentsSet = new lunr6.Set(matchingDocumentRefs);
                if (clause.presence == lunr6.Query.presence.REQUIRED) {
                  clauseMatches = clauseMatches.union(matchingDocumentsSet);
                  if (requiredMatches[field] === void 0) {
                    requiredMatches[field] = lunr6.Set.complete;
                  }
                }
                if (clause.presence == lunr6.Query.presence.PROHIBITED) {
                  if (prohibitedMatches[field] === void 0) {
                    prohibitedMatches[field] = lunr6.Set.empty;
                  }
                  prohibitedMatches[field] = prohibitedMatches[field].union(matchingDocumentsSet);
                  continue;
                }
                queryVectors[field].upsert(termIndex, clause.boost, function(a, b) {
                  return a + b;
                });
                if (termFieldCache[termField]) {
                  continue;
                }
                for (var l = 0; l < matchingDocumentRefs.length; l++) {
                  var matchingDocumentRef = matchingDocumentRefs[l], matchingFieldRef = new lunr6.FieldRef(matchingDocumentRef, field), metadata = fieldPosting[matchingDocumentRef], fieldMatch;
                  if ((fieldMatch = matchingFields[matchingFieldRef]) === void 0) {
                    matchingFields[matchingFieldRef] = new lunr6.MatchData(expandedTerm, field, metadata);
                  } else {
                    fieldMatch.add(expandedTerm, field, metadata);
                  }
                }
                termFieldCache[termField] = true;
              }
            }
          }
          if (clause.presence === lunr6.Query.presence.REQUIRED) {
            for (var k = 0; k < clause.fields.length; k++) {
              var field = clause.fields[k];
              requiredMatches[field] = requiredMatches[field].intersect(clauseMatches);
            }
          }
        }
        var allRequiredMatches = lunr6.Set.complete, allProhibitedMatches = lunr6.Set.empty;
        for (var i = 0; i < this.fields.length; i++) {
          var field = this.fields[i];
          if (requiredMatches[field]) {
            allRequiredMatches = allRequiredMatches.intersect(requiredMatches[field]);
          }
          if (prohibitedMatches[field]) {
            allProhibitedMatches = allProhibitedMatches.union(prohibitedMatches[field]);
          }
        }
        var matchingFieldRefs = Object.keys(matchingFields), results = [], matches = /* @__PURE__ */ Object.create(null);
        if (query.isNegated()) {
          matchingFieldRefs = Object.keys(this.fieldVectors);
          for (var i = 0; i < matchingFieldRefs.length; i++) {
            var matchingFieldRef = matchingFieldRefs[i];
            var fieldRef = lunr6.FieldRef.fromString(matchingFieldRef);
            matchingFields[matchingFieldRef] = new lunr6.MatchData();
          }
        }
        for (var i = 0; i < matchingFieldRefs.length; i++) {
          var fieldRef = lunr6.FieldRef.fromString(matchingFieldRefs[i]), docRef = fieldRef.docRef;
          if (!allRequiredMatches.contains(docRef)) {
            continue;
          }
          if (allProhibitedMatches.contains(docRef)) {
            continue;
          }
          var fieldVector = this.fieldVectors[fieldRef], score = queryVectors[fieldRef.fieldName].similarity(fieldVector), docMatch;
          if ((docMatch = matches[docRef]) !== void 0) {
            docMatch.score += score;
            docMatch.matchData.combine(matchingFields[fieldRef]);
          } else {
            var match = {
              ref: docRef,
              score,
              matchData: matchingFields[fieldRef]
            };
            matches[docRef] = match;
            results.push(match);
          }
        }
        return results.sort(function(a, b) {
          return b.score - a.score;
        });
      };
      lunr6.Index.prototype.toJSON = function() {
        var invertedIndex = Object.keys(this.invertedIndex).sort().map(function(term) {
          return [term, this.invertedIndex[term]];
        }, this);
        var fieldVectors = Object.keys(this.fieldVectors).map(function(ref) {
          return [ref, this.fieldVectors[ref].toJSON()];
        }, this);
        return {
          version: lunr6.version,
          fields: this.fields,
          fieldVectors,
          invertedIndex,
          pipeline: this.pipeline.toJSON()
        };
      };
      lunr6.Index.load = function(serializedIndex) {
        var attrs = {}, fieldVectors = {}, serializedVectors = serializedIndex.fieldVectors, invertedIndex = /* @__PURE__ */ Object.create(null), serializedInvertedIndex = serializedIndex.invertedIndex, tokenSetBuilder = new lunr6.TokenSet.Builder(), pipeline = lunr6.Pipeline.load(serializedIndex.pipeline);
        if (serializedIndex.version != lunr6.version) {
          lunr6.utils.warn("Version mismatch when loading serialised index. Current version of lunr '" + lunr6.version + "' does not match serialized index '" + serializedIndex.version + "'");
        }
        for (var i = 0; i < serializedVectors.length; i++) {
          var tuple = serializedVectors[i], ref = tuple[0], elements = tuple[1];
          fieldVectors[ref] = new lunr6.Vector(elements);
        }
        for (var i = 0; i < serializedInvertedIndex.length; i++) {
          var tuple = serializedInvertedIndex[i], term = tuple[0], posting = tuple[1];
          tokenSetBuilder.insert(term);
          invertedIndex[term] = posting;
        }
        tokenSetBuilder.finish();
        attrs.fields = serializedIndex.fields;
        attrs.fieldVectors = fieldVectors;
        attrs.invertedIndex = invertedIndex;
        attrs.tokenSet = tokenSetBuilder.root;
        attrs.pipeline = pipeline;
        return new lunr6.Index(attrs);
      };
      lunr6.Builder = function() {
        this._ref = "id";
        this._fields = /* @__PURE__ */ Object.create(null);
        this._documents = /* @__PURE__ */ Object.create(null);
        this.invertedIndex = /* @__PURE__ */ Object.create(null);
        this.fieldTermFrequencies = {};
        this.fieldLengths = {};
        this.tokenizer = lunr6.tokenizer;
        this.pipeline = new lunr6.Pipeline();
        this.searchPipeline = new lunr6.Pipeline();
        this.documentCount = 0;
        this._b = 0.75;
        this._k1 = 1.2;
        this.termIndex = 0;
        this.metadataWhitelist = [];
      };
      lunr6.Builder.prototype.ref = function(ref) {
        this._ref = ref;
      };
      lunr6.Builder.prototype.field = function(fieldName, attributes) {
        if (/\//.test(fieldName)) {
          throw new RangeError("Field '" + fieldName + "' contains illegal character '/'");
        }
        this._fields[fieldName] = attributes || {};
      };
      lunr6.Builder.prototype.b = function(number3) {
        if (number3 < 0) {
          this._b = 0;
        } else if (number3 > 1) {
          this._b = 1;
        } else {
          this._b = number3;
        }
      };
      lunr6.Builder.prototype.k1 = function(number3) {
        this._k1 = number3;
      };
      lunr6.Builder.prototype.add = function(doc, attributes) {
        var docRef = doc[this._ref], fields = Object.keys(this._fields);
        this._documents[docRef] = attributes || {};
        this.documentCount += 1;
        for (var i = 0; i < fields.length; i++) {
          var fieldName = fields[i], extractor = this._fields[fieldName].extractor, field = extractor ? extractor(doc) : doc[fieldName], tokens = this.tokenizer(field, {
            fields: [fieldName]
          }), terms = this.pipeline.run(tokens), fieldRef = new lunr6.FieldRef(docRef, fieldName), fieldTerms = /* @__PURE__ */ Object.create(null);
          this.fieldTermFrequencies[fieldRef] = fieldTerms;
          this.fieldLengths[fieldRef] = 0;
          this.fieldLengths[fieldRef] += terms.length;
          for (var j = 0; j < terms.length; j++) {
            var term = terms[j];
            if (fieldTerms[term] == void 0) {
              fieldTerms[term] = 0;
            }
            fieldTerms[term] += 1;
            if (this.invertedIndex[term] == void 0) {
              var posting = /* @__PURE__ */ Object.create(null);
              posting["_index"] = this.termIndex;
              this.termIndex += 1;
              for (var k = 0; k < fields.length; k++) {
                posting[fields[k]] = /* @__PURE__ */ Object.create(null);
              }
              this.invertedIndex[term] = posting;
            }
            if (this.invertedIndex[term][fieldName][docRef] == void 0) {
              this.invertedIndex[term][fieldName][docRef] = /* @__PURE__ */ Object.create(null);
            }
            for (var l = 0; l < this.metadataWhitelist.length; l++) {
              var metadataKey = this.metadataWhitelist[l], metadata = term.metadata[metadataKey];
              if (this.invertedIndex[term][fieldName][docRef][metadataKey] == void 0) {
                this.invertedIndex[term][fieldName][docRef][metadataKey] = [];
              }
              this.invertedIndex[term][fieldName][docRef][metadataKey].push(metadata);
            }
          }
        }
      };
      lunr6.Builder.prototype.calculateAverageFieldLengths = function() {
        var fieldRefs = Object.keys(this.fieldLengths), numberOfFields = fieldRefs.length, accumulator = {}, documentsWithField = {};
        for (var i = 0; i < numberOfFields; i++) {
          var fieldRef = lunr6.FieldRef.fromString(fieldRefs[i]), field = fieldRef.fieldName;
          documentsWithField[field] || (documentsWithField[field] = 0);
          documentsWithField[field] += 1;
          accumulator[field] || (accumulator[field] = 0);
          accumulator[field] += this.fieldLengths[fieldRef];
        }
        var fields = Object.keys(this._fields);
        for (var i = 0; i < fields.length; i++) {
          var fieldName = fields[i];
          accumulator[fieldName] = accumulator[fieldName] / documentsWithField[fieldName];
        }
        this.averageFieldLength = accumulator;
      };
      lunr6.Builder.prototype.createFieldVectors = function() {
        var fieldVectors = {}, fieldRefs = Object.keys(this.fieldTermFrequencies), fieldRefsLength = fieldRefs.length, termIdfCache = /* @__PURE__ */ Object.create(null);
        for (var i = 0; i < fieldRefsLength; i++) {
          var fieldRef = lunr6.FieldRef.fromString(fieldRefs[i]), fieldName = fieldRef.fieldName, fieldLength = this.fieldLengths[fieldRef], fieldVector = new lunr6.Vector(), termFrequencies = this.fieldTermFrequencies[fieldRef], terms = Object.keys(termFrequencies), termsLength = terms.length;
          var fieldBoost = this._fields[fieldName].boost || 1, docBoost = this._documents[fieldRef.docRef].boost || 1;
          for (var j = 0; j < termsLength; j++) {
            var term = terms[j], tf = termFrequencies[term], termIndex = this.invertedIndex[term]._index, idf, score, scoreWithPrecision;
            if (termIdfCache[term] === void 0) {
              idf = lunr6.idf(this.invertedIndex[term], this.documentCount);
              termIdfCache[term] = idf;
            } else {
              idf = termIdfCache[term];
            }
            score = idf * ((this._k1 + 1) * tf) / (this._k1 * (1 - this._b + this._b * (fieldLength / this.averageFieldLength[fieldName])) + tf);
            score *= fieldBoost;
            score *= docBoost;
            scoreWithPrecision = Math.round(score * 1e3) / 1e3;
            fieldVector.insert(termIndex, scoreWithPrecision);
          }
          fieldVectors[fieldRef] = fieldVector;
        }
        this.fieldVectors = fieldVectors;
      };
      lunr6.Builder.prototype.createTokenSet = function() {
        this.tokenSet = lunr6.TokenSet.fromArray(
          Object.keys(this.invertedIndex).sort()
        );
      };
      lunr6.Builder.prototype.build = function() {
        this.calculateAverageFieldLengths();
        this.createFieldVectors();
        this.createTokenSet();
        return new lunr6.Index({
          invertedIndex: this.invertedIndex,
          fieldVectors: this.fieldVectors,
          tokenSet: this.tokenSet,
          fields: Object.keys(this._fields),
          pipeline: this.searchPipeline
        });
      };
      lunr6.Builder.prototype.use = function(fn) {
        var args = Array.prototype.slice.call(arguments, 1);
        args.unshift(this);
        fn.apply(this, args);
      };
      lunr6.MatchData = function(term, field, metadata) {
        var clonedMetadata = /* @__PURE__ */ Object.create(null), metadataKeys = Object.keys(metadata || {});
        for (var i = 0; i < metadataKeys.length; i++) {
          var key = metadataKeys[i];
          clonedMetadata[key] = metadata[key].slice();
        }
        this.metadata = /* @__PURE__ */ Object.create(null);
        if (term !== void 0) {
          this.metadata[term] = /* @__PURE__ */ Object.create(null);
          this.metadata[term][field] = clonedMetadata;
        }
      };
      lunr6.MatchData.prototype.combine = function(otherMatchData) {
        var terms = Object.keys(otherMatchData.metadata);
        for (var i = 0; i < terms.length; i++) {
          var term = terms[i], fields = Object.keys(otherMatchData.metadata[term]);
          if (this.metadata[term] == void 0) {
            this.metadata[term] = /* @__PURE__ */ Object.create(null);
          }
          for (var j = 0; j < fields.length; j++) {
            var field = fields[j], keys = Object.keys(otherMatchData.metadata[term][field]);
            if (this.metadata[term][field] == void 0) {
              this.metadata[term][field] = /* @__PURE__ */ Object.create(null);
            }
            for (var k = 0; k < keys.length; k++) {
              var key = keys[k];
              if (this.metadata[term][field][key] == void 0) {
                this.metadata[term][field][key] = otherMatchData.metadata[term][field][key];
              } else {
                this.metadata[term][field][key] = this.metadata[term][field][key].concat(otherMatchData.metadata[term][field][key]);
              }
            }
          }
        }
      };
      lunr6.MatchData.prototype.add = function(term, field, metadata) {
        if (!(term in this.metadata)) {
          this.metadata[term] = /* @__PURE__ */ Object.create(null);
          this.metadata[term][field] = metadata;
          return;
        }
        if (!(field in this.metadata[term])) {
          this.metadata[term][field] = metadata;
          return;
        }
        var metadataKeys = Object.keys(metadata);
        for (var i = 0; i < metadataKeys.length; i++) {
          var key = metadataKeys[i];
          if (key in this.metadata[term][field]) {
            this.metadata[term][field][key] = this.metadata[term][field][key].concat(metadata[key]);
          } else {
            this.metadata[term][field][key] = metadata[key];
          }
        }
      };
      lunr6.Query = function(allFields) {
        this.clauses = [];
        this.allFields = allFields;
      };
      lunr6.Query.wildcard = new String("*");
      lunr6.Query.wildcard.NONE = 0;
      lunr6.Query.wildcard.LEADING = 1;
      lunr6.Query.wildcard.TRAILING = 2;
      lunr6.Query.presence = {
        OPTIONAL: 1,
        REQUIRED: 2,
        PROHIBITED: 3
      };
      lunr6.Query.prototype.clause = function(clause) {
        if (!("fields" in clause)) {
          clause.fields = this.allFields;
        }
        if (!("boost" in clause)) {
          clause.boost = 1;
        }
        if (!("usePipeline" in clause)) {
          clause.usePipeline = true;
        }
        if (!("wildcard" in clause)) {
          clause.wildcard = lunr6.Query.wildcard.NONE;
        }
        if (clause.wildcard & lunr6.Query.wildcard.LEADING && clause.term.charAt(0) != lunr6.Query.wildcard) {
          clause.term = "*" + clause.term;
        }
        if (clause.wildcard & lunr6.Query.wildcard.TRAILING && clause.term.slice(-1) != lunr6.Query.wildcard) {
          clause.term = "" + clause.term + "*";
        }
        if (!("presence" in clause)) {
          clause.presence = lunr6.Query.presence.OPTIONAL;
        }
        this.clauses.push(clause);
        return this;
      };
      lunr6.Query.prototype.isNegated = function() {
        for (var i = 0; i < this.clauses.length; i++) {
          if (this.clauses[i].presence != lunr6.Query.presence.PROHIBITED) {
            return false;
          }
        }
        return true;
      };
      lunr6.Query.prototype.term = function(term, options) {
        if (Array.isArray(term)) {
          term.forEach(function(t) {
            this.term(t, lunr6.utils.clone(options));
          }, this);
          return this;
        }
        var clause = options || {};
        clause.term = term.toString();
        this.clause(clause);
        return this;
      };
      lunr6.QueryParseError = function(message, start, end) {
        this.name = "QueryParseError";
        this.message = message;
        this.start = start;
        this.end = end;
      };
      lunr6.QueryParseError.prototype = new Error();
      lunr6.QueryLexer = function(str) {
        this.lexemes = [];
        this.str = str;
        this.length = str.length;
        this.pos = 0;
        this.start = 0;
        this.escapeCharPositions = [];
      };
      lunr6.QueryLexer.prototype.run = function() {
        var state = lunr6.QueryLexer.lexText;
        while (state) {
          state = state(this);
        }
      };
      lunr6.QueryLexer.prototype.sliceString = function() {
        var subSlices = [], sliceStart = this.start, sliceEnd = this.pos;
        for (var i = 0; i < this.escapeCharPositions.length; i++) {
          sliceEnd = this.escapeCharPositions[i];
          subSlices.push(this.str.slice(sliceStart, sliceEnd));
          sliceStart = sliceEnd + 1;
        }
        subSlices.push(this.str.slice(sliceStart, this.pos));
        this.escapeCharPositions.length = 0;
        return subSlices.join("");
      };
      lunr6.QueryLexer.prototype.emit = function(type) {
        this.lexemes.push({
          type,
          str: this.sliceString(),
          start: this.start,
          end: this.pos
        });
        this.start = this.pos;
      };
      lunr6.QueryLexer.prototype.escapeCharacter = function() {
        this.escapeCharPositions.push(this.pos - 1);
        this.pos += 1;
      };
      lunr6.QueryLexer.prototype.next = function() {
        if (this.pos >= this.length) {
          return lunr6.QueryLexer.EOS;
        }
        var char = this.str.charAt(this.pos);
        this.pos += 1;
        return char;
      };
      lunr6.QueryLexer.prototype.width = function() {
        return this.pos - this.start;
      };
      lunr6.QueryLexer.prototype.ignore = function() {
        if (this.start == this.pos) {
          this.pos += 1;
        }
        this.start = this.pos;
      };
      lunr6.QueryLexer.prototype.backup = function() {
        this.pos -= 1;
      };
      lunr6.QueryLexer.prototype.acceptDigitRun = function() {
        var char, charCode;
        do {
          char = this.next();
          charCode = char.charCodeAt(0);
        } while (charCode > 47 && charCode < 58);
        if (char != lunr6.QueryLexer.EOS) {
          this.backup();
        }
      };
      lunr6.QueryLexer.prototype.more = function() {
        return this.pos < this.length;
      };
      lunr6.QueryLexer.EOS = "EOS";
      lunr6.QueryLexer.FIELD = "FIELD";
      lunr6.QueryLexer.TERM = "TERM";
      lunr6.QueryLexer.EDIT_DISTANCE = "EDIT_DISTANCE";
      lunr6.QueryLexer.BOOST = "BOOST";
      lunr6.QueryLexer.PRESENCE = "PRESENCE";
      lunr6.QueryLexer.lexField = function(lexer) {
        lexer.backup();
        lexer.emit(lunr6.QueryLexer.FIELD);
        lexer.ignore();
        return lunr6.QueryLexer.lexText;
      };
      lunr6.QueryLexer.lexTerm = function(lexer) {
        if (lexer.width() > 1) {
          lexer.backup();
          lexer.emit(lunr6.QueryLexer.TERM);
        }
        lexer.ignore();
        if (lexer.more()) {
          return lunr6.QueryLexer.lexText;
        }
      };
      lunr6.QueryLexer.lexEditDistance = function(lexer) {
        lexer.ignore();
        lexer.acceptDigitRun();
        lexer.emit(lunr6.QueryLexer.EDIT_DISTANCE);
        return lunr6.QueryLexer.lexText;
      };
      lunr6.QueryLexer.lexBoost = function(lexer) {
        lexer.ignore();
        lexer.acceptDigitRun();
        lexer.emit(lunr6.QueryLexer.BOOST);
        return lunr6.QueryLexer.lexText;
      };
      lunr6.QueryLexer.lexEOS = function(lexer) {
        if (lexer.width() > 0) {
          lexer.emit(lunr6.QueryLexer.TERM);
        }
      };
      lunr6.QueryLexer.termSeparator = lunr6.tokenizer.separator;
      lunr6.QueryLexer.lexText = function(lexer) {
        while (true) {
          var char = lexer.next();
          if (char == lunr6.QueryLexer.EOS) {
            return lunr6.QueryLexer.lexEOS;
          }
          if (char.charCodeAt(0) == 92) {
            lexer.escapeCharacter();
            continue;
          }
          if (char == ":") {
            return lunr6.QueryLexer.lexField;
          }
          if (char == "~") {
            lexer.backup();
            if (lexer.width() > 0) {
              lexer.emit(lunr6.QueryLexer.TERM);
            }
            return lunr6.QueryLexer.lexEditDistance;
          }
          if (char == "^") {
            lexer.backup();
            if (lexer.width() > 0) {
              lexer.emit(lunr6.QueryLexer.TERM);
            }
            return lunr6.QueryLexer.lexBoost;
          }
          if (char == "+" && lexer.width() === 1) {
            lexer.emit(lunr6.QueryLexer.PRESENCE);
            return lunr6.QueryLexer.lexText;
          }
          if (char == "-" && lexer.width() === 1) {
            lexer.emit(lunr6.QueryLexer.PRESENCE);
            return lunr6.QueryLexer.lexText;
          }
          if (char.match(lunr6.QueryLexer.termSeparator)) {
            return lunr6.QueryLexer.lexTerm;
          }
        }
      };
      lunr6.QueryParser = function(str, query) {
        this.lexer = new lunr6.QueryLexer(str);
        this.query = query;
        this.currentClause = {};
        this.lexemeIdx = 0;
      };
      lunr6.QueryParser.prototype.parse = function() {
        this.lexer.run();
        this.lexemes = this.lexer.lexemes;
        var state = lunr6.QueryParser.parseClause;
        while (state) {
          state = state(this);
        }
        return this.query;
      };
      lunr6.QueryParser.prototype.peekLexeme = function() {
        return this.lexemes[this.lexemeIdx];
      };
      lunr6.QueryParser.prototype.consumeLexeme = function() {
        var lexeme = this.peekLexeme();
        this.lexemeIdx += 1;
        return lexeme;
      };
      lunr6.QueryParser.prototype.nextClause = function() {
        var completedClause = this.currentClause;
        this.query.clause(completedClause);
        this.currentClause = {};
      };
      lunr6.QueryParser.parseClause = function(parser) {
        var lexeme = parser.peekLexeme();
        if (lexeme == void 0) {
          return;
        }
        switch (lexeme.type) {
          case lunr6.QueryLexer.PRESENCE:
            return lunr6.QueryParser.parsePresence;
          case lunr6.QueryLexer.FIELD:
            return lunr6.QueryParser.parseField;
          case lunr6.QueryLexer.TERM:
            return lunr6.QueryParser.parseTerm;
          default:
            var errorMessage = "expected either a field or a term, found " + lexeme.type;
            if (lexeme.str.length >= 1) {
              errorMessage += " with value '" + lexeme.str + "'";
            }
            throw new lunr6.QueryParseError(errorMessage, lexeme.start, lexeme.end);
        }
      };
      lunr6.QueryParser.parsePresence = function(parser) {
        var lexeme = parser.consumeLexeme();
        if (lexeme == void 0) {
          return;
        }
        switch (lexeme.str) {
          case "-":
            parser.currentClause.presence = lunr6.Query.presence.PROHIBITED;
            break;
          case "+":
            parser.currentClause.presence = lunr6.Query.presence.REQUIRED;
            break;
          default:
            var errorMessage = "unrecognised presence operator'" + lexeme.str + "'";
            throw new lunr6.QueryParseError(errorMessage, lexeme.start, lexeme.end);
        }
        var nextLexeme = parser.peekLexeme();
        if (nextLexeme == void 0) {
          var errorMessage = "expecting term or field, found nothing";
          throw new lunr6.QueryParseError(errorMessage, lexeme.start, lexeme.end);
        }
        switch (nextLexeme.type) {
          case lunr6.QueryLexer.FIELD:
            return lunr6.QueryParser.parseField;
          case lunr6.QueryLexer.TERM:
            return lunr6.QueryParser.parseTerm;
          default:
            var errorMessage = "expecting term or field, found '" + nextLexeme.type + "'";
            throw new lunr6.QueryParseError(errorMessage, nextLexeme.start, nextLexeme.end);
        }
      };
      lunr6.QueryParser.parseField = function(parser) {
        var lexeme = parser.consumeLexeme();
        if (lexeme == void 0) {
          return;
        }
        if (parser.query.allFields.indexOf(lexeme.str) == -1) {
          var possibleFields = parser.query.allFields.map(function(f) {
            return "'" + f + "'";
          }).join(", "), errorMessage = "unrecognised field '" + lexeme.str + "', possible fields: " + possibleFields;
          throw new lunr6.QueryParseError(errorMessage, lexeme.start, lexeme.end);
        }
        parser.currentClause.fields = [lexeme.str];
        var nextLexeme = parser.peekLexeme();
        if (nextLexeme == void 0) {
          var errorMessage = "expecting term, found nothing";
          throw new lunr6.QueryParseError(errorMessage, lexeme.start, lexeme.end);
        }
        switch (nextLexeme.type) {
          case lunr6.QueryLexer.TERM:
            return lunr6.QueryParser.parseTerm;
          default:
            var errorMessage = "expecting term, found '" + nextLexeme.type + "'";
            throw new lunr6.QueryParseError(errorMessage, nextLexeme.start, nextLexeme.end);
        }
      };
      lunr6.QueryParser.parseTerm = function(parser) {
        var lexeme = parser.consumeLexeme();
        if (lexeme == void 0) {
          return;
        }
        parser.currentClause.term = lexeme.str.toLowerCase();
        if (lexeme.str.indexOf("*") != -1) {
          parser.currentClause.usePipeline = false;
        }
        var nextLexeme = parser.peekLexeme();
        if (nextLexeme == void 0) {
          parser.nextClause();
          return;
        }
        switch (nextLexeme.type) {
          case lunr6.QueryLexer.TERM:
            parser.nextClause();
            return lunr6.QueryParser.parseTerm;
          case lunr6.QueryLexer.FIELD:
            parser.nextClause();
            return lunr6.QueryParser.parseField;
          case lunr6.QueryLexer.EDIT_DISTANCE:
            return lunr6.QueryParser.parseEditDistance;
          case lunr6.QueryLexer.BOOST:
            return lunr6.QueryParser.parseBoost;
          case lunr6.QueryLexer.PRESENCE:
            parser.nextClause();
            return lunr6.QueryParser.parsePresence;
          default:
            var errorMessage = "Unexpected lexeme type '" + nextLexeme.type + "'";
            throw new lunr6.QueryParseError(errorMessage, nextLexeme.start, nextLexeme.end);
        }
      };
      lunr6.QueryParser.parseEditDistance = function(parser) {
        var lexeme = parser.consumeLexeme();
        if (lexeme == void 0) {
          return;
        }
        var editDistance = parseInt(lexeme.str, 10);
        if (isNaN(editDistance)) {
          var errorMessage = "edit distance must be numeric";
          throw new lunr6.QueryParseError(errorMessage, lexeme.start, lexeme.end);
        }
        parser.currentClause.editDistance = editDistance;
        var nextLexeme = parser.peekLexeme();
        if (nextLexeme == void 0) {
          parser.nextClause();
          return;
        }
        switch (nextLexeme.type) {
          case lunr6.QueryLexer.TERM:
            parser.nextClause();
            return lunr6.QueryParser.parseTerm;
          case lunr6.QueryLexer.FIELD:
            parser.nextClause();
            return lunr6.QueryParser.parseField;
          case lunr6.QueryLexer.EDIT_DISTANCE:
            return lunr6.QueryParser.parseEditDistance;
          case lunr6.QueryLexer.BOOST:
            return lunr6.QueryParser.parseBoost;
          case lunr6.QueryLexer.PRESENCE:
            parser.nextClause();
            return lunr6.QueryParser.parsePresence;
          default:
            var errorMessage = "Unexpected lexeme type '" + nextLexeme.type + "'";
            throw new lunr6.QueryParseError(errorMessage, nextLexeme.start, nextLexeme.end);
        }
      };
      lunr6.QueryParser.parseBoost = function(parser) {
        var lexeme = parser.consumeLexeme();
        if (lexeme == void 0) {
          return;
        }
        var boost = parseInt(lexeme.str, 10);
        if (isNaN(boost)) {
          var errorMessage = "boost must be numeric";
          throw new lunr6.QueryParseError(errorMessage, lexeme.start, lexeme.end);
        }
        parser.currentClause.boost = boost;
        var nextLexeme = parser.peekLexeme();
        if (nextLexeme == void 0) {
          parser.nextClause();
          return;
        }
        switch (nextLexeme.type) {
          case lunr6.QueryLexer.TERM:
            parser.nextClause();
            return lunr6.QueryParser.parseTerm;
          case lunr6.QueryLexer.FIELD:
            parser.nextClause();
            return lunr6.QueryParser.parseField;
          case lunr6.QueryLexer.EDIT_DISTANCE:
            return lunr6.QueryParser.parseEditDistance;
          case lunr6.QueryLexer.BOOST:
            return lunr6.QueryParser.parseBoost;
          case lunr6.QueryLexer.PRESENCE:
            parser.nextClause();
            return lunr6.QueryParser.parsePresence;
          default:
            var errorMessage = "Unexpected lexeme type '" + nextLexeme.type + "'";
            throw new lunr6.QueryParseError(errorMessage, nextLexeme.start, nextLexeme.end);
        }
      };
      (function(root, factory) {
        if (typeof define === "function" && define.amd) {
          define(factory);
        } else if (typeof exports === "object") {
          module.exports = factory();
        } else {
          root.lunr = factory();
        }
      })(this, function() {
        return lunr6;
      });
    })();
  }
});

// node_modules/promise-worker-bi/dist/esmodules.js
var messageIDs = 0;
var MSGTYPE_QUERY = 0;
var MSGTYPE_RESPONSE = 1;
var MSGTYPE_HOST_ID = 2;
var MSGTYPE_HOST_CLOSE = 3;
var MSGTYPE_WORKER_ERROR = 4;
var MSGTYPES = [MSGTYPE_QUERY, MSGTYPE_RESPONSE, MSGTYPE_HOST_ID, MSGTYPE_HOST_CLOSE, MSGTYPE_WORKER_ERROR];
var isPromise = (obj) => !!obj && (typeof obj === "object" || typeof obj === "function") && typeof obj.then === "function";
var toFakeError = (error) => {
  const fakeError = {
    name: error.name,
    message: error.message
  };
  if (typeof error.stack === "string") {
    fakeError.stack = error.stack;
  }
  if (typeof error.fileName === "string") {
    fakeError.fileName = error.fileName;
  }
  if (typeof error.columnNumber === "number") {
    fakeError.columnNumber = error.columnNumber;
  }
  if (typeof error.lineNumber === "number") {
    fakeError.lineNumber = error.lineNumber;
  }
  return fakeError;
};
var fromFakeError = (fakeError) => {
  const error = new Error();
  return Object.assign(error, fakeError);
};
var logError = (err) => {
  console.error("Error in Worker:");
  console.error(err);
};
var PWBBase = class {
  constructor() {
    this._callbacks = /* @__PURE__ */ new Map();
    this._queryCallback = () => {
    };
    this._onMessage = this._onMessage.bind(this);
  }
  register(cb) {
    this._queryCallback = cb;
  }
  _postMessage(obj, targetHostID) {
    throw new Error("Not implemented");
  }
  _postResponse(messageID, error, result, hostID) {
    if (error) {
      logError(error);
      this._postMessage([MSGTYPE_RESPONSE, messageID, toFakeError(error)], hostID);
    } else {
      this._postMessage([MSGTYPE_RESPONSE, messageID, null, result], hostID);
    }
  }
  _handleQuery(messageID, query, hostID) {
    try {
      const result = this._queryCallback(query, hostID);
      if (!isPromise(result)) {
        this._postResponse(messageID, null, result, hostID);
      } else {
        result.then((finalResult) => {
          this._postResponse(messageID, null, finalResult, hostID);
        }, (finalError) => {
          this._postResponse(messageID, finalError, hostID);
        });
      }
    } catch (err) {
      this._postResponse(messageID, err);
    }
  }
  _onMessageCommon(e) {
    const message = e.data;
    if (!Array.isArray(message) || message.length < 3 || message.length > 4) {
      return;
    }
    if (typeof message[0] !== "number" || MSGTYPES.indexOf(message[0]) < 0) {
      throw new Error("Invalid messageID");
    }
    const type = message[0];
    if (typeof message[1] !== "number") {
      throw new Error("Invalid messageID");
    }
    const messageID = message[1];
    if (type === MSGTYPE_QUERY) {
      const query = message[2];
      if (typeof message[3] !== "number" && message[3] !== void 0) {
        throw new Error("Invalid hostID");
      }
      const hostID = message[3];
      this._handleQuery(messageID, query, hostID);
      return;
    }
    if (type === MSGTYPE_RESPONSE) {
      if (message[2] !== null && typeof message[2] !== "object") {
        throw new Error("Invalid error");
      }
      const error = message[2] === null ? null : fromFakeError(message[2]);
      const result = message[3];
      const callback = this._callbacks.get(messageID);
      if (callback === void 0) {
        return;
      }
      this._callbacks.delete(messageID);
      callback(error, result);
      return;
    }
    return {
      message,
      type
    };
  }
};
var PWBWorker = class extends PWBBase {
  constructor() {
    super();
    this._hosts = /* @__PURE__ */ new Map();
    this._maxHostID = -1;
    if (typeof SharedWorkerGlobalScope !== "undefined" && self instanceof SharedWorkerGlobalScope) {
      this._workerType = "SharedWorker";
      self.addEventListener("connect", (e) => {
        const port = e.ports[0];
        port.addEventListener("message", (e22) => this._onMessage(e22));
        port.start();
        this._maxHostID += 1;
        const hostID = this._maxHostID;
        this._hosts.set(hostID, {
          port
        });
        this._postMessage([MSGTYPE_HOST_ID, -1, hostID], hostID);
      });
      self.addEventListener("error", (e) => {
        logError(e.error);
        const hostID = this._hosts.keys().next().value;
        if (hostID !== void 0) {
          this._postMessage([MSGTYPE_WORKER_ERROR, -1, toFakeError(e.error)], hostID);
        }
      });
    } else {
      this._workerType = "Worker";
      self.addEventListener("message", this._onMessage);
      this._postMessage([MSGTYPE_HOST_ID, -1, 0], 0);
      self.addEventListener("error", (e) => {
        logError(e.error);
        this._postMessage([MSGTYPE_WORKER_ERROR, -1, toFakeError(e.error)]);
      });
    }
  }
  _postMessage(obj, targetHostID) {
    if (this._workerType === "SharedWorker") {
      this._hosts.forEach(({
        port
      }, hostID) => {
        if (targetHostID === void 0 || targetHostID === hostID) {
          port.postMessage(obj);
        }
      });
    } else if (this._workerType === "Worker") {
      self.postMessage(obj);
    } else {
      throw new Error("WTF");
    }
  }
  postMessage(userMessage, targetHostID) {
    const actuallyPostMessage = (resolve, reject) => {
      const messageID = messageIDs;
      messageIDs += 1;
      const messageToSend = [MSGTYPE_QUERY, messageID, userMessage];
      this._callbacks.set(messageID, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
      this._postMessage(messageToSend, targetHostID);
    };
    return new Promise((resolve, reject) => {
      actuallyPostMessage(resolve, reject);
    });
  }
  _onMessage(e) {
    const common = this._onMessageCommon(e);
    if (!common) {
      return;
    }
    const message = common.message, type = common.type;
    if (type === MSGTYPE_HOST_CLOSE) {
      if (typeof message[2] !== "number") {
        throw new Error("Invalid hostID");
      }
      const hostID = message[2];
      this._hosts.delete(hostID);
    }
  }
};

// src/hymnsDb/hymns-db-abstract.js
var helperOptions = [
  {
    id: "hymnsDb",
    functionNames: ["awaitReady"]
  },
  {
    id: "hymnals",
    progressProp: "hymnals",
    functionNames: ["getHymnals", "getHymnal", "cacheHymnalUrls"],
    objType: "HymnalBuilder"
  },
  {
    id: "hymns",
    dependsOn: ["hymnals"],
    functionNames: ["getHymns", "getAllHymns", "cacheHymnUrls"],
    objType: "HymnsBuilder"
  },
  {
    id: "hymnalSections",
    progressProp: "hymns",
    functionNames: ["getHymnalSections"],
    dependsOn: ["hymnals", "hymns"],
    objType: "HymnalSectionBuilder"
  },
  {
    id: "search",
    progressProp: "search",
    functionNames: ["search"],
    dependsOn: ["hymns"],
    objType: "SearchBuilder"
  }
];
var HymnsDbAbstract = class {
  static hymnCompare(a, b) {
    let result = 0;
    if (result == 0 && a.hymnal && b.hymnal)
      result = a.hymnal.priority - b.hymnal.priority;
    if (result == 0)
      result = a.hymnNo - b.hymnNo;
    if (result == 0)
      result = a.hymnNoTxt - b.hymnNoTxt;
    if (result == 0)
      result = a.suffix - b.suffix;
    return result;
  }
  static hymnCompareAlpha(a, b) {
    return a.title.localeCompare(b.title, void 0, { sensitivity: "base" });
  }
  static get helperOptions() {
    return helperOptions;
  }
  static getExposedPromise() {
    let resolve, reject;
    let promise = new Promise((fnResolve, fnReject) => {
      resolve = fnResolve;
      reject = fnReject;
    });
    Object.assign(promise, { resolve, reject });
    return promise;
  }
};
var hymns_db_abstract_default = HymnsDbAbstract;

// src/assets/hymnals.json
var hymnals_default = [
  {
    hymnalId: "redbook",
    priority: 1,
    title: "Great Hymns of the Faith",
    sections: [
      { name: "Hymns of Worship", range: [1, 82], children: [
        { name: "The Father", range: [34, 40] },
        { name: "Christ", range: [41, 67] },
        { name: "Lord's Day", range: [68, 69] },
        { name: "Morning", range: [70, 73] },
        { name: "Evening", range: [74, 79] },
        { name: "Closing", range: [80, 82] }
      ] },
      { name: "Jesus our Savior", children: [
        { name: "Advent", range: [83, 84] },
        { name: "Birth", range: [85, 101] },
        { name: "Early Ministry", range: [102, 106] },
        { name: "Triumphal Entry", range: [107, 109] },
        { name: "Suffering and Death", range: [110, 130] },
        { name: "Resurrection", range: [131, 138] },
        { name: "Ascension and Reign", range: [139, 145] },
        { name: "Return", range: [146, 157] }
      ] },
      { name: "The Holy Spirit", range: [158, 171] },
      { name: "The Word of God", range: [172, 179] },
      { name: "The Church", range: [180, 193], children: [
        { name: "Baptism", range: [189, 190] },
        { name: "The Lord's Supper", range: [191, 193] }
      ] },
      { name: "Salvation", range: [194, 236] },
      { name: "Invitation", range: [237, 254] },
      { name: "Assurance and Trust", range: [255, 283] },
      { name: "Peace and Comfort", range: [284, 289] },
      { name: "Guidance and Care", range: [290, 305] },
      { name: "Aspiration", range: [306, 343] },
      { name: "Prayer", range: [344, 362] },
      { name: "Challenge", range: [363, 382] },
      { name: "Commitment", range: [383, 401] },
      { name: "Christian Warfare", range: [402, 415] },
      { name: "Service", range: [416, 440] },
      { name: "Praise and Testimony", range: [441, 496] },
      { name: "Eternal Destiny", range: [497, 518] },
      { name: "Special Subjects", children: [
        { name: "New Year", range: [519, 520] },
        { name: "Home and Family", range: [521, 525] },
        { name: "Thanksgiving", range: [526, 527] },
        { name: "The Nation", range: [528, 532] }
      ] },
      { name: "Service Music", range: [533, 538] }
    ]
  },
  {
    hymnalId: "supplement",
    priority: 2,
    title: "Supplement"
  },
  {
    hymnalId: "missions",
    priority: 3,
    title: "Songs for World Evangelism"
  }
];

// src/hymnsDb/builders/hymnal-builder.js
var hymnals = hymnals_default.reduce((map2, h) => {
  map2.set(h.hymnalId, h);
  return map2;
}, /* @__PURE__ */ new Map());
var HymnalBuilder = class {
  static async build(hymnsDbInstance2) {
    hymnsDbInstance2.getHymnals = function() {
      return hymnals;
    };
    hymnsDbInstance2.getHymnal = function(hymnalId) {
      return hymnals.get(hymnalId);
    };
    hymnsDbInstance2.cacheHymnalUrls = function(hymnalUrls) {
      for (let hymnal of hymnals.values()) {
        hymnal.url = hymnalUrls.get(hymnal.hymnalId);
      }
    };
  }
};
__publicField(HymnalBuilder, "functions", ["getHymnals", "getHymnal", "cacheHymnalUrls"]);
var hymnal_builder_default = HymnalBuilder;

// node_modules/idb-keyval/dist/index.js
function promisifyRequest(request) {
  return new Promise((resolve, reject) => {
    request.oncomplete = request.onsuccess = () => resolve(request.result);
    request.onabort = request.onerror = () => reject(request.error);
  });
}
function createStore(dbName, storeName) {
  const request = indexedDB.open(dbName);
  request.onupgradeneeded = () => request.result.createObjectStore(storeName);
  const dbp = promisifyRequest(request);
  return (txMode, callback) => dbp.then((db) => callback(db.transaction(storeName, txMode).objectStore(storeName)));
}
var defaultGetStoreFunc;
function defaultGetStore() {
  if (!defaultGetStoreFunc) {
    defaultGetStoreFunc = createStore("keyval-store", "keyval");
  }
  return defaultGetStoreFunc;
}
function setMany(entries, customStore = defaultGetStore()) {
  return customStore("readwrite", (store) => {
    entries.forEach((entry) => store.put(entry[1], entry[0]));
    return promisifyRequest(store.transaction);
  });
}
function getMany(keys, customStore = defaultGetStore()) {
  return customStore("readonly", (store) => Promise.all(keys.map((key) => promisifyRequest(store.get(key)))));
}

// src/hymnsDb/builders/hymns-builder.js
var hymnArray;
var hymns;
var HymnsBuilder = class {
  static async build(hymnsDbInstance2, router) {
    hymnArray = hymnArray || await loadHymnArray();
    hymns = hymns || buildHymnsObject();
    let hymnals2 = hymnsDbInstance2.getHymnals();
    for (let hymnal of hymnals2.values()) {
      getHymns(hymnal.hymnalId).forEach((h) => h.hymnal = hymnal);
    }
    hymnsDbInstance2.getHymns = getHymns;
    hymnsDbInstance2.getAllHymns = function() {
      return hymns;
    };
    hymnsDbInstance2.cacheHymnUrls = function(hymnUrls) {
      for (let hymn of hymnArray) {
        hymn.url = hymnUrls.get(hymn.hymnId);
      }
    };
  }
};
__publicField(HymnsBuilder, "functions", ["getHymns", "getAllHymns", "cacheHymnUrls"]);
var arrayUrl = new URL("../../assets/hymns-db-data.json", import.meta.url);
var versionUrl = new URL("../../assets/hymns-db-version.txt", import.meta.url);
async function loadHymnArray() {
  const arrayAbortController = new AbortController();
  const [cachedVersion, cachedArrayString] = await getMany([versionUrl.toString(), arrayUrl.toString()]);
  async function storeText(version, arrayString) {
    await setMany([
      [versionUrl.toString(), version],
      [arrayUrl.toString(), arrayString]
    ]);
    console.log("stored hymnsArray version", version);
  }
  let fetchedVersionPromise = fetchString(versionUrl, void 0, 2);
  fetchedVersionPromise.catch((e) => console.log("Error fetching hymns version", e));
  let fetchedArrayPromise = fetchString(arrayUrl, { signal: arrayAbortController.signal }, 2);
  fetchedArrayPromise.catch((e) => console.log("Error fetching hymns array", e));
  let resultPromise = getExposedPromise();
  if (!cachedVersion || !cachedArrayString) {
    let fetchedArrayString = await fetchedArrayPromise;
    resultPromise.resolve(JSON.parse(fetchedArrayString));
    fetchedVersionPromise.then((fetchedVersion) => storeText(fetchedVersion, fetchedArrayString));
  } else {
    let cachedArray;
    try {
      cachedArray = JSON.parse(cachedArrayString);
      cachedArray = Array.isArray(cachedArray) && cachedArray.length ? cachedArray : void 0;
    } catch {
    }
    fetchedVersionPromise.then((fetchedVersion) => {
      if (cachedArray && fetchedVersion == cachedVersion) {
        arrayAbortController.abort();
        console.log("returned cachedArray");
        resultPromise.resolve(cachedArray);
      }
    });
    fetchedArrayPromise.then((fetchedArrayString) => {
      if (arrayAbortController.signal.aborted) {
        console.log("aborted fetchArray");
        return;
      }
      console.log("returned fetchedArray");
      resultPromise.resolve(JSON.parse(fetchedArrayString));
    }).catch((e) => {
      if (cachedArray) {
        console.log("Error parsing fetched hymns array; returning cached version", e);
        resultPromise.resolve(cachedArray);
      } else {
        resultPromise.reject(e);
      }
    });
  }
  return await resultPromise;
}
async function fetchString(url, options, retryCount) {
  retryCount = retryCount || 0;
  try {
    let response = await fetch(url, options);
    if (!response.ok) {
      if (retryCount > 0) {
        await new Promise((r) => setTimeout(r, Math.max(100, 1e3 / retryCount)));
        return await fetchString(url, options, retryCount - 1);
      }
      throw new Error("Unable to fetch", url.toString(), response.status, response.statusText);
    }
    return await response.text();
  } catch (e) {
    if (e.name == "AbortError")
      return "";
    throw e;
  }
}
function buildHymnsObject() {
  hymns = /* @__PURE__ */ new Map();
  for (let hymn of hymnArray) {
    let idComponents = hymn.hymnId.split("-");
    hymn.hymnalId = idComponents[0];
    hymn.hymnNo = parseInt(idComponents[1]);
    if (idComponents[2])
      hymn.suffix = idComponents[2];
    hymn.hymnNoTxt = hymn.hymnNo.toString() + (hymn.suffix || "");
    delete hymn.modifiedDate;
    hymns.set(hymn.hymnId, hymn);
  }
  for (let hymn of hymns.values()) {
    if (hymn.isStub)
      continue;
    let hymnPlusOne = findHymnPlusN(hymn, 1);
    if (hymnPlusOne)
      continue;
    let hymnPlusTwo = findHymnPlusN(hymn, 2);
    if (!hymnPlusTwo)
      continue;
    let stubHymnNo = `${(hymn.hymnNo + 1).toString() + (hymn.suffix || "")}`;
    hymn.hymnNoTxt = `${hymn.hymnNoTxt}/${stubHymnNo}`;
    let stubHymnId = `${hymn.hymnalId}-${stubHymnNo}`;
    hymns.set(stubHymnId, {
      hymnId: stubHymnId,
      hymnal: hymn.hymnalId,
      hymnNo: hymn.hymnNo + 1,
      hymnNoTxt: hymn.hymnNoTxt,
      suffix: hymn.suffix,
      title: hymn.title,
      isStub: true
    });
  }
  return hymns;
}
function findHymnPlusN(hymn, n) {
  let hymnNoPlusN = hymn.hymnNo + n;
  let likelyId = `${hymn.hymnalId}-${hymnNoPlusN}`;
  let hymnPlusN = hymns[likelyId];
  if (!hymnPlusN)
    hymnPlusN = hymnArray.find((h) => h.hymnalId == hymn.hymnalId && h.hymnNo == hymnNoPlusN);
  return hymnPlusN;
}
function getHymns() {
  let params = [];
  for (let arg of [...arguments].filter((a) => a)) {
    if (typeof arg == "number") {
      params.push(arg);
    } else if (typeof arg == "string") {
      let intArg = parseInt(arg);
      if (intArg.toString() == arg) {
        params.push(intArg);
      } else {
        params.push(arg);
      }
    }
  }
  let results = [...hymns.values()];
  for (let param of params) {
    results = results.filter((h) => h.hymnalId == param || h.hymnNo == param || h.suffix == param);
  }
  results.sort(hymns_db_abstract_default.hymnCompare);
  return results;
}
function getExposedPromise() {
  let resolve, reject;
  let promise = new Promise((fnResolve, fnReject) => {
    resolve = fnResolve;
    reject = fnReject;
  });
  Object.assign(promise, { resolve, reject });
  return promise;
}
var hymns_builder_default = HymnsBuilder;

// node_modules/d3-array/src/ascending.js
function ascending(a, b) {
  return a == null || b == null ? NaN : a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
}

// node_modules/d3-array/src/descending.js
function descending(a, b) {
  return a == null || b == null ? NaN : b < a ? -1 : b > a ? 1 : b >= a ? 0 : NaN;
}

// node_modules/d3-array/src/bisector.js
function bisector(f) {
  let compare1, compare2, delta;
  if (f.length !== 2) {
    compare1 = ascending;
    compare2 = (d, x) => ascending(f(d), x);
    delta = (d, x) => f(d) - x;
  } else {
    compare1 = f === ascending || f === descending ? f : zero;
    compare2 = f;
    delta = f;
  }
  function left(a, x, lo = 0, hi = a.length) {
    if (lo < hi) {
      if (compare1(x, x) !== 0)
        return hi;
      do {
        const mid = lo + hi >>> 1;
        if (compare2(a[mid], x) < 0)
          lo = mid + 1;
        else
          hi = mid;
      } while (lo < hi);
    }
    return lo;
  }
  function right(a, x, lo = 0, hi = a.length) {
    if (lo < hi) {
      if (compare1(x, x) !== 0)
        return hi;
      do {
        const mid = lo + hi >>> 1;
        if (compare2(a[mid], x) <= 0)
          lo = mid + 1;
        else
          hi = mid;
      } while (lo < hi);
    }
    return lo;
  }
  function center(a, x, lo = 0, hi = a.length) {
    const i = left(a, x, lo, hi - 1);
    return i > lo && delta(a[i - 1], x) > -delta(a[i], x) ? i - 1 : i;
  }
  return { left, center, right };
}
function zero() {
  return 0;
}

// node_modules/d3-array/src/number.js
function number(x) {
  return x === null ? NaN : +x;
}

// node_modules/d3-array/src/bisect.js
var ascendingBisect = bisector(ascending);
var bisectRight = ascendingBisect.right;
var bisectLeft = ascendingBisect.left;
var bisectCenter = bisector(number).center;
var bisect_default = bisectRight;

// node_modules/d3-array/src/ticks.js
var e10 = Math.sqrt(50);
var e5 = Math.sqrt(10);
var e2 = Math.sqrt(2);
function ticks(start, stop, count) {
  var reverse, i = -1, n, ticks2, step;
  stop = +stop, start = +start, count = +count;
  if (start === stop && count > 0)
    return [start];
  if (reverse = stop < start)
    n = start, start = stop, stop = n;
  if ((step = tickIncrement(start, stop, count)) === 0 || !isFinite(step))
    return [];
  if (step > 0) {
    let r0 = Math.round(start / step), r1 = Math.round(stop / step);
    if (r0 * step < start)
      ++r0;
    if (r1 * step > stop)
      --r1;
    ticks2 = new Array(n = r1 - r0 + 1);
    while (++i < n)
      ticks2[i] = (r0 + i) * step;
  } else {
    step = -step;
    let r0 = Math.round(start * step), r1 = Math.round(stop * step);
    if (r0 / step < start)
      ++r0;
    if (r1 / step > stop)
      --r1;
    ticks2 = new Array(n = r1 - r0 + 1);
    while (++i < n)
      ticks2[i] = (r0 + i) / step;
  }
  if (reverse)
    ticks2.reverse();
  return ticks2;
}
function tickIncrement(start, stop, count) {
  var step = (stop - start) / Math.max(0, count), power = Math.floor(Math.log(step) / Math.LN10), error = step / Math.pow(10, power);
  return power >= 0 ? (error >= e10 ? 10 : error >= e5 ? 5 : error >= e2 ? 2 : 1) * Math.pow(10, power) : -Math.pow(10, -power) / (error >= e10 ? 10 : error >= e5 ? 5 : error >= e2 ? 2 : 1);
}
function tickStep(start, stop, count) {
  var step0 = Math.abs(stop - start) / Math.max(0, count), step1 = Math.pow(10, Math.floor(Math.log(step0) / Math.LN10)), error = step0 / step1;
  if (error >= e10)
    step1 *= 10;
  else if (error >= e5)
    step1 *= 5;
  else if (error >= e2)
    step1 *= 2;
  return stop < start ? -step1 : step1;
}

// node_modules/d3-scale/src/init.js
function initRange(domain, range) {
  switch (arguments.length) {
    case 0:
      break;
    case 1:
      this.range(domain);
      break;
    default:
      this.range(range).domain(domain);
      break;
  }
  return this;
}

// node_modules/d3-color/src/define.js
function define_default(constructor, factory, prototype) {
  constructor.prototype = factory.prototype = prototype;
  prototype.constructor = constructor;
}
function extend(parent, definition) {
  var prototype = Object.create(parent.prototype);
  for (var key in definition)
    prototype[key] = definition[key];
  return prototype;
}

// node_modules/d3-color/src/color.js
function Color() {
}
var darker = 0.7;
var brighter = 1 / darker;
var reI = "\\s*([+-]?\\d+)\\s*";
var reN = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)\\s*";
var reP = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)%\\s*";
var reHex = /^#([0-9a-f]{3,8})$/;
var reRgbInteger = new RegExp(`^rgb\\(${reI},${reI},${reI}\\)$`);
var reRgbPercent = new RegExp(`^rgb\\(${reP},${reP},${reP}\\)$`);
var reRgbaInteger = new RegExp(`^rgba\\(${reI},${reI},${reI},${reN}\\)$`);
var reRgbaPercent = new RegExp(`^rgba\\(${reP},${reP},${reP},${reN}\\)$`);
var reHslPercent = new RegExp(`^hsl\\(${reN},${reP},${reP}\\)$`);
var reHslaPercent = new RegExp(`^hsla\\(${reN},${reP},${reP},${reN}\\)$`);
var named = {
  aliceblue: 15792383,
  antiquewhite: 16444375,
  aqua: 65535,
  aquamarine: 8388564,
  azure: 15794175,
  beige: 16119260,
  bisque: 16770244,
  black: 0,
  blanchedalmond: 16772045,
  blue: 255,
  blueviolet: 9055202,
  brown: 10824234,
  burlywood: 14596231,
  cadetblue: 6266528,
  chartreuse: 8388352,
  chocolate: 13789470,
  coral: 16744272,
  cornflowerblue: 6591981,
  cornsilk: 16775388,
  crimson: 14423100,
  cyan: 65535,
  darkblue: 139,
  darkcyan: 35723,
  darkgoldenrod: 12092939,
  darkgray: 11119017,
  darkgreen: 25600,
  darkgrey: 11119017,
  darkkhaki: 12433259,
  darkmagenta: 9109643,
  darkolivegreen: 5597999,
  darkorange: 16747520,
  darkorchid: 10040012,
  darkred: 9109504,
  darksalmon: 15308410,
  darkseagreen: 9419919,
  darkslateblue: 4734347,
  darkslategray: 3100495,
  darkslategrey: 3100495,
  darkturquoise: 52945,
  darkviolet: 9699539,
  deeppink: 16716947,
  deepskyblue: 49151,
  dimgray: 6908265,
  dimgrey: 6908265,
  dodgerblue: 2003199,
  firebrick: 11674146,
  floralwhite: 16775920,
  forestgreen: 2263842,
  fuchsia: 16711935,
  gainsboro: 14474460,
  ghostwhite: 16316671,
  gold: 16766720,
  goldenrod: 14329120,
  gray: 8421504,
  green: 32768,
  greenyellow: 11403055,
  grey: 8421504,
  honeydew: 15794160,
  hotpink: 16738740,
  indianred: 13458524,
  indigo: 4915330,
  ivory: 16777200,
  khaki: 15787660,
  lavender: 15132410,
  lavenderblush: 16773365,
  lawngreen: 8190976,
  lemonchiffon: 16775885,
  lightblue: 11393254,
  lightcoral: 15761536,
  lightcyan: 14745599,
  lightgoldenrodyellow: 16448210,
  lightgray: 13882323,
  lightgreen: 9498256,
  lightgrey: 13882323,
  lightpink: 16758465,
  lightsalmon: 16752762,
  lightseagreen: 2142890,
  lightskyblue: 8900346,
  lightslategray: 7833753,
  lightslategrey: 7833753,
  lightsteelblue: 11584734,
  lightyellow: 16777184,
  lime: 65280,
  limegreen: 3329330,
  linen: 16445670,
  magenta: 16711935,
  maroon: 8388608,
  mediumaquamarine: 6737322,
  mediumblue: 205,
  mediumorchid: 12211667,
  mediumpurple: 9662683,
  mediumseagreen: 3978097,
  mediumslateblue: 8087790,
  mediumspringgreen: 64154,
  mediumturquoise: 4772300,
  mediumvioletred: 13047173,
  midnightblue: 1644912,
  mintcream: 16121850,
  mistyrose: 16770273,
  moccasin: 16770229,
  navajowhite: 16768685,
  navy: 128,
  oldlace: 16643558,
  olive: 8421376,
  olivedrab: 7048739,
  orange: 16753920,
  orangered: 16729344,
  orchid: 14315734,
  palegoldenrod: 15657130,
  palegreen: 10025880,
  paleturquoise: 11529966,
  palevioletred: 14381203,
  papayawhip: 16773077,
  peachpuff: 16767673,
  peru: 13468991,
  pink: 16761035,
  plum: 14524637,
  powderblue: 11591910,
  purple: 8388736,
  rebeccapurple: 6697881,
  red: 16711680,
  rosybrown: 12357519,
  royalblue: 4286945,
  saddlebrown: 9127187,
  salmon: 16416882,
  sandybrown: 16032864,
  seagreen: 3050327,
  seashell: 16774638,
  sienna: 10506797,
  silver: 12632256,
  skyblue: 8900331,
  slateblue: 6970061,
  slategray: 7372944,
  slategrey: 7372944,
  snow: 16775930,
  springgreen: 65407,
  steelblue: 4620980,
  tan: 13808780,
  teal: 32896,
  thistle: 14204888,
  tomato: 16737095,
  turquoise: 4251856,
  violet: 15631086,
  wheat: 16113331,
  white: 16777215,
  whitesmoke: 16119285,
  yellow: 16776960,
  yellowgreen: 10145074
};
define_default(Color, color, {
  copy(channels) {
    return Object.assign(new this.constructor(), this, channels);
  },
  displayable() {
    return this.rgb().displayable();
  },
  hex: color_formatHex,
  formatHex: color_formatHex,
  formatHex8: color_formatHex8,
  formatHsl: color_formatHsl,
  formatRgb: color_formatRgb,
  toString: color_formatRgb
});
function color_formatHex() {
  return this.rgb().formatHex();
}
function color_formatHex8() {
  return this.rgb().formatHex8();
}
function color_formatHsl() {
  return hslConvert(this).formatHsl();
}
function color_formatRgb() {
  return this.rgb().formatRgb();
}
function color(format2) {
  var m, l;
  format2 = (format2 + "").trim().toLowerCase();
  return (m = reHex.exec(format2)) ? (l = m[1].length, m = parseInt(m[1], 16), l === 6 ? rgbn(m) : l === 3 ? new Rgb(m >> 8 & 15 | m >> 4 & 240, m >> 4 & 15 | m & 240, (m & 15) << 4 | m & 15, 1) : l === 8 ? rgba(m >> 24 & 255, m >> 16 & 255, m >> 8 & 255, (m & 255) / 255) : l === 4 ? rgba(m >> 12 & 15 | m >> 8 & 240, m >> 8 & 15 | m >> 4 & 240, m >> 4 & 15 | m & 240, ((m & 15) << 4 | m & 15) / 255) : null) : (m = reRgbInteger.exec(format2)) ? new Rgb(m[1], m[2], m[3], 1) : (m = reRgbPercent.exec(format2)) ? new Rgb(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, 1) : (m = reRgbaInteger.exec(format2)) ? rgba(m[1], m[2], m[3], m[4]) : (m = reRgbaPercent.exec(format2)) ? rgba(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, m[4]) : (m = reHslPercent.exec(format2)) ? hsla(m[1], m[2] / 100, m[3] / 100, 1) : (m = reHslaPercent.exec(format2)) ? hsla(m[1], m[2] / 100, m[3] / 100, m[4]) : named.hasOwnProperty(format2) ? rgbn(named[format2]) : format2 === "transparent" ? new Rgb(NaN, NaN, NaN, 0) : null;
}
function rgbn(n) {
  return new Rgb(n >> 16 & 255, n >> 8 & 255, n & 255, 1);
}
function rgba(r, g, b, a) {
  if (a <= 0)
    r = g = b = NaN;
  return new Rgb(r, g, b, a);
}
function rgbConvert(o) {
  if (!(o instanceof Color))
    o = color(o);
  if (!o)
    return new Rgb();
  o = o.rgb();
  return new Rgb(o.r, o.g, o.b, o.opacity);
}
function rgb(r, g, b, opacity) {
  return arguments.length === 1 ? rgbConvert(r) : new Rgb(r, g, b, opacity == null ? 1 : opacity);
}
function Rgb(r, g, b, opacity) {
  this.r = +r;
  this.g = +g;
  this.b = +b;
  this.opacity = +opacity;
}
define_default(Rgb, rgb, extend(Color, {
  brighter(k) {
    k = k == null ? brighter : Math.pow(brighter, k);
    return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
  },
  darker(k) {
    k = k == null ? darker : Math.pow(darker, k);
    return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
  },
  rgb() {
    return this;
  },
  clamp() {
    return new Rgb(clampi(this.r), clampi(this.g), clampi(this.b), clampa(this.opacity));
  },
  displayable() {
    return -0.5 <= this.r && this.r < 255.5 && (-0.5 <= this.g && this.g < 255.5) && (-0.5 <= this.b && this.b < 255.5) && (0 <= this.opacity && this.opacity <= 1);
  },
  hex: rgb_formatHex,
  formatHex: rgb_formatHex,
  formatHex8: rgb_formatHex8,
  formatRgb: rgb_formatRgb,
  toString: rgb_formatRgb
}));
function rgb_formatHex() {
  return `#${hex(this.r)}${hex(this.g)}${hex(this.b)}`;
}
function rgb_formatHex8() {
  return `#${hex(this.r)}${hex(this.g)}${hex(this.b)}${hex((isNaN(this.opacity) ? 1 : this.opacity) * 255)}`;
}
function rgb_formatRgb() {
  const a = clampa(this.opacity);
  return `${a === 1 ? "rgb(" : "rgba("}${clampi(this.r)}, ${clampi(this.g)}, ${clampi(this.b)}${a === 1 ? ")" : `, ${a})`}`;
}
function clampa(opacity) {
  return isNaN(opacity) ? 1 : Math.max(0, Math.min(1, opacity));
}
function clampi(value) {
  return Math.max(0, Math.min(255, Math.round(value) || 0));
}
function hex(value) {
  value = clampi(value);
  return (value < 16 ? "0" : "") + value.toString(16);
}
function hsla(h, s, l, a) {
  if (a <= 0)
    h = s = l = NaN;
  else if (l <= 0 || l >= 1)
    h = s = NaN;
  else if (s <= 0)
    h = NaN;
  return new Hsl(h, s, l, a);
}
function hslConvert(o) {
  if (o instanceof Hsl)
    return new Hsl(o.h, o.s, o.l, o.opacity);
  if (!(o instanceof Color))
    o = color(o);
  if (!o)
    return new Hsl();
  if (o instanceof Hsl)
    return o;
  o = o.rgb();
  var r = o.r / 255, g = o.g / 255, b = o.b / 255, min = Math.min(r, g, b), max = Math.max(r, g, b), h = NaN, s = max - min, l = (max + min) / 2;
  if (s) {
    if (r === max)
      h = (g - b) / s + (g < b) * 6;
    else if (g === max)
      h = (b - r) / s + 2;
    else
      h = (r - g) / s + 4;
    s /= l < 0.5 ? max + min : 2 - max - min;
    h *= 60;
  } else {
    s = l > 0 && l < 1 ? 0 : h;
  }
  return new Hsl(h, s, l, o.opacity);
}
function hsl(h, s, l, opacity) {
  return arguments.length === 1 ? hslConvert(h) : new Hsl(h, s, l, opacity == null ? 1 : opacity);
}
function Hsl(h, s, l, opacity) {
  this.h = +h;
  this.s = +s;
  this.l = +l;
  this.opacity = +opacity;
}
define_default(Hsl, hsl, extend(Color, {
  brighter(k) {
    k = k == null ? brighter : Math.pow(brighter, k);
    return new Hsl(this.h, this.s, this.l * k, this.opacity);
  },
  darker(k) {
    k = k == null ? darker : Math.pow(darker, k);
    return new Hsl(this.h, this.s, this.l * k, this.opacity);
  },
  rgb() {
    var h = this.h % 360 + (this.h < 0) * 360, s = isNaN(h) || isNaN(this.s) ? 0 : this.s, l = this.l, m2 = l + (l < 0.5 ? l : 1 - l) * s, m1 = 2 * l - m2;
    return new Rgb(
      hsl2rgb(h >= 240 ? h - 240 : h + 120, m1, m2),
      hsl2rgb(h, m1, m2),
      hsl2rgb(h < 120 ? h + 240 : h - 120, m1, m2),
      this.opacity
    );
  },
  clamp() {
    return new Hsl(clamph(this.h), clampt(this.s), clampt(this.l), clampa(this.opacity));
  },
  displayable() {
    return (0 <= this.s && this.s <= 1 || isNaN(this.s)) && (0 <= this.l && this.l <= 1) && (0 <= this.opacity && this.opacity <= 1);
  },
  formatHsl() {
    const a = clampa(this.opacity);
    return `${a === 1 ? "hsl(" : "hsla("}${clamph(this.h)}, ${clampt(this.s) * 100}%, ${clampt(this.l) * 100}%${a === 1 ? ")" : `, ${a})`}`;
  }
}));
function clamph(value) {
  value = (value || 0) % 360;
  return value < 0 ? value + 360 : value;
}
function clampt(value) {
  return Math.max(0, Math.min(1, value || 0));
}
function hsl2rgb(h, m1, m2) {
  return (h < 60 ? m1 + (m2 - m1) * h / 60 : h < 180 ? m2 : h < 240 ? m1 + (m2 - m1) * (240 - h) / 60 : m1) * 255;
}

// node_modules/d3-interpolate/src/basis.js
function basis(t1, v0, v1, v2, v3) {
  var t2 = t1 * t1, t3 = t2 * t1;
  return ((1 - 3 * t1 + 3 * t2 - t3) * v0 + (4 - 6 * t2 + 3 * t3) * v1 + (1 + 3 * t1 + 3 * t2 - 3 * t3) * v2 + t3 * v3) / 6;
}
function basis_default(values) {
  var n = values.length - 1;
  return function(t) {
    var i = t <= 0 ? t = 0 : t >= 1 ? (t = 1, n - 1) : Math.floor(t * n), v1 = values[i], v2 = values[i + 1], v0 = i > 0 ? values[i - 1] : 2 * v1 - v2, v3 = i < n - 1 ? values[i + 2] : 2 * v2 - v1;
    return basis((t - i / n) * n, v0, v1, v2, v3);
  };
}

// node_modules/d3-interpolate/src/basisClosed.js
function basisClosed_default(values) {
  var n = values.length;
  return function(t) {
    var i = Math.floor(((t %= 1) < 0 ? ++t : t) * n), v0 = values[(i + n - 1) % n], v1 = values[i % n], v2 = values[(i + 1) % n], v3 = values[(i + 2) % n];
    return basis((t - i / n) * n, v0, v1, v2, v3);
  };
}

// node_modules/d3-interpolate/src/constant.js
var constant_default = (x) => () => x;

// node_modules/d3-interpolate/src/color.js
function linear(a, d) {
  return function(t) {
    return a + t * d;
  };
}
function exponential(a, b, y) {
  return a = Math.pow(a, y), b = Math.pow(b, y) - a, y = 1 / y, function(t) {
    return Math.pow(a + t * b, y);
  };
}
function gamma(y) {
  return (y = +y) === 1 ? nogamma : function(a, b) {
    return b - a ? exponential(a, b, y) : constant_default(isNaN(a) ? b : a);
  };
}
function nogamma(a, b) {
  var d = b - a;
  return d ? linear(a, d) : constant_default(isNaN(a) ? b : a);
}

// node_modules/d3-interpolate/src/rgb.js
var rgb_default = function rgbGamma(y) {
  var color2 = gamma(y);
  function rgb2(start, end) {
    var r = color2((start = rgb(start)).r, (end = rgb(end)).r), g = color2(start.g, end.g), b = color2(start.b, end.b), opacity = nogamma(start.opacity, end.opacity);
    return function(t) {
      start.r = r(t);
      start.g = g(t);
      start.b = b(t);
      start.opacity = opacity(t);
      return start + "";
    };
  }
  rgb2.gamma = rgbGamma;
  return rgb2;
}(1);
function rgbSpline(spline) {
  return function(colors) {
    var n = colors.length, r = new Array(n), g = new Array(n), b = new Array(n), i, color2;
    for (i = 0; i < n; ++i) {
      color2 = rgb(colors[i]);
      r[i] = color2.r || 0;
      g[i] = color2.g || 0;
      b[i] = color2.b || 0;
    }
    r = spline(r);
    g = spline(g);
    b = spline(b);
    color2.opacity = 1;
    return function(t) {
      color2.r = r(t);
      color2.g = g(t);
      color2.b = b(t);
      return color2 + "";
    };
  };
}
var rgbBasis = rgbSpline(basis_default);
var rgbBasisClosed = rgbSpline(basisClosed_default);

// node_modules/d3-interpolate/src/numberArray.js
function numberArray_default(a, b) {
  if (!b)
    b = [];
  var n = a ? Math.min(b.length, a.length) : 0, c = b.slice(), i;
  return function(t) {
    for (i = 0; i < n; ++i)
      c[i] = a[i] * (1 - t) + b[i] * t;
    return c;
  };
}
function isNumberArray(x) {
  return ArrayBuffer.isView(x) && !(x instanceof DataView);
}

// node_modules/d3-interpolate/src/array.js
function genericArray(a, b) {
  var nb = b ? b.length : 0, na = a ? Math.min(nb, a.length) : 0, x = new Array(na), c = new Array(nb), i;
  for (i = 0; i < na; ++i)
    x[i] = value_default(a[i], b[i]);
  for (; i < nb; ++i)
    c[i] = b[i];
  return function(t) {
    for (i = 0; i < na; ++i)
      c[i] = x[i](t);
    return c;
  };
}

// node_modules/d3-interpolate/src/date.js
function date_default(a, b) {
  var d = new Date();
  return a = +a, b = +b, function(t) {
    return d.setTime(a * (1 - t) + b * t), d;
  };
}

// node_modules/d3-interpolate/src/number.js
function number_default(a, b) {
  return a = +a, b = +b, function(t) {
    return a * (1 - t) + b * t;
  };
}

// node_modules/d3-interpolate/src/object.js
function object_default(a, b) {
  var i = {}, c = {}, k;
  if (a === null || typeof a !== "object")
    a = {};
  if (b === null || typeof b !== "object")
    b = {};
  for (k in b) {
    if (k in a) {
      i[k] = value_default(a[k], b[k]);
    } else {
      c[k] = b[k];
    }
  }
  return function(t) {
    for (k in i)
      c[k] = i[k](t);
    return c;
  };
}

// node_modules/d3-interpolate/src/string.js
var reA = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g;
var reB = new RegExp(reA.source, "g");
function zero2(b) {
  return function() {
    return b;
  };
}
function one(b) {
  return function(t) {
    return b(t) + "";
  };
}
function string_default(a, b) {
  var bi = reA.lastIndex = reB.lastIndex = 0, am, bm, bs, i = -1, s = [], q = [];
  a = a + "", b = b + "";
  while ((am = reA.exec(a)) && (bm = reB.exec(b))) {
    if ((bs = bm.index) > bi) {
      bs = b.slice(bi, bs);
      if (s[i])
        s[i] += bs;
      else
        s[++i] = bs;
    }
    if ((am = am[0]) === (bm = bm[0])) {
      if (s[i])
        s[i] += bm;
      else
        s[++i] = bm;
    } else {
      s[++i] = null;
      q.push({ i, x: number_default(am, bm) });
    }
    bi = reB.lastIndex;
  }
  if (bi < b.length) {
    bs = b.slice(bi);
    if (s[i])
      s[i] += bs;
    else
      s[++i] = bs;
  }
  return s.length < 2 ? q[0] ? one(q[0].x) : zero2(b) : (b = q.length, function(t) {
    for (var i2 = 0, o; i2 < b; ++i2)
      s[(o = q[i2]).i] = o.x(t);
    return s.join("");
  });
}

// node_modules/d3-interpolate/src/value.js
function value_default(a, b) {
  var t = typeof b, c;
  return b == null || t === "boolean" ? constant_default(b) : (t === "number" ? number_default : t === "string" ? (c = color(b)) ? (b = c, rgb_default) : string_default : b instanceof color ? rgb_default : b instanceof Date ? date_default : isNumberArray(b) ? numberArray_default : Array.isArray(b) ? genericArray : typeof b.valueOf !== "function" && typeof b.toString !== "function" || isNaN(b) ? object_default : number_default)(a, b);
}

// node_modules/d3-interpolate/src/round.js
function round_default(a, b) {
  return a = +a, b = +b, function(t) {
    return Math.round(a * (1 - t) + b * t);
  };
}

// node_modules/d3-scale/src/constant.js
function constants(x) {
  return function() {
    return x;
  };
}

// node_modules/d3-scale/src/number.js
function number2(x) {
  return +x;
}

// node_modules/d3-scale/src/continuous.js
var unit = [0, 1];
function identity(x) {
  return x;
}
function normalize(a, b) {
  return (b -= a = +a) ? function(x) {
    return (x - a) / b;
  } : constants(isNaN(b) ? NaN : 0.5);
}
function clamper(a, b) {
  var t;
  if (a > b)
    t = a, a = b, b = t;
  return function(x) {
    return Math.max(a, Math.min(b, x));
  };
}
function bimap(domain, range, interpolate) {
  var d0 = domain[0], d1 = domain[1], r0 = range[0], r1 = range[1];
  if (d1 < d0)
    d0 = normalize(d1, d0), r0 = interpolate(r1, r0);
  else
    d0 = normalize(d0, d1), r0 = interpolate(r0, r1);
  return function(x) {
    return r0(d0(x));
  };
}
function polymap(domain, range, interpolate) {
  var j = Math.min(domain.length, range.length) - 1, d = new Array(j), r = new Array(j), i = -1;
  if (domain[j] < domain[0]) {
    domain = domain.slice().reverse();
    range = range.slice().reverse();
  }
  while (++i < j) {
    d[i] = normalize(domain[i], domain[i + 1]);
    r[i] = interpolate(range[i], range[i + 1]);
  }
  return function(x) {
    var i2 = bisect_default(domain, x, 1, j) - 1;
    return r[i2](d[i2](x));
  };
}
function copy(source, target) {
  return target.domain(source.domain()).range(source.range()).interpolate(source.interpolate()).clamp(source.clamp()).unknown(source.unknown());
}
function transformer() {
  var domain = unit, range = unit, interpolate = value_default, transform, untransform, unknown, clamp = identity, piecewise, output, input;
  function rescale() {
    var n = Math.min(domain.length, range.length);
    if (clamp !== identity)
      clamp = clamper(domain[0], domain[n - 1]);
    piecewise = n > 2 ? polymap : bimap;
    output = input = null;
    return scale;
  }
  function scale(x) {
    return x == null || isNaN(x = +x) ? unknown : (output || (output = piecewise(domain.map(transform), range, interpolate)))(transform(clamp(x)));
  }
  scale.invert = function(y) {
    return clamp(untransform((input || (input = piecewise(range, domain.map(transform), number_default)))(y)));
  };
  scale.domain = function(_) {
    return arguments.length ? (domain = Array.from(_, number2), rescale()) : domain.slice();
  };
  scale.range = function(_) {
    return arguments.length ? (range = Array.from(_), rescale()) : range.slice();
  };
  scale.rangeRound = function(_) {
    return range = Array.from(_), interpolate = round_default, rescale();
  };
  scale.clamp = function(_) {
    return arguments.length ? (clamp = _ ? true : identity, rescale()) : clamp !== identity;
  };
  scale.interpolate = function(_) {
    return arguments.length ? (interpolate = _, rescale()) : interpolate;
  };
  scale.unknown = function(_) {
    return arguments.length ? (unknown = _, scale) : unknown;
  };
  return function(t, u) {
    transform = t, untransform = u;
    return rescale();
  };
}
function continuous() {
  return transformer()(identity, identity);
}

// node_modules/d3-format/src/formatDecimal.js
function formatDecimal_default(x) {
  return Math.abs(x = Math.round(x)) >= 1e21 ? x.toLocaleString("en").replace(/,/g, "") : x.toString(10);
}
function formatDecimalParts(x, p) {
  if ((i = (x = p ? x.toExponential(p - 1) : x.toExponential()).indexOf("e")) < 0)
    return null;
  var i, coefficient = x.slice(0, i);
  return [
    coefficient.length > 1 ? coefficient[0] + coefficient.slice(2) : coefficient,
    +x.slice(i + 1)
  ];
}

// node_modules/d3-format/src/exponent.js
function exponent_default(x) {
  return x = formatDecimalParts(Math.abs(x)), x ? x[1] : NaN;
}

// node_modules/d3-format/src/formatGroup.js
function formatGroup_default(grouping, thousands) {
  return function(value, width) {
    var i = value.length, t = [], j = 0, g = grouping[0], length = 0;
    while (i > 0 && g > 0) {
      if (length + g + 1 > width)
        g = Math.max(1, width - length);
      t.push(value.substring(i -= g, i + g));
      if ((length += g + 1) > width)
        break;
      g = grouping[j = (j + 1) % grouping.length];
    }
    return t.reverse().join(thousands);
  };
}

// node_modules/d3-format/src/formatNumerals.js
function formatNumerals_default(numerals) {
  return function(value) {
    return value.replace(/[0-9]/g, function(i) {
      return numerals[+i];
    });
  };
}

// node_modules/d3-format/src/formatSpecifier.js
var re = /^(?:(.)?([<>=^]))?([+\-( ])?([$#])?(0)?(\d+)?(,)?(\.\d+)?(~)?([a-z%])?$/i;
function formatSpecifier(specifier) {
  if (!(match = re.exec(specifier)))
    throw new Error("invalid format: " + specifier);
  var match;
  return new FormatSpecifier({
    fill: match[1],
    align: match[2],
    sign: match[3],
    symbol: match[4],
    zero: match[5],
    width: match[6],
    comma: match[7],
    precision: match[8] && match[8].slice(1),
    trim: match[9],
    type: match[10]
  });
}
formatSpecifier.prototype = FormatSpecifier.prototype;
function FormatSpecifier(specifier) {
  this.fill = specifier.fill === void 0 ? " " : specifier.fill + "";
  this.align = specifier.align === void 0 ? ">" : specifier.align + "";
  this.sign = specifier.sign === void 0 ? "-" : specifier.sign + "";
  this.symbol = specifier.symbol === void 0 ? "" : specifier.symbol + "";
  this.zero = !!specifier.zero;
  this.width = specifier.width === void 0 ? void 0 : +specifier.width;
  this.comma = !!specifier.comma;
  this.precision = specifier.precision === void 0 ? void 0 : +specifier.precision;
  this.trim = !!specifier.trim;
  this.type = specifier.type === void 0 ? "" : specifier.type + "";
}
FormatSpecifier.prototype.toString = function() {
  return this.fill + this.align + this.sign + this.symbol + (this.zero ? "0" : "") + (this.width === void 0 ? "" : Math.max(1, this.width | 0)) + (this.comma ? "," : "") + (this.precision === void 0 ? "" : "." + Math.max(0, this.precision | 0)) + (this.trim ? "~" : "") + this.type;
};

// node_modules/d3-format/src/formatTrim.js
function formatTrim_default(s) {
  out:
    for (var n = s.length, i = 1, i0 = -1, i1; i < n; ++i) {
      switch (s[i]) {
        case ".":
          i0 = i1 = i;
          break;
        case "0":
          if (i0 === 0)
            i0 = i;
          i1 = i;
          break;
        default:
          if (!+s[i])
            break out;
          if (i0 > 0)
            i0 = 0;
          break;
      }
    }
  return i0 > 0 ? s.slice(0, i0) + s.slice(i1 + 1) : s;
}

// node_modules/d3-format/src/formatPrefixAuto.js
var prefixExponent;
function formatPrefixAuto_default(x, p) {
  var d = formatDecimalParts(x, p);
  if (!d)
    return x + "";
  var coefficient = d[0], exponent = d[1], i = exponent - (prefixExponent = Math.max(-8, Math.min(8, Math.floor(exponent / 3))) * 3) + 1, n = coefficient.length;
  return i === n ? coefficient : i > n ? coefficient + new Array(i - n + 1).join("0") : i > 0 ? coefficient.slice(0, i) + "." + coefficient.slice(i) : "0." + new Array(1 - i).join("0") + formatDecimalParts(x, Math.max(0, p + i - 1))[0];
}

// node_modules/d3-format/src/formatRounded.js
function formatRounded_default(x, p) {
  var d = formatDecimalParts(x, p);
  if (!d)
    return x + "";
  var coefficient = d[0], exponent = d[1];
  return exponent < 0 ? "0." + new Array(-exponent).join("0") + coefficient : coefficient.length > exponent + 1 ? coefficient.slice(0, exponent + 1) + "." + coefficient.slice(exponent + 1) : coefficient + new Array(exponent - coefficient.length + 2).join("0");
}

// node_modules/d3-format/src/formatTypes.js
var formatTypes_default = {
  "%": (x, p) => (x * 100).toFixed(p),
  "b": (x) => Math.round(x).toString(2),
  "c": (x) => x + "",
  "d": formatDecimal_default,
  "e": (x, p) => x.toExponential(p),
  "f": (x, p) => x.toFixed(p),
  "g": (x, p) => x.toPrecision(p),
  "o": (x) => Math.round(x).toString(8),
  "p": (x, p) => formatRounded_default(x * 100, p),
  "r": formatRounded_default,
  "s": formatPrefixAuto_default,
  "X": (x) => Math.round(x).toString(16).toUpperCase(),
  "x": (x) => Math.round(x).toString(16)
};

// node_modules/d3-format/src/identity.js
function identity_default(x) {
  return x;
}

// node_modules/d3-format/src/locale.js
var map = Array.prototype.map;
var prefixes = ["y", "z", "a", "f", "p", "n", "\xB5", "m", "", "k", "M", "G", "T", "P", "E", "Z", "Y"];
function locale_default(locale2) {
  var group = locale2.grouping === void 0 || locale2.thousands === void 0 ? identity_default : formatGroup_default(map.call(locale2.grouping, Number), locale2.thousands + ""), currencyPrefix = locale2.currency === void 0 ? "" : locale2.currency[0] + "", currencySuffix = locale2.currency === void 0 ? "" : locale2.currency[1] + "", decimal = locale2.decimal === void 0 ? "." : locale2.decimal + "", numerals = locale2.numerals === void 0 ? identity_default : formatNumerals_default(map.call(locale2.numerals, String)), percent = locale2.percent === void 0 ? "%" : locale2.percent + "", minus = locale2.minus === void 0 ? "\u2212" : locale2.minus + "", nan = locale2.nan === void 0 ? "NaN" : locale2.nan + "";
  function newFormat(specifier) {
    specifier = formatSpecifier(specifier);
    var fill = specifier.fill, align = specifier.align, sign = specifier.sign, symbol = specifier.symbol, zero3 = specifier.zero, width = specifier.width, comma = specifier.comma, precision = specifier.precision, trim = specifier.trim, type = specifier.type;
    if (type === "n")
      comma = true, type = "g";
    else if (!formatTypes_default[type])
      precision === void 0 && (precision = 12), trim = true, type = "g";
    if (zero3 || fill === "0" && align === "=")
      zero3 = true, fill = "0", align = "=";
    var prefix = symbol === "$" ? currencyPrefix : symbol === "#" && /[boxX]/.test(type) ? "0" + type.toLowerCase() : "", suffix = symbol === "$" ? currencySuffix : /[%p]/.test(type) ? percent : "";
    var formatType = formatTypes_default[type], maybeSuffix = /[defgprs%]/.test(type);
    precision = precision === void 0 ? 6 : /[gprs]/.test(type) ? Math.max(1, Math.min(21, precision)) : Math.max(0, Math.min(20, precision));
    function format2(value) {
      var valuePrefix = prefix, valueSuffix = suffix, i, n, c;
      if (type === "c") {
        valueSuffix = formatType(value) + valueSuffix;
        value = "";
      } else {
        value = +value;
        var valueNegative = value < 0 || 1 / value < 0;
        value = isNaN(value) ? nan : formatType(Math.abs(value), precision);
        if (trim)
          value = formatTrim_default(value);
        if (valueNegative && +value === 0 && sign !== "+")
          valueNegative = false;
        valuePrefix = (valueNegative ? sign === "(" ? sign : minus : sign === "-" || sign === "(" ? "" : sign) + valuePrefix;
        valueSuffix = (type === "s" ? prefixes[8 + prefixExponent / 3] : "") + valueSuffix + (valueNegative && sign === "(" ? ")" : "");
        if (maybeSuffix) {
          i = -1, n = value.length;
          while (++i < n) {
            if (c = value.charCodeAt(i), 48 > c || c > 57) {
              valueSuffix = (c === 46 ? decimal + value.slice(i + 1) : value.slice(i)) + valueSuffix;
              value = value.slice(0, i);
              break;
            }
          }
        }
      }
      if (comma && !zero3)
        value = group(value, Infinity);
      var length = valuePrefix.length + value.length + valueSuffix.length, padding = length < width ? new Array(width - length + 1).join(fill) : "";
      if (comma && zero3)
        value = group(padding + value, padding.length ? width - valueSuffix.length : Infinity), padding = "";
      switch (align) {
        case "<":
          value = valuePrefix + value + valueSuffix + padding;
          break;
        case "=":
          value = valuePrefix + padding + value + valueSuffix;
          break;
        case "^":
          value = padding.slice(0, length = padding.length >> 1) + valuePrefix + value + valueSuffix + padding.slice(length);
          break;
        default:
          value = padding + valuePrefix + value + valueSuffix;
          break;
      }
      return numerals(value);
    }
    format2.toString = function() {
      return specifier + "";
    };
    return format2;
  }
  function formatPrefix2(specifier, value) {
    var f = newFormat((specifier = formatSpecifier(specifier), specifier.type = "f", specifier)), e = Math.max(-8, Math.min(8, Math.floor(exponent_default(value) / 3))) * 3, k = Math.pow(10, -e), prefix = prefixes[8 + e / 3];
    return function(value2) {
      return f(k * value2) + prefix;
    };
  }
  return {
    format: newFormat,
    formatPrefix: formatPrefix2
  };
}

// node_modules/d3-format/src/defaultLocale.js
var locale;
var format;
var formatPrefix;
defaultLocale({
  thousands: ",",
  grouping: [3],
  currency: ["$", ""]
});
function defaultLocale(definition) {
  locale = locale_default(definition);
  format = locale.format;
  formatPrefix = locale.formatPrefix;
  return locale;
}

// node_modules/d3-format/src/precisionFixed.js
function precisionFixed_default(step) {
  return Math.max(0, -exponent_default(Math.abs(step)));
}

// node_modules/d3-format/src/precisionPrefix.js
function precisionPrefix_default(step, value) {
  return Math.max(0, Math.max(-8, Math.min(8, Math.floor(exponent_default(value) / 3))) * 3 - exponent_default(Math.abs(step)));
}

// node_modules/d3-format/src/precisionRound.js
function precisionRound_default(step, max) {
  step = Math.abs(step), max = Math.abs(max) - step;
  return Math.max(0, exponent_default(max) - exponent_default(step)) + 1;
}

// node_modules/d3-scale/src/tickFormat.js
function tickFormat(start, stop, count, specifier) {
  var step = tickStep(start, stop, count), precision;
  specifier = formatSpecifier(specifier == null ? ",f" : specifier);
  switch (specifier.type) {
    case "s": {
      var value = Math.max(Math.abs(start), Math.abs(stop));
      if (specifier.precision == null && !isNaN(precision = precisionPrefix_default(step, value)))
        specifier.precision = precision;
      return formatPrefix(specifier, value);
    }
    case "":
    case "e":
    case "g":
    case "p":
    case "r": {
      if (specifier.precision == null && !isNaN(precision = precisionRound_default(step, Math.max(Math.abs(start), Math.abs(stop)))))
        specifier.precision = precision - (specifier.type === "e");
      break;
    }
    case "f":
    case "%": {
      if (specifier.precision == null && !isNaN(precision = precisionFixed_default(step)))
        specifier.precision = precision - (specifier.type === "%") * 2;
      break;
    }
  }
  return format(specifier);
}

// node_modules/d3-scale/src/linear.js
function linearish(scale) {
  var domain = scale.domain;
  scale.ticks = function(count) {
    var d = domain();
    return ticks(d[0], d[d.length - 1], count == null ? 10 : count);
  };
  scale.tickFormat = function(count, specifier) {
    var d = domain();
    return tickFormat(d[0], d[d.length - 1], count == null ? 10 : count, specifier);
  };
  scale.nice = function(count) {
    if (count == null)
      count = 10;
    var d = domain();
    var i0 = 0;
    var i1 = d.length - 1;
    var start = d[i0];
    var stop = d[i1];
    var prestep;
    var step;
    var maxIter = 10;
    if (stop < start) {
      step = start, start = stop, stop = step;
      step = i0, i0 = i1, i1 = step;
    }
    while (maxIter-- > 0) {
      step = tickIncrement(start, stop, count);
      if (step === prestep) {
        d[i0] = start;
        d[i1] = stop;
        return domain(d);
      } else if (step > 0) {
        start = Math.floor(start / step) * step;
        stop = Math.ceil(stop / step) * step;
      } else if (step < 0) {
        start = Math.ceil(start * step) / step;
        stop = Math.floor(stop * step) / step;
      } else {
        break;
      }
      prestep = step;
    }
    return scale;
  };
  return scale;
}
function linear2() {
  var scale = continuous();
  scale.copy = function() {
    return copy(scale, linear2());
  };
  initRange.apply(scale, arguments);
  return linearish(scale);
}

// src/hymnsDb/builders/hymnal-section-builder.js
var hymnalSections;
var HymnalSectionBuilder = class {
  static async build(hymnsDbInstance2) {
    hymnalSections = /* @__PURE__ */ new Map();
    let hymnals2 = hymnsDbInstance2.getHymnals();
    for (let hymnal of hymnals2.values()) {
      let numeric = hymnal.sections || createNumericSections(hymnsDbInstance2, hymnal);
      let alpha = createAlphaSections(hymnsDbInstance2, hymnal);
      hymnalSections.set(hymnal.hymnalId, { alpha, numeric });
      delete hymnal.sections;
    }
    hymnsDbInstance2.getHymnalSections = function(hymnalId, type) {
      let sections = hymnalSections.get(hymnalId);
      return type ? sections[type] : sections;
    };
  }
};
__publicField(HymnalSectionBuilder, "functions", ["getHymnalSections"]);
function createAlphaSections(hymnsDbInstance2, hymnal) {
  let hymns3 = hymnsDbInstance2.getHymns(hymnal.hymnalId);
  hymns3.sort(hymns_db_abstract_default.hymnCompareAlpha);
  let alphaHymns = hymns3.filter((h) => /[A-Z]/i.test(h.title));
  let firstLetters = [...new Set(alphaHymns.map((h) => h.title[0].toLocaleUpperCase()))];
  firstLetters.sort();
  let sections = [];
  for (let letter of firstLetters) {
    let groupHymns = alphaHymns.filter((h) => h.title.toLocaleUpperCase().startsWith(letter));
    sections.push({ name: letter, hymnIds: groupHymns.map((h) => h.hymnId) });
  }
  let nonAlphaHymns = hymns3.filter((h) => !/[A-Z]/i.test(h.title));
  if (nonAlphaHymns.length) {
    sections.push({ name: "0-9", hymnIds: nonAlphaHymns.map((h) => h.hymnId) });
  }
  return sections;
}
function createNumericSections(hymnsDbInstance2, hymnal) {
  let hymns3 = hymnsDbInstance2.getHymns(hymnal.hymnalId);
  let firstHymnNo = Math.min(...hymns3.map((h) => h.hymnNo));
  let lastHymnNo = Math.max(...hymns3.map((h) => h.hymnNo));
  const sectionSize = 100;
  const minHymnsPerTick = 20;
  const scale = linear2().domain([1, hymns3.length]);
  let ticks2 = scale.ticks();
  if (ticks2[0] < minHymnsPerTick) {
    let tickCount = scale.domain()[1] / minHymnsPerTick;
    ticks2 = scale.ticks(tickCount);
  }
  if (ticks2[ticks2.length - 1] == lastHymnNo)
    ticks2.pop();
  let sections = [];
  if (ticks2.length < 2) {
    sections.push({ name: "", range: [firstHymnNo, lastHymnNo] });
  } else {
    ticks2.unshift(firstHymnNo);
    for (let i = 0; i < ticks2.length; i++) {
      let rangeStart = ticks2[i];
      let rangeEnd = i == ticks2.length - 1 ? lastHymnNo : ticks2[i + 1] - 1;
      sections.push({ name: `${rangeStart}-${rangeEnd}`, range: [rangeStart, rangeEnd] });
    }
  }
  return sections;
}
var hymnal_section_builder_default = HymnalSectionBuilder;

// src/hymnsDb/builders/search-builder.js
var import_lunr5 = __toESM(require_lunr());

// src/hymnsDb/search/normalize-to-ascii.js
var bestFitInverse = { 0: "\uFF10\u2080", 1: "\uFF11\u2081\xB9", 2: "\uFF12\u2082\xB2", 3: "\uFF13\u2083\xB3", 4: "\uFF14\u2084\u2074", 5: "\uFF15\u2085\u2075", 6: "\uFF16\u2086\u2076", 7: "\uFF17\u2087\u2077", 8: "\uFF18\u2088\u2078\u221E", 9: "\uFF19\u2089", "**": "\u2021", "...": "\u2026", "+-": "\xB1", "<<": "\u300A\xAB\u226A", ">>": "\u300B\xBB\u226B", ae: "\xE6", AE: "\xC6", oe: "\u0153", OE: "\u0152", "!": "\uFF01\u01C3", '"': "\uFF02\u201C\u201D\u201E", "#": "\uFF03", $: "\uFF04", "%": "\uFF05", "&": "\uFF06", "'": "\uFF07\u2018\u2019\u201A", "(": "\uFF08\u2320", ")": "\uFF09\u2321", "*": "\uFF0A\u2217\u2020", "+": "\uFF0B", ",": "\uFF0C", "-": "\uFF0D\u2212\u2010\u2011\u2013\u2014\u2024\u2022", ".": "\uFF0E", "/": "\uFF0F\u2044\u2215\xF7", ":": "\uFF1A\u2236", ";": "\uFF1B", "<": "\u2039\u3008\u3008\uFF1C", "=": "\uFF1D\u2261\u2264\u2265", ">": "\u203A\u3009\u3009\uFF1E", "?": "\uFF1F", "@": "\uFF20", A: "\uFF21", B: "\uFF22\u212C", C: "\uFF23\u2102\u212D", D: "\uFF24\u0110\xD0\u0189", E: "\uFF25\u2130\u2107", F: "\uFF26\u2131\u0191", G: "\uFF27\u01E4", H: "\uFF28\u210B\u210D\u210C\u0126", I: "\uFF29\u2110\u2111\u0197", J: "\uFF2A", K: "\uFF2B", L: "\uFF2C\u2112\u0141", M: "\uFF2D\u2133", N: "\uFF2E\u2115", O: "\uFF2F\u019F\xD8", P: "\uFF30\u2119\u2118", Q: "\uFF31\u211A", R: "\uFF32\u211D\u211B\u211C", S: "\uFF33\xDF", T: "\uFF34\u01AE\u0166", U: "\uFF35", V: "\uFF36", W: "\uFF37", X: "\uFF38", Y: "\xDE\uFF39", Z: "\uFF3A\u2124\u2128", "[": "\uFF3B\u301A", "\\": "\uFF3C\u2216", "]": "\uFF3D\u301B", "^": "\uFF3E\u2303", _: "\uFF3F\u2017", "`": "\uFF40", a: "\uFF41", b: "\uFF42\u0180", c: "\uFF43", d: "\uFF44\u0111\xF0", e: "\uFF45\u212F\u212E", f: "\uFF46\u0192", g: "\uFF47\u210A\u01E5\u0261", h: "\uFF48\u210E\u0127", i: "\uFF49\u0131", j: "\uFF4A", k: "\uFF4B", l: "\uFF4C\u2113\u019A\u0142", m: "\uFF4D", n: "\u2229\uFF4E\u207F", o: "\uFF4F\u2134\xF8", p: "\uFF50", q: "\uFF51", r: "\uFF52", s: "\uFF53", t: "\uFF54\u01AB\u0167", u: "\uFF55", v: "\u221A\uFF56", w: "\uFF57", x: "\xD7\uFF58", y: "\xFE\uFF59", z: "\uFF5A\u01B6", "{": "\uFF5B", "|": "\uFF5C\u01C0\u2223", "}": "\uFF5D", "~": "\uFF5E\u02DC\u223C" };
var bestFitMap = /* @__PURE__ */ new Map();
Object.entries(bestFitInverse).forEach(([asciiChar, unicodeChars]) => {
  [...unicodeChars].forEach((uc) => bestFitMap.set(uc, asciiChar));
});
var mappableUnicodeCharsRegex = new RegExp("[" + [...bestFitMap.keys()].join("") + "]", "gu");
var nonAsciiCharsRegex = /\P{ASCII}/u;
function normalizeToAscii(str) {
  if (!nonAsciiCharsRegex.test(str))
    return str;
  let result = str.normalize("NFD").replace(/\p{Diacritic}/gu, "");
  return result.replace(mappableUnicodeCharsRegex, (m) => bestFitMap.get(m));
}
var normalize_to_ascii_default = normalizeToAscii;

// src/hymnsDb/search/hymns-db-indexer.js
var import_lunr4 = __toESM(require_lunr());

// src/hymnsDb/search/hymnal-tokenizer.js
var import_lunr = __toESM(require_lunr());
import_lunr.default._standardTokenizer = import_lunr.default._standardTokenizer || import_lunr.default.tokenizer;
import_lunr.default._customTokenizer = void 0;
Object.defineProperty(import_lunr.default, "tokenizer", {
  get() {
    return import_lunr.default._customTokenizer || import_lunr.default._standardTokenizer;
  },
  set(value) {
    import_lunr.default._customTokenizer = value;
    import_lunr.default._customTokenizer.separator = value.separator || import_lunr.default._standardTokenizer.separator;
  },
  enumerable: true
});
var endsWithClauseMarkerRegex = /([:;!?\.]+|[^\w\-]+[\-]+|[\-]{2,})[\s]*$/;
var startsWithClauseMarkerRegex = /^[\s]*([:;!?\.]+|[\-]+[^\w\-]+|[\-]{2,})/;
function hymnalTokenizer(obj, metadata) {
  if (Array.isArray(obj))
    return import_lunr.default._standardTokenizer(obj, metadata);
  if (obj == null || typeof obj == "undefined")
    return [];
  let str = obj.toString().toLocaleLowerCase();
  str = normalize_to_ascii_default(str);
  let singleTokens = import_lunr.default._standardTokenizer(str, metadata);
  if (singleTokens.length < 2)
    return singleTokens[0];
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
  phraseSet = phraseSet.filter((phrase) => {
    let tokensInPhrase = phrase.metadata.sourceTokens;
    if (tokensInPhrase.at(0).metadata.isClauseEnd)
      return false;
    if (tokensInPhrase.at(-1).metadata.isClauseStart)
      return false;
    if (tokensInPhrase.slice(1, -1).some((t) => t.metadata.isClauseStart || t.metadata.isClauseEnd))
      return false;
    return true;
  });
  return phraseSet;
}
function getPhraseToken(tokens, metadata) {
  if (tokens.length == 0)
    return;
  if (tokens.length == 1)
    return tokens[0];
  tokens.sort((a, b) => {
    let result = a.metadata.position[0] - b.metadata.position[0];
    result = result || a.metadata.position[1] + b.metadata.position[1];
    return result;
  });
  let firstToken = tokens.at(0);
  let lastToken = tokens.at(-1);
  let mergedText = tokens.map((t) => t.str).join(" ");
  let mergedMetadata = import_lunr.default.utils.clone(metadata) || {};
  mergedMetadata.phrase = true;
  mergedMetadata.sourceTokens = tokens;
  if (typeof firstToken.metadata.index == "number") {
    mergedMetadata.index = firstToken.metadata.index;
  }
  if (firstToken.metadata.position) {
    mergedMetadata.position = [];
    mergedMetadata.position[0] = firstToken.metadata.position[0];
    let lastIndex = lastToken.metadata.position[0] + lastToken.metadata.position[1];
    mergedMetadata.position[1] = lastIndex - firstToken.metadata.position[0];
  }
  return new import_lunr.default.Token(mergedText, mergedMetadata);
}
var hymnal_tokenizer_default = hymnalTokenizer;

// src/hymnsDb/search/pipeline/hymnal-stemmer.js
var import_lunr2 = __toESM(require_lunr());
import_lunr2.default._standardStemmer = import_lunr2.default._standardStemmer || import_lunr2.default.stemmer;
import_lunr2.default._customStemmer = void 0;
Object.defineProperty(import_lunr2.default, "stemmer", {
  get() {
    return import_lunr2.default._customStemmer || import_lunr2.default._standardStemmer;
  },
  set(value) {
    import_lunr2.default._customStemmer = value;
  },
  enumerable: true
});
function hymnalStemmer(token) {
  if (!token || !token.str.length || !token.str.includes(" ")) {
    return import_lunr2.default._standardStemmer(token);
  }
  token.metadata.sourceTokens = token.metadata.sourceTokens || token.str.split(" ").map((s) => new import_lunr2.default.Token(s, {}));
  return token.update(function(str, metadata) {
    let sourceTokens = metadata.sourceTokens;
    for (let token2 of sourceTokens) {
      if (!token2.metadata.isStemmed) {
        import_lunr2.default._standardStemmer(token2);
        token2.metadata.isStemmed = true;
      }
    }
    return sourceTokens.map((t) => t.str).filter((str2) => str2).join(" ");
  });
}
var hymnal_stemmer_default = hymnalStemmer;

// src/hymnsDb/search/pipeline/hymnal-trimmer.js
var import_lunr3 = __toESM(require_lunr());
import_lunr3.default._standardTrimmer = import_lunr3.default._standardTrimmer || import_lunr3.default.trimmer;
import_lunr3.default._customTrimmer = void 0;
Object.defineProperty(import_lunr3.default, "trimmer", {
  get() {
    return import_lunr3.default._customTrimmer || import_lunr3.default._standardTrimmer;
  },
  set(value) {
    import_lunr3.default._customTrimmer = value;
  },
  enumerable: true
});
function hymnalTrimmer(token) {
  if (!token || !token.str.length || !token.str.includes(" ")) {
    return import_lunr3.default._standardTrimmer(token);
  }
  token.metadata.sourceTokens = token.metadata.sourceTokens || token.str.split(" ").map((s) => new import_lunr3.default.Token(s, {}));
  return token.update(function(str, metadata) {
    let sourceTokens = metadata.sourceTokens;
    for (let token2 of sourceTokens) {
      if (!token2.metadata.isTrimmed) {
        import_lunr3.default._standardTrimmer(token2);
        token2.metadata.isTrimmed = true;
      }
    }
    return sourceTokens.map((t) => t.str).filter((str2) => str2).join(" ");
  });
}
var hymnal_trimmer_default = hymnalTrimmer;

// src/hymnsDb/search/pipeline/blank-killer.js
function blankKiller(token) {
  if (!token)
    return null;
  if (!token.str)
    return null;
  if (!token.str.trim)
    return null;
  if (!token.str.trim())
    return null;
  return token;
}
var blank_killer_default = blankKiller;

// src/hymnsDb/search/pipeline/contraction-fixer.js
var commonContractionsList = ["can't", "dids't", "didn't", "don't", "he'll", "he'd", "i'm", "i've", "i'll", "i'd", "isn't", "there'll", "they're", "they've", "they'll", "thou'rt", "we're", "we've", "we'll", "we'd", "who've", "who'll", "won't", "wouldn't", "you're", "you've", "you'll"];
var sillyContractionsInfo = [
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
var sillyContractionReplacers = /* @__PURE__ */ new Map();
for (let info of sillyContractionsInfo) {
  if (typeof info.wildcardBefore != "string") {
    info.wildcardBefore = info.wildcardBefore ? ".*" : "";
  }
  if (typeof info.wildcardAfter != "string") {
    info.wildcardAfter = info.wildcardAfter ? ".*" : "";
  }
  info.matchRegexTerm = `${info.wildcardBefore}(${info.term})${info.wildcardAfter}`;
  info.replaceRegex = new RegExp(`(^${info.wildcardBefore})${info.term}(${info.wildcardAfter}$)`);
  sillyContractionReplacers.set(info.term, (str) => str.replace(info.replaceRegex, `$1${info.replaceWith}$2`));
}
var sillyContractionsRegex = new RegExp("^" + sillyContractionsInfo.map((i) => i.matchRegexTerm).join("|") + "$", "g");
function wildcardReplacer() {
  let args = [...arguments];
  let match = args[0];
  let parenGroups = args.slice(1, args.findIndex((a) => typeof a == "number"));
  let term = parenGroups.filter((g) => typeof g != "undefined")[0];
  let replacer = sillyContractionReplacers.get(term);
  return replacer ? replacer(match) : match;
}
function contractionFixer(token) {
  let str = token.str;
  if (str)
    str = str.replaceAll("`", "'");
  if (!str || !str.includes("'")) {
    return token;
  }
  if (commonContractionsList.includes(str)) {
    token.str = str.replaceAll("'", "");
    return token;
  }
  let apostropheCount = [...str].filter((c) => c == "'").length;
  for (let i = 0; i < apostropheCount; i++) {
    str = str.replace(sillyContractionsRegex, wildcardReplacer);
  }
  str = str.replaceAll("'", "");
  let bestGuessToken = token.clone();
  bestGuessToken.str = str;
  token.str = token.str.replaceAll("'", "");
  if (bestGuessToken.str == token.str) {
    return token;
  }
  return [token, bestGuessToken];
}
var contraction_fixer_default = contractionFixer;

// src/hymnsDb/search/pipeline/console-logger.js
function consoleLogger(token) {
  console.log("token", token.str);
  return token;
}
var console_logger_default = consoleLogger;

// src/hymnsDb/search/hymns-db-indexer.js
var MAX_PHRASE_LENGTH = 2;
var collator = new Intl.Collator("en", { sensitivity: "base", ignorePunctuation: true });
function buildSearchIndex(documents) {
  var hymnalPlugin = function(builder) {
    builder.tokenizer = hymnal_tokenizer_default;
    builder.tokenizer.separator = /[\-\s,]/;
    builder.tokenizer.maxPhraseLength = MAX_PHRASE_LENGTH;
    import_lunr4.default.Pipeline.registerFunction(hymnal_trimmer_default, "hymnalTrimmer");
    import_lunr4.default.Pipeline.registerFunction(contraction_fixer_default, "contractionFixer");
    import_lunr4.default.Pipeline.registerFunction(hymnal_stemmer_default, "hymnalStemmer");
    import_lunr4.default.Pipeline.registerFunction(blank_killer_default, "blankKiller");
    import_lunr4.default.Pipeline.registerFunction(console_logger_default, "consoleLogger");
    builder.pipeline.reset();
    builder.pipeline.add(
      hymnal_trimmer_default,
      contraction_fixer_default,
      import_lunr4.default.stopWordFilter,
      hymnal_stemmer_default,
      blank_killer_default
    );
    builder.searchPipeline.reset();
    builder.searchPipeline.add(
      hymnal_trimmer_default,
      contraction_fixer_default,
      hymnal_stemmer_default
    );
  };
  let docsArray = [...documents.values()];
  let fieldNames = [...new Set(docsArray.flatMap((d) => Object.keys(d)))];
  fieldNames = fieldNames.filter((f) => !["hymnId", "line00", "chorus00", "url"].includes(f));
  let searchIndex = (0, import_lunr4.default)(function() {
    this.use(hymnalPlugin);
    this.metadataWhitelist = ["position"];
    this.ref("hymnId");
    this.field("title", { boost: 3 });
    this.field("line00", { boost: 1.5 });
    this.field("chorus00", { boost: 2 });
    fieldNames.forEach((f) => this.field(f));
    docsArray.forEach((d) => this.add(d));
  });
  return searchIndex;
}
function buildDocuments(hymns3) {
  let documents = /* @__PURE__ */ new Map();
  for (let hymn of hymns3.values()) {
    if (hymn.isStub)
      continue;
    let doc = {
      hymnId: hymn.hymnId,
      title: hymn.title,
      url: hymn.url
    };
    let lines = hymn.lines.filter((l) => l.type != "copyright").map((l) => Object.assign({}, l));
    let mainLines = lines.filter((l) => l.type != "chorus").map((l) => getInnerText(l.html));
    Object.assign(doc, linesToProps("line", mainLines));
    let chorusLines = lines.filter((l) => l.type == "chorus").map((l) => getInnerText(l.html));
    let uniqueChorusLines = chorusLines.reduce((uniques, txt) => {
      let existing = uniques.find((u) => isSameText(u.txt, txt));
      if (existing) {
        existing.count++;
      } else {
        uniques.push({ txt, count: 1 });
      }
      return uniques;
    }, []);
    uniqueChorusLines.sort((a, b) => b.count - a.count);
    uniqueChorusLines = uniqueChorusLines.map((l) => l.txt);
    Object.assign(doc, linesToProps("chorus", uniqueChorusLines));
    documents.set(hymn.hymnId, doc);
  }
  return documents;
}
function linesToProps(key, lines) {
  let result = {};
  lines.forEach((line, i) => {
    let propName = key + i.toString().padStart(2, "0");
    result[propName] = line;
  });
  return result;
}
function getInnerText(html) {
  if (!html)
    return html;
  let text = html;
  if (html.indexOf("<") >= 0) {
    let div = document.createElement("div");
    div.innerHTML = html;
    text = div.innerText;
  }
  text = text.replaceAll(/([,;:!\.\?])([^\s])/g, "$1 $2");
  text = text.replace(/[\s]+/g, " ").trim();
  return text;
}
function isSameText(a, b) {
  return collator.compare(a, b) == 0;
}
import_lunr4.default.utils.warn = function(message) {
  if (console && console.warn)
    console.warn(message);
};

// src/hymnsDb/builders/search-builder.js
var index = void 0;
var hymns2 = void 0;
var docs = void 0;
var HYMNS_PER_PAGE = 30;
var SearchBuilder = class {
  static async build(hymnsDbInstance2) {
    hymns2 = hymnsDbInstance2.getAllHymns();
    docs = buildDocuments(hymns2);
    index = buildSearchIndex(docs);
    hymnsDbInstance2.search = function(strQuery, page) {
      let clauses = buildClauses(strQuery);
      let docResults = index.query(function(q) {
        clauses.forEach((c) => q.term(c.term, c.options));
      });
      let resultsProps = {
        query: strQuery,
        resultCount: docResults.length
      };
      if (page) {
        Object.assign(resultsProps, {
          page,
          perPage: HYMNS_PER_PAGE,
          pageCount: Math.ceil(docResults.length / HYMNS_PER_PAGE)
        });
        let firstResultNo = (page - 1) * HYMNS_PER_PAGE;
        docResults = docResults.slice(firstResultNo, firstResultNo + HYMNS_PER_PAGE);
      } else {
        Object.assign(resultsProps, {
          page: 1,
          perPage: resultsProps.resultCount,
          pageCount: 1
        });
      }
      let results = processSearchResults(docResults);
      Object.assign(results, resultsProps);
      return results;
    };
  }
};
__publicField(SearchBuilder, "functions", ["search"]);
function buildClauses(text) {
  text = normalize_to_ascii_default(text).toLocaleLowerCase();
  let wordsAndPhrases = text.match(/[\-\+]?(".*?"|[^"\s]+)(?=\s*|\s*$)/g);
  wordsAndPhrases = wordsAndPhrases.map((wp) => wp.replaceAll('"', ""));
  let baseClauses = [];
  for (let wop of wordsAndPhrases) {
    let clause = { options: {} };
    if (wop.startsWith("+"))
      clause.options.presence = import_lunr5.default.Query.presence.REQUIRED;
    if (wop.startsWith("-"))
      clause.options.presence = import_lunr5.default.Query.presence.PROHIBITED;
    wop = wop.replace(/^[\-\+]+/, "");
    clause.term = wop;
    let wordCount = (wop.match(/[\s]+/g) || []).length;
    if (wordCount > 1) {
      clause.options.boost = 0.5 + Math.pow(1.1, wordCount - 1);
    }
    baseClauses.push(clause);
  }
  if (!import_lunr5.default.tokenizer.maxPhraseLength || import_lunr5.default.tokenizer.maxPhraseLength <= 1)
    return baseClauses;
  let clausesToChain = [];
  for (let phraseLength = 2; phraseLength <= import_lunr5.default.tokenizer.maxPhraseLength; phraseLength++) {
    for (let i = 0; i <= baseClauses.length - phraseLength; i++) {
      clausesToChain.push(baseClauses.slice(i, i + phraseLength));
    }
  }
  clausesToChain = clausesToChain.filter((chain) => {
    if (chain.some((c) => c.options.presence == import_lunr5.default.Query.presence.PROHIBITED))
      return false;
    if (chain.some((c) => c.term.includes(" ")))
      return false;
    return true;
  });
  let chainedClauses = clausesToChain.map((chain) => {
    let clause = { options: {} };
    let words = chain.map((c) => c.term);
    clause.term = words.join(" ");
    clause.options.boost = Math.pow(1.1, words.length - 1);
    return clause;
  });
  let allClauses = [...baseClauses, ...chainedClauses];
  let uniqueTerms = [...new Set(allClauses.map((c) => c.term))];
  let uniqueClauses = uniqueTerms.map((t) => {
    let matchingClauses = allClauses.filter((c) => c.term == t);
    if (matchingClauses.length == 1)
      return matchingClauses[0];
    let clauseWithPresence = matchingClauses.find((c) => c.presence != import_lunr5.default.Query.presence.OPTIONAL);
    if (clauseWithPresence)
      return clauseWithPresence;
    let maxScore = Math.max(...matchingClauses.map((c) => c.options.boost || 1));
    return matchingClauses.find((c) => (c.options.boost || 1) == maxScore);
  });
  return uniqueClauses;
}
function processSearchResults(rawResults) {
  let processed = rawResults.map((r) => invertSearchResult(r));
  for (let result of processed) {
    result.title = addHighlights(result.fields["title"]);
    result.preview = addHighlights(findPreviewField(result)) || "No preview";
    result.hymn = hymns2.get(result.hymnId);
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
  let doc = docs.get(invertedResult.hymnId);
  let fieldIds = Object.keys(doc);
  let md = rawResult.matchData.metadata;
  for (let fieldId of fieldIds) {
    let fieldInfo = {
      fieldId,
      text: doc[fieldId],
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
  let fieldInfos = Object.values(result.fields).filter((f) => f.fieldId.startsWith("chorus") || f.fieldId.startsWith("line"));
  for (let fieldInfo of fieldInfos) {
    let keywordCount = fieldInfo.keywords.length;
    let keywordMatchCount = fieldInfo.keywords.map((k) => Math.min(k.markPositions.length, 9)).reduce((a, b) => a + b, 0);
    fieldInfo.keywordMatchScore = 100 * keywordCount + keywordMatchCount;
  }
  fieldInfos.sort((a, b) => b.keywordMatchScore - a.keywordMatchScore);
  let highScore = fieldInfos[0].keywordMatchScore;
  if (highScore == 0)
    return result.fields["line00"];
  let bestFieldInfos = fieldInfos.filter((f) => f.keywordMatchScore == highScore);
  if (bestFieldInfos.length == 1)
    return bestFieldInfos[0];
  let selectedFieldId;
  let fieldIds = bestFieldInfos.map((m) => m.fieldId);
  let verseMatches = fieldIds.filter((f) => f.startsWith("line"));
  verseMatches.sort();
  let chorusMatches = fieldIds.filter((f) => f.startsWith("chorus"));
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
  let allMarkPositions = fieldInfo.keywords.flatMap((k) => k.markPositions).map((p) => [p[0], p[0] + p[1]]);
  allMarkPositions.sort((a, b) => a[0] - b[0]);
  let combinedMarkPositions = allMarkPositions.reduce((all, p) => {
    if (all.length == 0)
      return [p];
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
    highlighted += `<mark>${fieldInfo.text.substring(p[0], p[1])}</mark>`;
    cursor = p[1];
  }
  highlighted += fieldInfo.text.substring(cursor);
  return highlighted;
}
var search_builder_default = SearchBuilder;

// src/hymnsDb/hymns-db.js
var forceDelayTimeout = 1e3;
var objTypes = {};
[hymnal_builder_default, hymns_builder_default, hymnal_section_builder_default, search_builder_default].forEach((obj) => objTypes[obj.name] = obj);
var helperOptions2 = hymns_db_abstract_default.helperOptions;
for (let ho of helperOptions2.filter((h) => h.objType)) {
  ho.obj = objTypes[ho.objType];
}
var ownOptions = helperOptions2.find((ho) => ho.id == "hymnsDb");
var HymnsDb = class extends hymns_db_abstract_default {
  constructor() {
    verifyEnvironment();
    console.log("Initializing HymnsDb");
    super();
    let helpers = helperOptions2.reduce((helpers2, options) => {
      let helper = Object.assign({ ready: hymns_db_abstract_default.getExposedPromise() }, options);
      helper.dependsOn = (helper.dependsOn || []).map((id) => id);
      helpers2[options.id] = helper;
      helper.ready.then(() => console.log("helper ready", options.id, "functions", (options.obj || {}).functions));
      return helpers2;
    }, {});
    Object.values(helpers).forEach((h) => h.dependsOn = h.dependsOn.map((id) => helpers[id]));
    this.promises = Object.values(helpers).reduce((promises, helper) => {
      promises[helper.id] = helper.ready;
      return promises;
    }, {});
    let forceDelay = () => new Promise((r) => setTimeout(r, forceDelayTimeout));
    for (let helper of Object.values(helpers)) {
      let precedentPromise = Promise.all(helper.dependsOn.map((h) => h.ready));
      precedentPromise.catch((r) => helper.ready.reject(r));
      let fnBuild = helper.obj && helper.obj.build ? helper.obj.build : () => true;
      let buildPromise = precedentPromise.then(() => fnBuild(this));
      buildPromise.then(() => forceDelay()).then(() => helper.ready.resolve());
      buildPromise.catch((r) => helper.ready.reject(r));
    }
    forceDelay().then(() => this.promises[ownOptions.id].resolve());
  }
  async awaitReady(helperId) {
    await this.promises[helperId];
  }
};
function verifyEnvironment() {
  try {
    if (self instanceof SharedWorkerGlobalScope)
      return true;
  } catch {
    let message = "Warning! HymnsDb instance created in main browser window. For performance reasons, HymnsDb should only be instantiated in a SharedWorker!";
    if (window) {
      console.warn(message);
    } else {
      throw new Error(message);
    }
  }
}
var hymns_db_default = HymnsDb;

// src/hymnsdb/hymns-db-worker.js
var hymnsDbInstance = new hymns_db_default();
self.hymnsDb = hymnsDbInstance;
async function messageHandler(message) {
  let functionName = message.fn;
  if (!functionName && typeof message == "string")
    functionName = message;
  if (!functionName) {
    let errorMessage = "hymns-db-worker: no function name specified";
    console.error(errorMessage, message);
    throw new Error(msg);
  }
  let fn = self.hymnsDb[functionName];
  let args = message.args || [];
  let result = await fn.apply(self.hymnsDb, args);
  return result;
}
var promiseWorker = new PWBWorker();
promiseWorker.register(messageHandler);
var hymns_db_worker_default = self;
export {
  hymns_db_worker_default as default,
  hymnsDbInstance
};
/*!
 * lunr.Builder
 * Copyright (C) 2020 Oliver Nightingale
 */
/*!
 * lunr.Index
 * Copyright (C) 2020 Oliver Nightingale
 */
/*!
 * lunr.Pipeline
 * Copyright (C) 2020 Oliver Nightingale
 */
/*!
 * lunr.Set
 * Copyright (C) 2020 Oliver Nightingale
 */
/*!
 * lunr.TokenSet
 * Copyright (C) 2020 Oliver Nightingale
 */
/*!
 * lunr.Vector
 * Copyright (C) 2020 Oliver Nightingale
 */
/*!
 * lunr.stemmer
 * Copyright (C) 2020 Oliver Nightingale
 * Includes code from - http://tartarus.org/~martin/PorterStemmer/js.txt
 */
/*!
 * lunr.stopWordFilter
 * Copyright (C) 2020 Oliver Nightingale
 */
/*!
 * lunr.tokenizer
 * Copyright (C) 2020 Oliver Nightingale
 */
/*!
 * lunr.trimmer
 * Copyright (C) 2020 Oliver Nightingale
 */
/*!
 * lunr.utils
 * Copyright (C) 2020 Oliver Nightingale
 */
/**
 * lunr - http://lunrjs.com - A bit like Solr, but much smaller and not as bright - 2.3.9
 * Copyright (C) 2020 Oliver Nightingale
 * @license MIT
 */
