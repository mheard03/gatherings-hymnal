<template>
  <nav id="primaryNav" class="scaled navbar navbar-expand-lg navbar-dark bg-primary">
    <div class="container flex-nowrap overflow-hidden">
      <button class="btn btn-fill back" @click="$router.backOrDefault()"><svg class="icon"><use href="#back" /></svg></button>
      <a class="navbar-brand flex-fill me-2 overflow-hidden">
        {{ hymnal.title }}
      </a>
      <button class="btn btn-fill"><svg class="icon"><use href="#text-options" /></svg></button>
    </div>
  </nav>
  <main class="hymnal">
    <div class="top-block">
      <div class="container">
        <div class="d-flex flex-wrap flex-fill align-items-center text-nowrap">
          <h1 class="flex-grow-1 mb-0">All Songs</h1>
          <div class="flex-shrink-0 btn-group scaled ms-auto mb-2" role="group" aria-label="Sort">
            <router-link :class="['btn', (sort == 'alpha') ? 'btn-fill' : 'btn-outline']" :to="{ name: 'hymnal', query: { hymnal: hymnal.hymnalId, sort: 'alpha' }}" replace>A-Z</router-link>
            <router-link :class="['btn', (sort == 'num') ? 'btn-fill' : 'btn-outline']" :to="{ name: 'hymnal', query: { hymnal: hymnal.hymnalId, sort: 'num' }}" replace>1-9</router-link>
          </div>
        </div>
      </div>
    </div>

    <HymnalToc ref="toc" :sections="sections" :activeSectionId="currentSectionId" @input="onTocSelection"></HymnalToc>

    <div id="sectionListing" class="container" ref="sectionListing">
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
import { HymnalSectionModel as SectionModel } from '@/components/HymnalSectionModel.js';
import HymnalSection from '@/components/HymnalSection.vue';
import HymnalToc from '@/components/HymnalToc.vue';
import { nextTick } from 'vue';
import * as bootstrap from 'bootstrap';
import maxSize from 'popper-max-size-modifier';
window.bootstrap = bootstrap;

export default {
  inject: ['hymnsDB'],
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
      scrollPosition: 0,
      leafSectionTags: [],
      currentSectionId: undefined
    }
  },
  components: {
    HymnalSection, HymnalToc
  },
  watch: {
    sort() {
      this.$forceUpdate();
    },
    sections: {
      async handler() {
        this.currentSectionId = undefined;
        await nextTick();

        let listing = document.getElementById("sectionListing");
        this.leafSectionTags = [...document.querySelectorAll("#sectionListing section")]
          .filter(s => !s.querySelector("section"));
        this.onScrollChange();
      },
      immediate: true
    },
    async scrollPosition() {
      this.onScrollChange();
    },
    /*
    currentSectionId(newValue) {
      console.log('currentSectionId change', newValue);
      let currentSection = document.getElementById(newValue);
      while (currentSection) {
        let currentHeading = currentSection.querySelector("h1, h2, h3, h4, h5, h6");
        if (currentHeading) {
          this.tocLabel = currentHeading.innerText;
          return;
        }
        else { 
          currentSection = currentSection.parentElement.closest("section");
        }
      }
      if (!currentSection) {
        this.tocLabel = "Contents";
      }      
    } */
  },
  async mounted() {
    document.addEventListener('scroll', this.onScroll);
    document.addEventListener('resize', this.onScroll);
    this.onScroll();
  },
  unmounted() {
    document.removeEventListener('scroll', this.onScroll);
    document.removeEventListener('resize', this.onScroll);
  },
  methods: {
    onScroll() {
      let oldPosition = this.scrollPosition;
      let newPosition = document.scrollingElement.scrollTop;
      if (newPosition == 0 || Math.abs(newPosition - oldPosition) > 8) {
        this.scrollPosition = document.scrollingElement.scrollTop;
      }
    },/*
    async updateTocScrollPosition() {
      await nextTick();
      let activeItem = document.querySelector("#tocContainer a.active");
      if (activeItem) {
        activeItem.scrollIntoView({ block: "center" });
      }
    },*/
    onScrollChange() {
      let bodyTop = document.scrollingElement.scrollTop;

      let firstSection = this.leafSectionTags[0];

      let activeSection = undefined;
      let tocHeight = this.$refs.toc.getHeight();

      for (let section of this.leafSectionTags) {
        let clientTop = section.offsetTop - bodyTop;
        let clientBottom = clientTop + section.clientHeight;
        if (section == firstSection && clientTop > tocHeight) {
          activeSection = undefined;
          break;
        }
        if (clientBottom > tocHeight) {
          activeSection = section;
          break;
        }
      }

      if (activeSection) {
        this.currentSectionId = activeSection.id;
      }
      else {
        this.currentSectionId = undefined;
      }
    },
    onTocSelection(sectionId) {
      let section = document.querySelector("#" + sectionId);
      if (section) {
        this.currentSectionId = sectionId;
        let { name, path, query } = this.$router.currentRoute.value;
        document.scrollingElement.style.scrollBehavior = "auto";
        this.$router.replace({ name, path, query, hash: "#" + sectionId });
        document.scrollingElement.style.scrollBehavior = "";
      }
    }
  },
  computed: {
    sections() {
      let sections = [];
      if (this.sort == "alpha") {
        // A-Z headings
        // TODO: Smarter chunking. Use https://observablehq.com/d/92bf24b8a3524026
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
      return sections;
    },
  }
}
</script>

<style type="text/css">
  #sectionListing section::before { 
    display: block; 
    content: " "; 
    margin-top: calc(var(--input-height) * -1); 
    height: var(--input-height); 
    visibility: hidden; 
    pointer-events: none;
  }

  #sectionListing li {
    margin-bottom: max(0px, calc(40px - var(--font-size) * 1.5));
  }
  #sectionListing li::marker {
    content: var(--hymnNo);
    color: var(--ui-color);
  }
  .hymnalSection > h2 {
    margin-top: 1.5rem;
  }
  .hymnalSection > h3 {
    margin-top: 0.5rem;
  }

  main.hymnal {
    margin-bottom: 66vh;
  }
</style>
