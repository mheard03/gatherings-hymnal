<template>
  <nav id="primaryNav" class="scaled navbar navbar-expand-lg navbar-dark bg-primary">
    <div class="container flex-nowrap overflow-hidden">
      <button class="btn btn-fill back" @click="$router.push('/')"><svg class="icon"><use href="#back" /></svg></button>
      <a class="navbar-brand flex-fill me-2 overflow-hidden">
        {{ hymnal.title }}
      </a>
      <button class="btn btn-fill"><svg class="icon"><use href="#text-options" /></svg></button>
    </div>
  </nav>
  <main>
    <div id="header-row" class="mt-0 pt-3 pb-3 mb-3">
      <div class="container">
        <div class="d-flex flex-fill align-items-center">
          <h1 class="flex-grow-1">All hymns</h1>
          <label class="col-form-label pe-2 text-nowrap scaled">Sort:</label>
          <div class="btn-group scaled" role="group" aria-label="Sort">
            <router-link :class="['btn', (sort == 'alpha') ? 'btn-fill' : 'btn-outline']" :to="{ name: 'hymnal', query: { hymnal: hymnal.hymnalId, sort: 'alpha' }}" replace>A-Z</router-link>
            <router-link :class="['btn', (sort == 'num') ? 'btn-fill' : 'btn-outline']" :to="{ name: 'hymnal', query: { hymnal: hymnal.hymnalId, sort: 'num' }}" replace>1-9</router-link>
          </div>
        </div>
      </div>
    </div>

    <div class="container">
      <template v-for="section of sections">
        <HymnalSection :sectionModel="section"></HymnalSection>
      </template>
    </div>
  </main>
</template>

<script>

/* 
"sections": [
  { "name": "Hymns of Worship", "range": [1, 82], "children": [
    { "name": "The Father", "range": [34, 40] },
    { "name": "Christ", "range": [41, 67] },
    { "name": "Lord's Day", "range": [68, 69] },
    { "name": "Morning", "range": [70, 73] },
    { "name": "Evening", "range": [74, 79] },
    { "name": "Closing", "range": [80, 82] }
  ] },
*/

import { scaleLinear } from 'd3-scale';
import { HymnalSectionModel as SectionModel } from '../components/HymnalSectionModel.js';
import HymnalSection from '../components/HymnalSection.vue';

