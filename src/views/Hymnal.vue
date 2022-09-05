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
    <div class="top-block pb-1">
      <div class="container">
        <div class="d-flex flex-wrap flex-fill align-items-center text-nowrap">
          <h1 class="flex-grow-1 mb-0">All Songs</h1>
          <div class="flex-shrink-0 btn-group scaled ms-auto mb-2" role="group" aria-label="Sort">
            <router-link :class="['btn', (sort == 'alpha') ? 'btn-fill' : 'btn-outline']" :to="{ name: 'hymnal', query: { hymnal: hymnal.hymnalId, sort: 'alpha' }}" replace>A-Z</router-link>
            <router-link :class="['btn', (sort == 'numeric') ? 'btn-fill' : 'btn-outline']" :to="{ name: 'hymnal', query: { hymnal: hymnal.hymnalId, sort: 'numeric' }}" replace>1-9</router-link>
          </div>
        </div>
      </div>
    </div>

    <HymnalToc ref="toc" :sections="sections" :activeSectionId="currentSectionId" @input="onTocSelection"></HymnalToc>
    
    <HymnsDbProgress progressProp="hymns">
      <div id="sectionListing" class="container" ref="sectionListing">
        <template v-for="section of sections">
          <HymnalSection :sectionModel="section"></HymnalSection>
        </template>
      </div>
    </HymnsDbProgress>
  </main>
</template>

<script>
import { HymnalSectionModel as SectionModel } from '@/components/HymnalSectionModel.js';

import HymnsDbProgress from '@/components/HymnsDbProgress.vue';
import HymnalSection from '@/components/HymnalSection.vue';
import HymnalToc from '@/components/HymnalToc.vue';

export default {
  components: { HymnalSection, HymnalToc, HymnsDbProgress },
  props: {
    hymnalId: { required: true },
    sort: { default: "numeric" }
  },  
  data() {
    return {
      hymnal: { title: "Loading..." },
      rawSections: { numeric: [], alpha: [] },
      sections: [],
      scrollPosition: 0,
      leafSectionTags: [],
      currentSectionId: undefined
    }
  },
  async mounted() {
    document.addEventListener('scroll', this.onScroll);
    document.addEventListener('resize', this.onScroll);
    this.onScroll();

    this.hymnal = await this.$hymnsDb.getHymnal(this.hymnalId);
    this.hymns = await this.$hymnsDb.getHymns(this.hymnalId);
    this.rawSections = await this.$hymnsDb.getHymnalSections(this.hymnalId);
    this.sections = this.rawSections[this.sort].map(s => new SectionModel(s));
  },
  unmounted() {
    document.removeEventListener('scroll', this.onScroll);
    document.removeEventListener('resize', this.onScroll);
  },
  watch: {
    sort() {
      this.sections = this.rawSections[this.sort].map(s => new SectionModel(s));
    },
    sections: {
      async handler(newValue) {
        newValue.forEach(s => s.populateHymns(this.hymns));

        this.currentSectionId = undefined;
        await this.$nextTick();

        let listing = document.getElementById("sectionListing");
        this.leafSectionTags = [...document.querySelectorAll("#sectionListing section")]
          .filter(s => !s.querySelector("section"));
        this.onScrollChange();
        this.$forceUpdate();
      },
      immediate: true
    },
    async scrollPosition() {
      this.onScrollChange();
    }
  },
  methods: {
    onScroll() {
      let oldPosition = this.scrollPosition;
      let newPosition = document.scrollingElement.scrollTop;
      if (newPosition == 0 || Math.abs(newPosition - oldPosition) > 8) {
        this.scrollPosition = document.scrollingElement.scrollTop;
      }
    },
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
  }
}
</script>

<style type="text/css">
  main.hymnal {
    margin-bottom: 66vh;
  }
  main.hymnal .top-block {
    margin-bottom: 0 !important;
    border-bottom: none !important;
    padding-bottom: 0.5rem !important;
  }

</style>
