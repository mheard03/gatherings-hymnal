<template>
  <h1>Home</h1>
  <div style="text-align: left; font-size: 0.5rem; margin-left: 20px;">
    <pre style="margin-bottom: 3em">{{ JSON.stringify(hymn1, null, "  ") }}</pre>
    <pre style="margin-bottom: 3em">{{ JSON.stringify(hymn2, null, "  ") }}</pre>
    <pre>{{ JSON.stringify(hymn3, null, "  ") }}</pre>
  </div>
</template>

<script>
import hymns from '../assets/hymns-db';

export default {
  data() {
    return {
      hymns,
      hymn1: hymns["missions-1"],
      hymn2: hymns["supplement-66"],
      hymn3: hymns["supplement-144-A"],
    }
  },
}; 
</script>
 