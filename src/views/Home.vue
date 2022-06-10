<template>
  <nav id="primaryNav" class="navbar navbar-expand-lg navbar-dark bg-primary">
    <div class="container">
      <a class="navbar-brand">Songs</a>
      <button class="btn btn-fill"><svg class="icon"><use href="#text-options" /></svg></button>
    </div>
  </nav>
  <main>
    <div class="container">
      <Search />
    </div>
  </main>
</template>

<script>
import Search from '../components/Search.vue';

export default {
  inject: ['hymnsDB'],
  data() {
    /*
    return {
      hymns: this.hymns
    }
    */
   return {}
  },
  components: {
    Search
  }
};
</script>
 