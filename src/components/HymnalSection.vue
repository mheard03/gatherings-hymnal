<template>
  <section :id="sectionModel.htmlId" :class="className">
    <component v-if="headingText" :is="headingTag">{{ headingText }}</component>
    <template v-if="renderMode == 'children'">
      <template v-for="child of sectionModel.children" v-bind:key="child.htmlId">
        <HymnalSection :sectionModel="child"></HymnalSection>
      </template>
    </template>
    <template v-if="renderMode == 'hymns'">
      <ul>
        <template v-for="hymn of sectionModel.hymns">
          <li :style="`--hymnNo: '${hymn.hymnNoTxt}'`">
            <a :href="hymn.url">{{ hymn.hymnNoTxt }}. {{ hymn.title }}</a>
          </li>
        </template>
      </ul>     
    </template>
  </section>
</template>
<script>
const baseHeadingLevel = 2;
export default {
  props: {
    sectionModel: { required: true }
  },
  computed: {
    className() {
      let isOutdent = this.sectionModel.isVirtual && this.sectionModel.index > 0;
      return (isOutdent) ? "border-top" : "";
    },
    headingTag() {
      return "h" + (this.sectionModel.level + baseHeadingLevel);
    },
    headingText() {
      if (!this.sectionModel.name) return "";
      return this.sectionModel.ancestorsAndSelf
        .map(a => a.name)
        .filter(a => a)
        .join(": ");
    },
    renderMode() {
      if (this.sectionModel.children.length > 0) return "children";
      if (this.sectionModel.hymns.length > 0) return "hymns";
      return "";
    }
  },
  watch: {
    sectionModel(newValue) {
      console.log('sectionModelChange', newValue);
    }
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
