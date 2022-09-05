<template>
  <nav id="primaryNav" class="scaled navbar navbar-expand-lg navbar-dark bg-primary">
    <div class="container flex-nowrap overflow-hidden">
      <button class="btn btn-fill back" @click="$router.backOrDefault()"><svg class="icon"><use href="#back" /></svg></button>
      <a class="navbar-brand flex-fill me-2">Search</a>
      <button class="btn btn-fill"><svg class="icon"><use href="#text-options" /></svg></button>
    </div>
  </nav>
  <main>
    <div class="top-block">
      <div class="container">
        <Search ref="searchForm" initial-mode="keyword" label-class="h1" />
      </div>
    </div>
    <div id="search-results" class="container" v-if="mode == 'keyword'">
      <p class="mb-3">
        <template v-if="pageCount > 1">Page {{ page }} of</template>
        {{ resultCount }} results
      </p>
      <template v-for="result of results" key="hymnId">
        <div class="result" :class="'theme-' + result.hymnalId">
          <div class="hymnal-label scaled"><span class="rounded">{{ result.hymn.hymnal.title }}</span></div>
          <a class="result-link fs-5" :href="result.hymn.url" @click.stop.prevent="onResultClick(result.hymn)"><span v-html="result.hymn.title"></span></a>
          <p class="result-preview" v-if="result.preview" v-html="result.preview"></p>
        </div>
      </template>
    </div>
  </main>
</template>

<script>
import Search from '../components/Search.vue';

export default {
  props: {
    keywords: { type: String, required: false, default: "" },
    page: { type: Number, required: false, default: 1 }
  },
  data() {
    return {
      mode: "keyword",
      results: undefined,
      resultCount: undefined,
      pageCount: undefined
    }
  },
  mounted() {
    this.$refs.searchForm.value = this.keywords;
    this.mode = this.$refs.searchForm.mode;
    this.$watch(() => this.$refs.searchForm.mode, (v) => this.mode = v);
  },
  methods: {
    async onResultClick(hymn) {
      if (!hymn) return;
      try {
        let currentPath = this.$route.path;
        let newKeyword = this.$refs.searchForm.value;
        let currentPathNewKeyword = this.$router.resolve({ path: currentPath, query: { keywords: newKeyword.trim() }});
        this.$router.replace(currentPathNewKeyword);
      }
      catch {}
      
      await this.$nextTick();
      this.$router.push(hymn.url);
    }
  },
  watch: {
    $route: {
      async handler(value) {
        if (this.$route.name != "search") return;
        let keywords = this.keywords || this.$route.query.keywords;
        let page = this.page || this.$route.query.page;
        this.results = await this.$hymnsDb.search(keywords, page);
      },
      immediate: true
    },
    results(newValue) {
      ["resultCount", "perPage", "pageCount"].forEach(k => this[k] = newValue[k]);
      this.$forceUpdate();
    }
  },
  components: {
    Search
  }
};
</script>
 
<style scoped lang="scss">
/* --- SearchResults.vue --- */

.result {
  padding-top: var(--spacer-1);
  padding-bottom: calc(var(--spacer-2) - var(--line-height-extra-y-half));
  margin-bottom: var(--spacer-4);
  // border-left: var(--spacer-1) solid var(--ui-color);
  // padding-left: var(--spacer-2);
}

.result-preview {
  margin-bottom: 0;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow: hidden;
}

</style>