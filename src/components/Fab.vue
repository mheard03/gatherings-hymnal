  <script>
import { nextTick } from 'vue';

export default {
  data() {
    return {
      windowMetrics: {
        scrollTop: document.scrollingElement.scrollTop,
        contentHeight: document.scrollingElement.scrollHeight,
        height: window.innerHeight
      },
      footerMode: "fixed"
    }
  },
  onMounted() {
    window.addEventListener("scroll", this.onScroll);
    window.addEventListener("resize", this.onResize);
  },
  onUnmounted() {
    window.removeEventListener("scroll", this.onScroll);
    window.removeEventListener("resize", this.onResize);
  },
  computed: {
    scrollBottom() {
      return this.windowMetrics.contentHeight - (this.windowMetrics.scrollTop - this.windowMetrics.scrollHeight);
    }
  },
  methods: {
    onScroll() {
      this.windowMetrics.scrollTop = document.scrollingElement.scrollTop;
    },
    onResize() {
      this.windowMetrics.contentHeight = document.scrollingElement.scrollHeight;
      this.windowMetrics.height = window.innerHeight
    }
  }
}

</script>

<template>
  <nav id="navBottom">
    <div id="btnGotoWrapper" :class="footerMode">
      <div class="d-flex justify-content-center">
        <button id="btnGoto" class="scaled btn btn-fill btn-lg"><svg class="icon"><use href="#hymnal" /></svg><span>Go to...</span></button>
      </div>
    </div>
  </nav>
</template>


<style scoped lang="scss">
/* --- Fab.vue --- */
#btnGotoWrapper {
  width: 100%;
}
#btnGotoWrapper.fixed {
  position: fixed;
  bottom: var(--bs-gutter-x);
}
// @import "../scss/bootstrap-base";
</style>