export default {
  inject: ['hymnsDB', 'userSettings'],
  props: {
    hymnalId: { required: true },
    sort: { default: "num" }
  },
  data() {
    let hymnal = this.hymnsDB.hymnals[this.hymnalId];
    return {
      hymnal,
      hymnalHasSections: !!hymnal.sections,
      hymns: this.hymnsDB.getHymns(this.hymnalId)
    }
  },
  components: {
    HymnalSection
  },
  watch: {
    sort() {
      console.log('sortchange');
      this.$forceUpdate();
    } 
  },
  computed: {
    sections() {
      console.log('getOrCreate');
      let sections = [];
      if (this.sort == "alpha") {
        // A-Z headings
        this.hymns.sort((a,b) => a.title.localeCompare(b.title, undefined, { sensitivity: 'base' }));

        let alphaHymns = this.hymns.filter(h => /[A-Z]/i.test(h.title));
        let firstLetters = [...new Set(alphaHymns.map(h => h.title[0].toLocaleUpperCase()))];
        firstLetters.sort();
        for (let letter of firstLetters) {
          sections.push(new SectionModel({ 
            name: letter, 
            hymns: alphaHymns.filter(h => h.title.toLocaleUpperCase().startsWith(letter))
          }));
        }

        let nonAlphaHymns = this.hymns.filter(h => !/[A-Z]/i.test(h.title));
        if (nonAlphaHymns.length) {
          sections.unshift(new SectionModel({ 
            name: "0-9", 
            hymns: nonAlphaHymns
          }));
        }
      }
      else {
        this.hymns.sort((a,b) => {
          let result = a.hymnNo - b.hymnNo;
          if (result == 0) result = a.suffix.localeCompare(b.suffix);
          return result;
        });
        if (this.hymnalHasSections) {
          sections = this.hymnal.sections.map(s => new SectionModel(s));
        }
        else {
          // Numeric headings
          const sectionSize = 100;
          const minHymnsPerTick = 20;
          const scale = scaleLinear().domain([1, this.hymns.length]);
          let ticks = scale.ticks();
          if (ticks[0] < minHymnsPerTick) {
            let tickCount = scale.domain()[1] / minHymnsPerTick;
            ticks = scale.ticks(tickCount);
          }

          let firstHymnNo = Math.min(...this.hymns.map(h => h.hymnNo));
          let lastHymnNo = Math.max(...this.hymns.map(h => h.hymnNo));
          if (ticks[ticks.length - 1] == lastHymnNo) {
            ticks.pop();
          }
          if (ticks.length < 2) {
            // No headings, just one big Section
            sections.push(new SectionModel({ name: "", range: [firstHymnNo, lastHymnNo] }));
          }
          else {
            // convert ticks to sections
            ticks.unshift(firstHymnNo);
            for (let i = 0; i < ticks.length; i++) {
              let rangeStart = ticks[i];
              let rangeEnd = (i == ticks.length - 1) ? lastHymnNo : ticks[i+1] - 1;
              sections.push(new SectionModel({ name: `${rangeStart}-${rangeEnd}`, range: [rangeStart, rangeEnd] }));
            }
          }
        }
        sections.forEach(s => s.populateHymnsFromRanges(this.hymns));
      }
/*
      // populate display headings
      for (let i = 0; i < sections.length; i++) {
        let section = sections[i];
        section.prevSection = sections[i-1];
        section.name = section.headers[section.headers.length - 1];
        section.headingText = section.headers.join(": ");
        section.id = section.headers.join(" ")
          .toLocaleLowerCase()
          .replace(/[\s]+/g, " ")
          .replaceAll(" ", "-")
          .replace(/[^a-z\-]/gi, "");          

        if (section.prevSection && section.prevSection.headers.length > section.headers.length) {
          section.isOutdent = true;
        }
      }
*/
      return sections;
    },
  }
}

