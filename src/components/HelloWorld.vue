<script setup>
import { ref } from 'vue';

defineProps({
  msg: String,
});

const count = ref(0);
</script>

<template>
  <h1>{{ msg }}</h1>

  <p>
    Recommended IDE setup:
    <a href="https://code.visualstudio.com/" target="_blank">VS Code</a>
    &amp;
    <a href="https://github.com/johnsoncodehk/volar" target="_blank">Volar</a>
  </p>

  <p>
    <a href="https://vitejs.dev/guide/features.html" target="_blank">
      Vite Documentation
    </a>
    |
    <a href="https://v3.vuejs.org/" target="_blank">Vue 3 Documentation</a>
  </p>

  <button type="button" @click="count++">count is: {{ count }}</button>
  <p>
    Edit
    <code>components/HelloWorld.vue</code> to test hot module replacement.
  </p>

  <button
    type="button"
    class="btn btn-secondary"
    data-bs-container="body"
    data-bs-toggle="popover"
    data-bs-placement="top"
    data-bs-content="Top popover"
  >
    Popover on top
  </button>
  <button
    type="button"
    class="btn btn-secondary"
    data-bs-container="body"
    data-bs-toggle="popover"
    data-bs-placement="right"
    data-bs-content="Right popover"
  >
    Popover on right
  </button>
  <button
    type="button"
    class="btn btn-secondary"
    data-bs-container="body"
    data-bs-toggle="popover"
    data-bs-placement="bottom"
    data-bs-content="Bottom popover"
  >
    Popover on bottom
  </button>
  <button
    type="button"
    class="btn btn-secondary"
    data-bs-container="body"
    data-bs-toggle="popover"
    data-bs-placement="left"
    data-bs-content="Left popover"
  >
    Popover on left
  </button>
</template>
<script>
import { Popover } from 'bootstrap/dist/js/bootstrap.esm.min.js';
export default {
  mounted() {
    //init Popover
    Array.from(
      document.querySelectorAll('button[data-bs-toggle="popover"]')
    ).forEach((popoverNode) => new Popover(popoverNode));
  },
};
</script>

<style scoped>
a {
  color: #42b983;
}
</style>
