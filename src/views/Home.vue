<script>
  import Search from '@/components/Search.vue';
  import HymnsDbProgress from '@/components/HymnsDbProgress.vue';
  
  export default {
    components: { Search, HymnsDbProgress },
    data() {
      return {
        hymnals: [],
      }
    },
    async mounted() {
      let hymnalsMap = await this.$hymnsDb.getHymnals();
      this.hymnals = hymnalsMap.values();
    }
  };
</script>

<template>
  <nav id="primaryNav" class="scaled navbar navbar-expand-lg navbar-dark bg-primary">
    <div class="container flex-nowrap overflow-hidden">
      <button id="candle" class="btn btn-outline flex-shrink-0 me-2">&nbsp;</button>
      <a class="navbar-brand flex-fill me-2 overflow-hidden">
        Gatherings in Jesus' Name
      </a>
      <button class="btn btn-fill"><svg class="icon"><use href="#text-options" /></svg></button>
    </div>
  </nav>
  <main>
    <div class="top-block">
      <div class="container">
        <h1>Find a song</h1>
        <Search :hide-label="true" />
      </div>
    </div>
    <div class="container">
      <h3 class="mb-3">Browse the songbooks</h3>
      <HymnsDbProgress progressProp="hymnals">
        <template v-for="hymnal of hymnals">
          <p>
            <router-link class="btn btn-lg btn-fill w-100" :class="`theme-${hymnal.hymnalId}`" :to="hymnal.url">
              <span>{{ hymnal.title }}</span>
            </router-link>
          </p>
        </template>
      </HymnsDbProgress>
    </div>

  </main>
</template>
 
<style  lang="scss">
/* --- Home.vue --- */
@import "../scss/bootstrap-base";

#candle {
  box-sizing: content-box;
  width: 1em;
  background-image: url(../assets/candle.png);
  background-size: contain;
  background-repeat: no-repeat;
}

@include mode("light") {
  #candle {
    border-width: 0;
  }
}

main {
  padding-top: 0;
}

main a.btn-lg {
  text-align: left;
  white-space: normal;
}

</style>