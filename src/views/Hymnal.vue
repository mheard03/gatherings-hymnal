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
  <main class="hymnal">
    <div id="header-row" class="mt-0 pt-3 pb-3 mb-3 bg-white border-bottom">
      <div class="container">
        <div class="d-flex flex-wrap flex-fill align-items-center text-nowrap">
          <h1 class="flex-grow-1">All Songs</h1>
          <div class="flex-shrink-0 btn-group scaled ms-auto mb-2" role="group" aria-label="Sort">
            <router-link :class="['btn', (sort == 'alpha') ? 'btn-fill' : 'btn-outline']" :to="{ name: 'hymnal', query: { hymnal: hymnal.hymnalId, sort: 'alpha' }}" replace>A-Z</router-link>
            <router-link :class="['btn', (sort == 'num') ? 'btn-fill' : 'btn-outline']" :to="{ name: 'hymnal', query: { hymnal: hymnal.hymnalId, sort: 'num' }}" replace>1-9</router-link>
          </div>
        </div>
      </div>
    </div>

    <div id="tocContainer" class="">
      <div class="bg-white border-bottom">
        <div class="dropdown">
          <div id="tocCurrent" data-bs-toggle="dropdown" data-bs-offset="0, -10" aria-expanded="false" ref="tocDropdownToggle" class="container">
            <div id="tocHeadClosed">
              <div class="d-flex align-items-center">
                <h5 class="mb-0 flex-grow-1">{{ tocLabel }}</h5>
                <svg class="icon flex-shrink-0"><use href="#toc" /></svg>
              </div>
            </div>
            <div id="tocHeadOpen">
              <div class="d-flex align-items-center">
                <h5 class="mb-0 flex-grow-1">Contents</h5>
                <svg class="icon flex-shrink-0"><use href="#close" /></svg>
              </div>
            </div>
          </div>
          <ul class="dropdown-menu container w-100 scaled" area-labelledby="tocCurrent">
            <template v-for="section of sections">
              <li><a class="dropdown-item" @click="onTocClick" :href="`#${section.htmlId}`" :class="(section.htmlId == currentSectionId) ? 'active' : ''">{{ section.name }}</a></li>
              <template v-for="child of section.children">
                <li class="child" v-if="child.name"><a class="dropdown-item" @click="onTocClick" :class="(section.htmlId == currentSectionId) ? 'active' : ''" :href="`#${child.htmlId}`">{{ child.name }}</a></li>
              </template>
            </template>
          </ul>
        </div>
      </div>
    </div>

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
import { HymnalSectionModel as SectionModel } from '../components/HymnalSectionModel.js';
import HymnalSection from '../components/HymnalSection.vue';
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
      tocLabel: "Contents",
      scrollPosition: 0,
      leafSectionTags: [],
      tocDropdown: undefined,
      currentSectionId: undefined
    }
  },
  components: {
    HymnalSection
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
    scrollPosition() {
      this.onScrollChange();
    },
    currentSectionId(newValue) {
      let hash = (newValue) ? `#${newValue}` : "";
      let { name, path, query } = this.$router.currentRoute.value;
      this.$router.replace({ name, path, query, hash });

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
    }
  },
  mounted() {
    const applyMaxSize = {
      name: 'applyMaxSize',
      enabled: true,
      phase: 'beforeWrite',
      requires: ['maxSize'],
      fn({state}) {
        // The `maxSize` modifier provides this data
        state.styles.popper = {
          ...state.styles.popper,
          maxHeight: `${state.modifiersData.maxSize.height}px`
        };
      }
    };
    let config = {
      popperConfig(defaultBsPopperConfig) {
        let cfg = JSON.parse(JSON.stringify(defaultBsPopperConfig));
        cfg.strategy = 'fixed';
        cfg.tether = false;
        
        cfg.modifiers.push(maxSize);
        cfg.modifiers.push(applyMaxSize);
        
        let flip = cfg.modifiers.find(m => m.name == "flip");
        if (!flip) {
          flip = { name: 'flip', options: {} };
          cfg.modifiers.push(flip);
        }
        flip.enabled = false;

        return cfg;
      }
    }
    this.tocDropdown = new bootstrap.Dropdown(this.$refs.tocDropdownToggle, config);
    document.addEventListener('shown.bs.dropdown', this.updateTocScrollPosition);
    document.addEventListener('scroll', this.onScroll);
    document.addEventListener('resize', this.onScroll);
    this.onScroll();
  },
  unmounted() {
    if (this.tocDropdown) this.tocDropdown.dispose();
    document.removeEventListener('shown.bs.dropdown', this.updateTocScrollPosition);
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
    },
    async updateTocScrollPosition() {
      await nextTick();
      let activeItem = document.querySelector("#tocContainer a.active");
      if (activeItem) {
        activeItem.scrollIntoView({ block: "center" });
      }
    },
    onScrollChange() {
      let bodyTop = document.scrollingElement.scrollTop;
      let tocContainer = document.querySelector("#tocContainer");

      let firstSection = this.leafSectionTags[0];

      let activeSection = undefined;
      let tocHeight = tocContainer.offsetHeight;
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
    onTocClick(e) {
      if (!e.target || !e.target.href) return;

      let tocContainer = document.querySelector("#tocContainer");
      let tocHeight = tocContainer.offsetHeight;

      let url = new URL(e.target.href);     
      let section = document.querySelector(url.hash);
      if (section) {
        let targetY = (section.querySelector("h1, h2, h3, h4, h5, h6") || section).offsetTop;
        document.scrollingElement.style.scrollBehavior = "auto";
        document.scrollingElement.scrollTo({ top: targetY - tocHeight });
        document.scrollingElement.style.scrollBehavior = "";
        nextTick().then(() => {
          this.currentSectionId = url.hash.replace("#", "");
        })
        e.preventDefault();
      }
    }
  },
  computed: {
    sections() {
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
      return sections;
    },
  }
}
</script>

<style type="text/css">
  #sectionListing li {
    margin-bottom: max(0px, calc(40px - var(--font-size) * 1.5));
  }
  #sectionListing li::marker {
    content: var(--hymnNo);
    color: var(--ui-color);
  }
  .hymnalSection + .hymnalSection > h2 {
    margin-top: 1.5rem;
  }
  .hymnalSection + .hymnalSection > h3 {
    margin-top: 0.5rem;
  }
  main .dropdown-menu a.dropdown-item {
    padding-left: var(--bs-gutter-x, 0.75rem);
  }
  main .dropdown-menu .child a.dropdown-item {
    padding-left: calc(var(--bs-gutter-x, 0.75rem) * 2);
  }
  #tocContainer {
    position: sticky;
    top: 0;
    user-select: none;
  }

  #tocHeadClosed,
  .show #tocHeadOpen {
    display: block;
  }
  .show #tocHeadClosed,
  #tocHeadOpen {
    display: none;
  }


  #tocCurrent {
    cursor: pointer;
  }

  #tocCurrent,
  #tocCurrent h5 {
    line-height: var(--input-height);
  }
  #tocContainer .dropdown-menu {
    overflow-y: auto;
  }
  
</style>
