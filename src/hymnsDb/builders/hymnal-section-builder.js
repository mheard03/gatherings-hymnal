import { scaleLinear } from 'd3-scale';
import HymnsDbAbstract from '../hymns-db-abstract.js';

let hymnalSections;

class HymnalSectionBuilder {
  static functions = ["getHymnalSections"];

  static async build(hymnsDbInstance) {
    hymnalSections = new Map();

    let hymnals = hymnsDbInstance.getHymnals();
    for (let hymnal of hymnals.values()) {
      let numeric = hymnal.sections || createNumericSections(hymnsDbInstance, hymnal);
      let alpha = createAlphaSections(hymnsDbInstance, hymnal);
      hymnalSections.set(hymnal.hymnalId, { alpha, numeric });
      delete hymnal.sections;
    }

    hymnsDbInstance.getHymnalSections = function(hymnalId, type) {
      let sections = hymnalSections.get(hymnalId);
      return (type) ? sections[type] : sections;
    };
  }
}

function createAlphaSections(hymnsDbInstance, hymnal) {
  // TODO: Smarter chunking. Use https://observablehq.com/d/92bf24b8a3524026
  let hymns = hymnsDbInstance.getHymns(hymnal.hymnalId);
  hymns.sort(HymnsDbAbstract.hymnCompareAlpha);

  let alphaHymns = hymns.filter(h => /[A-Z]/i.test(h.title));
  let firstLetters = [...new Set(alphaHymns.map(h => h.title[0].toLocaleUpperCase()))];
  firstLetters.sort();

  let sections = [];
  for (let letter of firstLetters) {
    let groupHymns = alphaHymns.filter(h => h.title.toLocaleUpperCase().startsWith(letter));
    sections.push({ name: letter, hymnIds: groupHymns.map(h => h.hymnId) });
  }

  let nonAlphaHymns = hymns.filter(h => !/[A-Z]/i.test(h.title));
  if (nonAlphaHymns.length) {
    sections.push({ name: "0-9", hymnIds: nonAlphaHymns.map(h => h.hymnId) });
  }

  return sections;
}

function createNumericSections(hymnsDbInstance, hymnal) {
  let hymns = hymnsDbInstance.getHymns(hymnal.hymnalId);
  let firstHymnNo = Math.min(...hymns.map(h => h.hymnNo));
  let lastHymnNo = Math.max(...hymns.map(h => h.hymnNo));

  const sectionSize = 100;
  const minHymnsPerTick = 20;
  const scale = scaleLinear().domain([1, hymns.length]);
  let ticks = scale.ticks();
  if (ticks[0] < minHymnsPerTick) {
    let tickCount = scale.domain()[1] / minHymnsPerTick;
    ticks = scale.ticks(tickCount);
  }
  if (ticks[ticks.length - 1] == lastHymnNo) ticks.pop();

  let sections = [];
  if (ticks.length < 2) {
    // No headings, just one big Section
    sections.push({ name: "", range: [firstHymnNo, lastHymnNo] });
  }
  else {
    // convert ticks to sections
    ticks.unshift(firstHymnNo);
    for (let i = 0; i < ticks.length; i++) {
      let rangeStart = ticks[i];
      let rangeEnd = (i == ticks.length - 1) ? lastHymnNo : ticks[i+1] - 1;
      sections.push({ name: `${rangeStart}-${rangeEnd}`, range: [rangeStart, rangeEnd] });
    }
  }

  return sections;
}

export default HymnalSectionBuilder;

/*
Expected sections format: [
  { "name": "Hymns of Worship", "range": [1, 82], "children": [
    { "name": "The Father", "range": [34, 40] },
    { "name": "Christ", "range": [41, 67] },
    { "name": "Lord's Day", "range": [68, 69] },
    { "name": "Morning", "range": [70, 73] },
    { "name": "Evening", "range": [74, 79] },
    { "name": "Closing", "range": [80, 82] }
  ] },
  { "name": "Salvation", "range": [194,236] },
  { "name": "Invitation", "range": [237,254] },
  { "name": "Assurance and Trust", "range": [255,283] }
]
*/