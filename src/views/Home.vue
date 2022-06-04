<template>
  <h1>Home</h1>
  {{ Object.keys(hymns).length }}
  <Search />
</template>

<script>
import Search from '../components/Search.vue';

export default {
  inject: ['hymns'],
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
 