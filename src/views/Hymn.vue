<template>
  <nav id="primaryNav" class="navbar navbar-expand-lg">
    <div class="container">
      <button class="btn btn-ghost back" @click="$router.go(-1)"><svg class="icon"><use href="#back" /></svg></button>
      <button class="btn btn-ghost"><svg class="icon"><use href="#text-options" /></svg></button>
    </div>
  </nav>
  <main>
    <div id="hymnContainer" class="container" ref="hymnContainer">
      <template v-for="hymn of hymns">
        <section :id="hymn.suffix" :class="hymn.special">
          <h1>{{ hymn.title }}</h1>
          <template v-for="line of hymn.lines">
            <p :class="line.type" v-html="line.html"></p>
          </template>
        </section>
      </template>
    </div>
  </main>
  <Fab></Fab>
</template>

<script>
import { nextTick } from 'vue';
import Fab from '../components/Fab.vue';

export default {
  props: {
    hymnal: { type: String, required: true },
    hymnNo: { type: Number, required: true }
  },
  inject: ['hymnsDB'],
  components: {
    Fab
  },
  data() {
    return {
      hymns: this.hymnsDB.getHymns(this.hymnal, this.hymnNo)
    }
  },
  mounted() {
    nextTick().then(() => {
      /* Scroll to second hymn, if needed */
      if (window.location.hash) {
        let id = window.location.hash.replace("#", "");
        if (id) {
          let el = document.getElementById(id);
          if (el) {
            el.scrollIntoView({ behavior: 'instant' });
          }
        }
      }

      /* Dynamic margins to support verse numbers */
      if (document.querySelector("p.verse")) {
        const root = this.$refs.hymnContainer;
        const dummyVerse = document.createElement("p");
        dummyVerse.className = "verse";
        dummyVerse.style.position = "absolute";
        dummyVerse.style.visibility = "hidden";
        dummyVerse.style.left = 0;
        dummyVerse.style.top = 0;
        document.body.append(dummyVerse);
        let oldMarkerWidth = 0;

        function onFontResize() {
          let markerWidth = getComputedStyle(dummyVerse, '::marker').width;
          markerWidth = parseFloat(markerWidth);
          if (markerWidth != oldMarkerWidth) {
            root.style.setProperty("--verse-indent", markerWidth + "px");
            oldMarkerWidth = markerWidth;
          }
        }

        const fontResizeObserver = new ResizeObserver(onFontResize);
        fontResizeObserver.observe(dummyVerse);
      }
    })
  }
};
</script>
 
<style lang="scss">
/* --- Hymn.vue --- */
@import "../scss/bootstrap-base";

#primaryNav button.back {
  margin-left: calc(-1 * $btn-padding-x)
}

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
  &:not(:first-of-type) > h1 {
    margin-top: 2rem;
  }
}
h1 {
  color: var(--ui-color);
  scroll-margin-top: 0.5rem;
}
/*
h1 {
  font-family: sans-serif;
  margin-top: 0;
  margin-bottom: 0.5rem;
  color: var(--ui-color);
  font-size: 1.5rem;
  scroll-margin-top: 0.5rem;
}
p {
  line-height: 1.2;
  margin: 1rem 0;
}
*/
h1 + p {
  margin-top: 0;
}
p.lines {
  white-space: pre-line;
}
p.copyright {
  font-size: max(16px, 0.25rem);
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
</style>