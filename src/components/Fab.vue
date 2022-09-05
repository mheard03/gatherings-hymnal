<script>
export default {
  data() {
    return {
      windowMetrics: {
        scrollTop: document.scrollingElement.scrollTop,
        contentHeight: document.scrollingElement.scrollHeight,
        height: window.innerHeight
      },
      observer: undefined,
      animateText: false,
      expandMarkerVisible: false
    }
  },
  mounted() {
    this.observer = new IntersectionObserver((entries) => {
      this.expandMarkerVisible = entries[0].isIntersecting;
    });
    this.observer.observe(this.$refs.expandMarker);
    setTimeout(() => this.animateText = true, 500);
  },
  unmounted() {
    if (this.observer) this.observer.disconnect();
  },
  computed: {
    footerClass() {
      let classes = "";
      if (this.animateText) classes = "animated ";
      classes += ((this.expandMarkerVisible) ? "" : "hide-text");
      return classes;
    }
  }
}

</script>

<template>
  <nav id="nav-bottom" class="scaled">
    <div class="fab-wrapper invisible">
      <div class="d-flex justify-content-center">
        <button class="btn btn-fill btn-lg">&nbsp;</button>
      </div>
    </div>
    <div id="expand-marker" ref="expandMarker"></div>
    <div class="fab-wrapper" :class="footerClass" ref="fabFixed">
      <div class="d-flex justify-content-center">
        <button class="btn btn-fill btn-lg fab shadow"><svg class="icon"><use href="#hymnal" /></svg><span>Go to...</span></button>
      </div>
    </div>
  </nav>
</template>


<style scoped lang="scss">
/* --- Fab.vue --- */
#nav-bottom {
  width: 100%;
  min-height: var(--page-margin-bottom);
  padding-top: var(--bs-gutter-x);
  position: relative;
}
main + #nav-bottom {
  margin-top: calc(-1 * var(--page-margin-bottom));
}

#expand-marker {
  min-height: 1px;
  width: auto;
}

.fab-wrapper {
  width: 100%;
  margin-bottom: var(--bs-gutter-x);
  position: fixed;
  bottom: 0;

  span {
    max-width: 6em;
    overflow: hidden;
  }

  &.invisible {
    position: static;
  }

  &.hide-text {
    span {
      max-width: 0em;
    }
  }

  &.animated span {
    transition: max-width 0.5s;
  }
}
</style>