/*

export default {
  inject: ['hymnsDB', 'userSettings'],
  props: {
    hymnalId: { required: true },
    sort: { default: "num" }
  },
  data() {
    let hymnal = this.hymnsDB.hymnals[this.hymnalId];
    return {
      hymnal,
      hymnalHasSections: !!hymnal.sections,
      hymns: this.hymnsDB.getHymns(this.hymnalId),
      sections: [],
      baseHeadingLevel: 2
    }
  },
  mounted() {
    this.sections = this.getOrCreateSections();
  },
  methods: {
    getOrCreateSections() {
      let sections = [];
      if (this.sort == "alpha") {
        // A-Z headings
        this.hymns.sort((a,b) => a.title.localeCompare(b.title, undefined, { sensitivity: 'base' }));

        let alphaHymns = this.hymns.filter(h => /[A-Z]/i.test(h.title));
        let firstLetters = [...new Set(alphaHymns.map(h => h.title[0].toLocaleUpperCase()))];
        firstLetters.sort();
        for (let letter of firstLetters) {
          sections.push({ 
            headers: [letter], 
            hymns: alphaHymns.filter(h => h.title.toLocaleUpperCase().startsWith(letter))
          });
        }

        let nonAlphaHymns = this.hymns.filter(h => !/[A-Z]/i.test(h.title));
        if (nonAlphaHymns.length) {
          sections.unshift({ headers: ["0-9"], hymns: nonAlphaHymns });
        }
      }
      else {
        if (this.hymnalHasSections) {
          // Hymnal-specific headings
          let createSection = () => { 
            let s = { headers: [], hymns: [] };
            sections.push(s);
            return s;
          };
          let compareHeadings = (hymn1, hymn2) => {
            if (!hymn1 || !hymn2) return false;
            let headers1 = hymn1.sectionHeaders || [];
            let headers2 = hymn2.sectionHeaders || [];
            if (headers1.length != headers2.length) return false;
            for (let i = 0; i < headers1.length; i++) {
              if (headers1[i] != headers2[i]) return false;
            }
            return true;
          };

          let section;
          for (let i = 0; i < this.hymns.length; i++) {
            let prevHymn = this.hymns[i-1];
            let hymn = this.hymns[i];
            if (!compareHeadings(hymn, prevHymn)) {
              section = createSection();
              section.headers = [...hymn.sectionHeaders];
            }
            section.hymns.push(hymn);
          }
        }
        else {
          // Numeric headings
          const sectionSize = 100;
          let lastHymnNo = Math.max(...this.hymns.map(h => h.hymnNo));
          let sectionCount = Math.ceil(lastHymnNo / 100);

          for (let i = 0; i < sectionCount; i++) {
            let range = [i, (i+1) * sectionSize - 1];
            let hymnsInRange = this.hymns.filter(h => h.hymnNo >= range[0] || h.hymnNo <= range[1]);
            let name = `${hymnsInRange[0].hymnNo} &ndash; ${hymnsInRange[hymnsInRange.length - 1].hymnNo}`;
            sections.push({ headers: [name], hymns: hymnsInRange });
          }
        }
      }

      // populate display headings
      for (let i = 0; i < sections.length; i++) {
        let section = sections[i];
        section.prevSection = sections[i-1];
        section.name = section.headers[section.headers.length - 1];
        section.headingText = section.headers.join(": ");
        section.id = section.headers.join(" ")
          .toLocaleLowerCase()
          .replace(/[\s]+/g, " ")
          .replaceAll(" ", "-")
          .replace(/[^a-z\-]/gi, "");          

        if (section.prevSection && section.prevSection.headers.length > section.headers.length) {
          section.isOutdent = true;
        }
      }

      return sections;
    },
  }
}




function getHymnChunksNumeric(hymnsArray) {
}
function getHymnChunks(hymnsArray, sort) {
  let chunk, prevChunk;
  let chunks = [];

  for (let i = 0; i < hymnsArray.length; i++) {
    let hymn = hymnsArray[i];

    if (chunk) {
      let hymnHeadings = getHymnHeadings(hymn);
      let startNewChunk = (hymnHeadings.length != chunk.headings.length);
      if (!startNewChunk) {
        for (let i = 0; i < hymnHeadings.length; i++) {
          let h = hymnHeadings[i];
          if (!chunk.headings[i] || h.text != chunk.headings[i].text) {
            startNewChunk = true;
            break;
          }
        }
      }

      if (startNewChunk) {
        prevChunk = chunk;
        chunk = undefined;
      }
    }

    if (!chunk) {
      chunk = {
        headings: getHymnHeadings(hymn),
        outdentLevel: 0,
        hymns: []
      };
      if (prevChunk) {
        chunk.outdentLevel = Math.max(prevChunk.headings.length - chunk.headings.length, 0);
        /*
        let prevHeadings = prevChunk.headings;
        chunk.displayHeadings = chunk.headings.filter((h, j) => !prevChunk.headings[j] || 
          prevHeadings[j].text != h.text || 
          prevHeadings[j].level != h.level);
        
      }
      /*
      else {
        chunk.displayHeadings = chunk.headings;
      }
      
      chunk.displayHeading = {
        level: chunk.headings[chunk.headings.length - 1].level,
        text: chunk.headings.map(h => h.text).join(": ")
      };

      chunks.push(chunk);
    }

    console.log('')
    chunk.hymns.push(hymn);
  }

  if (sort == "alpha") {
    for (let chunk of chunks) {
      console.log('chunk', chunk.hymns)
      chunk.hymns.sort((a,b) => a.title.localeCompare(b.title, undefined, { sensitivity: 'base' }));
    }
  }

  console.log('chunks', chunks);
  return chunks;
}

function getHymnHeadings(hymn) {
  if (!hymn || !hymn.sectionHeaders) return [];
  return hymn.sectionHeaders.map((h, i) => { return { level: `h${i + baseHeadingLevel}`, text: h } });
}
*/
</script>
