<template>
  <nav id="primaryNav" class="scaled navbar navbar-expand-lg">
    <div class="container">
      <button class="btn btn-ghost back" @click="$router.backOrDefault()"><svg class="icon"><use href="#back" /></svg></button>
      <!-- <button class="btn btn-ghost"><svg class="icon"><use href="#text-options" /></svg></button> -->
    </div>
  </nav>
  <main>
    <div id="hymnContainer" class="container" ref="hymnContainer">
      <HymnsDbProgress progressProp="hymns" loading="Loading hymn...">
        <template v-for="hymn of hymns" :key="hymn.hymnId">
          <section :id="hymn.suffix" :class="hymn.special">
            <h1 class="mb-4">{{ hymn.title }}</h1>
            <div class="lines">
              <template v-for="line of hymn.lines">
                <p :class="line.type" v-html="line.html"></p>
              </template>
              <p ref="dummyVerses" class="dummyVerse verse"></p>
            </div>
          </section>
        </template>
      </HymnsDbProgress>      
    </div>
  </main>
  <GoTo></GoTo>
</template>

<script>
import GoTo from '@/components/GoTo.vue';
import HymnsDbProgress from '@/components/HymnsDbProgress.vue';

export default {
  components: { GoTo, HymnsDbProgress },
  props: {
    hymnalId: { required: true },
    hymnNo: { required: true },
    suffix: { required: false }
  },
  data() {
    return {
      fontResizeObserver: undefined,
      hymns: []
    }
  },
  async mounted() {
    let oldMarkerWidth = -1;
    function onFontResize() {
      if (!this.$refs) return;
      let markerWidths = this.$refs.dummyVerses
        .map(dv => getComputedStyle(dv, '::marker').width)
        .map(w => parseFloat(w));
      markerWidths = Math.max(...markerWidths, 1);
      if (markerWidth) {
        if (markerWidth != oldMarkerWidth) {
          oldMarkerWidth = markerWidth;
          root.style.setProperty("--verse-indent", newValue + "px");
        }
      }
      else {
        root.style.removeProperty("--verse-indent");
      }
    }
    this.fontResizeObserver = new ResizeObserver(onFontResize);

    this.loadHymns();
  },
  unmounted() {
    this.fontResizeObserver.disconnect();
  },
  methods: {
    async loadHymns() {
      this.hymns = await this.$hymnsDb.getHymns(this.hymnalId, parseInt(this.hymnNo) || 1);
      await this.$nextTick();
  
      (this.$refs.dummyVerses || []).forEach(dv => this.fontResizeObserver.observe(dv));

      if (this.suffix || window.location.hash) {
        let id = this.suffix || window.location.hash.replace("#", "");
        if (id) {
          let el = document.getElementById(id);
          if (el) {
            el.scrollIntoView({ behavior: 'instant' });
          }
        }
      }
    }
  },
  watch: {
    hymnNo() { this.loadHymns(); },
    hymnalId() { this.loadHymns(); }
  }
};
</script>
 
<style scoped lang="scss">
/* --- Hymn.vue --- */
@import "../scss/bootstrap-base";

#hymnContainer {
  --verse-indent: 0.75rem;
}
/* 
main {
  // for the shadow H1
  overflow: hidden;
  position: relative;
}
*/
section {
  counter-reset: verse;
  position: relative;
  &:not(:first-of-type) > h1 {
    margin-top: 2rem;
  }
}
.lines {
  max-width: 40rem;
  --width: min(40rem, 100%);
  margin-left: calc((100% - var(--width)) / 4);
}
h1 {
  color: var(--ui-color);
  scroll-margin-top: 0.5rem;
}
p.lines {
  white-space: pre-line;
}
p.copyright {
  font-size: min(var(--font-size), 24px);
  line-height: 1;
  margin-top: 2.5em;
  margin-bottom: 0;
  color: var(--gray-600);
}


/* Verses */
section:not(.no-verses) {
  counter-reset: list-item;

  p.verse {
    position: relative;
  }
  p.verse:not(.numberless),
  p.chorus {
    border-left: 1px solid var(--gray-900);
    margin-left: var(--verse-indent);
    padding-left: 0.25rem;
  }
  p.verse {
    display: list-item;
    list-style-type: decimal;
    list-style-position: outside;
  }
  p.verse::marker {
    content: counter(list-item) " ";
    font-size: min(1rem, 64px);
  }
}

/* Chorus */
p.chorus {
  color: var(--ui-color);
}
p.verse + p.chorus {
  margin-top: -1rem;
  padding-top: 0.3rem;
  margin-bottom: 1.5rem;
}

/* Intro/outro */
p.intro, p.outro {
  font-style: italic;
}
p.intro {
  color: var(--chorus-color);
}

/* Dummy verse (for marker sizing) */
p.dummyVerse {
  position: absolute !important;
  visibility: hidden !important;
  left: 0;
  top: 0;
}
</style>