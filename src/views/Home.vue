<template>
  <nav id="primaryNav" class="scaled navbar navbar-expand-lg navbar-dark bg-primary">
    <div class="container flex-nowrap overflow-hidden">
      <button id="candle" class="btn flex-shrink-0 me-2">&nbsp;</button>
      <a class="navbar-brand flex-fill me-2">
        Gatherings in Jesus' Name
      </a>
      <button class="btn btn-fill"><svg class="icon"><use href="#text-options" /></svg></button>
    </div>
  </nav>
  <main>
    <div id="search-row" class="mt-0 pt-3 pb-3 mb-3 border-bottom">
      <div class="container">
        <h1 class="mb-3">Find a song</h1>
        <Search hide-label="true" />
      </div>
    </div>
    <div class="container">
      <h3 class="mb-3">Browse the songbooks</h3>
      <template v-for="hymnal of Object.values(hymnsDB.hymnals)">
        <p>
          <a :class="[hymnalClasses, `theme-${hymnal.hymnalId}`]">
            <span>{{ hymnal.title }}</span>
          </a>
        </p>
      </template>      
    </div>

  </main>
</template>

<script>
import Search from '../components/Search.vue';

export default {
  inject: ['hymnsDB'],
  data() {
    return {
      hymnalClasses: 'btn btn-lg btn-fill w-100',
    }
  },
  components: {
    Search
  }
};
</script>
 
<style  lang="scss">
/* --- Home.vue --- */
@import "../scss/bootstrap-base";

#candle {
  box-sizing: content-box;
  border-width: 0;
  width: 1em;
  background-image: url(../assets/candle.png);
  background-size: contain;
  background-repeat: no-repeat;
}

.navbar-brand {
  text-overflow: ellipsis;
}

main {
  padding-top: 0;
}

main a.btn-lg {
  text-align: left;
  white-space: normal;
}

#search-row {
  background-color: white;
  border-color: var(--gray-300);
}
</style>